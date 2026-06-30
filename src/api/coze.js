const WORKFLOW_ID = '7656724184508792895'

export async function analyzePost(content) {
  try {
    const res = await fetch('/coze/v1/workflow/stream_run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        parameters: { input: content }
      })
    })

    if (!res.ok) {
      console.error('[Coze] HTTP error:', res.status)
      return null
    }

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
  } catch (e) {
    console.error('[Coze] 分析失败:', e)
    return null
  }
}
