// Vercel Serverless Function - Coze API 代理
// 生产环境下替代 Vite proxy，避免 CORS 和 token 泄露

const COZE_API = 'https://api.coze.cn/v1/workflow/stream_run'
const WORKFLOW_ID = '7656724184508792895'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content } = req.body || {}
  if (!content) {
    return res.status(400).json({ error: 'Missing content' })
  }

  const token = process.env.VITE_COZE_TOKEN
  if (!token) {
    return res.status(500).json({ error: 'Coze token not configured' })
  }

  try {
    const cozeRes = await fetch(COZE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        parameters: { input: content }
      })
    })

    if (!cozeRes.ok) {
      const errText = await cozeRes.text()
      console.error('[Coze Proxy] API error:', cozeRes.status, errText)
      return res.status(502).json({ error: 'Coze API error' })
    }

    // 读取 SSE 流
    const reader = cozeRes.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
    }

    // 解析 SSE 事件
    for (const line of buffer.split('\n')) {
      if (line.startsWith('data:')) {
        try {
          const eventData = JSON.parse(line.slice(5).trim())
          if (eventData && eventData.content) {
            const parsed = JSON.parse(eventData.content)
            return res.json(parsed.output || parsed)
          }
        } catch {}
      }
    }

    return res.status(502).json({ error: 'Failed to parse Coze response' })
  } catch (e) {
    console.error('[Coze Proxy] Error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
