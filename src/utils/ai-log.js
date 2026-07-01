import { supabase } from '@/api/supabase'

/**
 * 记录 AI 调用日志
 * @param {Object} log - 日志数据
 * @param {string} log.service - 服务名 ('coze' | 'agnes' | 'moderation')
 * @param {string} log.action - 操作名 ('analyze_post' | 'generate_tags' | 'moderate' | 'generate_digest')
 * @param {number} log.latencyMs - 延迟（毫秒）
 * @param {boolean} log.success - 是否成功
 * @param {string} [log.errorMessage] - 错误信息
 * @param {Object} [log.metadata] - 额外数据
 */
export async function logAICall({ service, action, latencyMs, success, errorMessage, metadata }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('ai_logs').insert({
      user_id: user?.id || null,
      service,
      action,
      latency_ms: latencyMs,
      success,
      error_message: errorMessage || null,
      metadata: metadata || null
    })
  } catch (e) {
    console.warn('[AILog] 写入日志失败:', e)
  }
}

/**
 * 包装 AI 调用，自动记录日志
 * @param {Function} fn - AI 调用函数
 * @param {string} service - 服务名
 * @param {string} action - 操作名
 * @param {Object} [metadata] - 额外数据
 * @returns {Promise<*>} - AI 调用结果
 */
export async function withAILog(fn, service, action, metadata = {}) {
  const start = Date.now()
  let success = true
  let errorMessage = null
  let result = null

  try {
    result = await fn()
    return result
  } catch (e) {
    success = false
    errorMessage = e.message || 'Unknown error'
    throw e
  } finally {
    const latencyMs = Date.now() - start
    logAICall({ service, action, latencyMs, success, errorMessage, metadata })
  }
}

/**
 * 查询 AI 调用统计
 * @param {number} days - 查询天数
 * @returns {Promise<Array>} - 统计数据
 */
export async function getAIStats(days = 7) {
  try {
    const { data, error } = await supabase
      .from('ai_logs')
      .select('service, action, success, latency_ms, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // 按服务和操作统计
    const stats = {}
    for (const log of data || []) {
      const key = `${log.service}:${log.action}`
      if (!stats[key]) {
        stats[key] = { service: log.service, action: log.action, total: 0, success: 0, error: 0, totalLatency: 0 }
      }
      stats[key].total++
      if (log.success) stats[key].success++
      else stats[key].error++
      stats[key].totalLatency += log.latency_ms || 0
    }

    return Object.values(stats).map(s => ({
      ...s,
      avgLatency: s.total > 0 ? Math.round(s.totalLatency / s.total) : 0,
      successRate: s.total > 0 ? ((s.success / s.total) * 100).toFixed(1) : '0'
    }))
  } catch (e) {
    console.error('[AILog] 查询统计失败:', e)
    return []
  }
}



// === 安全 AI 调用（带重试 + 超时 + JSON 校验）===

/**
 * 安全的 AI 调用封装
 * 自动处理：超时、重试、JSON 校验、日志记录
 * 
 * @param {Function} fetchFn - 实际的 fetch 调用函数
 * @param {Object} options - 配置选项
 * @param {string} options.service - 服务名
 * @param {string} options.action - 操作名
 * @param {number} [options.timeout=30000] - 超时时间（毫秒）
 * @param {number} [options.retries=2] - 重试次数
 * @param {Function} [options.validator] - JSON 校验函数，返回 true/false
 * @returns {Promise<*>} - 解析后的 JSON 结果
 */
export async function safeAICall(fetchFn, {
  service = 'unknown',
  action = 'unknown',
  timeout = 30000,
  retries = 2,
  validator = null
} = {}) {
  const start = Date.now()
  let lastError = null
  let attempt = 0

  while (attempt <= retries) {
    attempt++
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      const res = await fetchFn({ signal: controller.signal })
      clearTimeout(timer)

      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${errText.slice(0, 100)}`)
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || data.data || ''
      const cleaned = String(raw).replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()

      // JSON 校验
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        // 尝试提取 JSON 块
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0])
          } catch (e) {
            throw new Error(`JSON 解析失败: ${cleaned.slice(0, 100)}`)
          }
        } else {
          throw new Error(`未找到有效 JSON: ${cleaned.slice(0, 100)}`)
        }
      }

      // 自定义校验
      if (validator && !validator(parsed)) {
        throw new Error('JSON 校验未通过')
      }

      const latencyMs = Date.now() - start
      logAICall({
        service,
        action,
        latencyMs,
        success: true,
        metadata: { attempt, retries }
      })

      return parsed
    } catch (e) {
      lastError = e
      const latencyMs = Date.now() - start

      if (attempt > retries) {
        // 所有重试都失败
        logAICall({
          service,
          action,
          latencyMs,
          success: false,
          errorMessage: e.message,
          metadata: { attempt, retries }
        })
        throw e
      }

      // 等待后重试（指数退避）
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

/**
 * Agnes AI 专用调用
 * @param {string} prompt - 用户提示
 * @param {Object} options - 额外配置
 * @returns {Promise<*>} - 解析后的结果
 */
export async function agnesCall(prompt, options = {}) {
  return safeAICall(
    ({ signal }) => fetch('/agnes/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'agnes-2.0-flash',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal
    }),
    { service: 'agnes', ...options }
  )
}

/**
 * Coze Workflow 专用调用
 * @param {string} content - 输入内容
 * @param {Object} options - 额外配置
 * @returns {Promise<*>} - 解析后的结果
 */
export async function cozeCall(content, options = {}) {
  const API_URL = import.meta.env.DEV
    ? '/coze/v1/workflow/stream_run'
    : '/api/coze'

  if (import.meta.env.DEV) {
    // 开发环境：解析 SSE 流
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: '7656724184508792895',
        parameters: { input: content }
      })
    })
    if (!res.ok) throw new Error(`Coze HTTP ${res.status}`)
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
    }
    for (const line of buffer.split('\n')) {
      if (line.startsWith('data:')) {
        try {
          const eventData = JSON.parse(line.slice(5).trim())
          if (eventData && eventData.content) {
            const parsed = JSON.parse(eventData.content)
            return parsed.output || parsed
          }
        } catch {}
      }
    }
    return null
  } else {
    // 生产环境：JSON 响应
    return safeAICall(
      ({ signal }) => fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal
      }),
      { service: 'coze', ...options }
    )
  }
}
