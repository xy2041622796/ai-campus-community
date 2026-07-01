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
