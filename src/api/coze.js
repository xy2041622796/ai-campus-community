const WORKFLOW_ID = '7656724184508792895'

// 开发环境用 Vite proxy，生产环境用 Vercel API 路由
const API_URL = import.meta.env.DEV ? '/coze/v1/workflow/stream_run' : '/api/coze'

export async function analyzePost(content) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        import.meta.env.DEV
          ? { workflow_id: WORKFLOW_ID, parameters: { input: content } }
          : { content }
      )
    })

    if (!res.ok) {
      console.error('[Coze] HTTP error:', res.status)
      return null
    }

    if (import.meta.env.DEV) {
      // 开发环境：解析 SSE 流
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
      // 生产环境：直接 JSON 响应
      const data = await res.json()
      return data
    }
  } catch (e) {
    console.error('[Coze] 分析失败:', e)
    return null
  }
}
