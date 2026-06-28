export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { text } = await req.json()
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 })
  }

  const agnesRes = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.AGNES_API_KEY
    },
    body: JSON.stringify({
      model: 'agnes-2.0-flash',
      messages: [
        { role: 'system', content: '你是一个校园社区助手。润色用户的帖子内容，使其更通顺、更吸引人。保持原意和风格，只优化表达，不改变事实。直接返回润色后的文本，不要加任何解释。' },
        { role: 'user', content: text }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  })

  if (!agnesRes.ok) {
    const err = await agnesRes.text()
    return new Response(JSON.stringify({ error: 'AI service error', detail: err }), { status: 502 })
  }

  const data = await agnesRes.json()
  const polished = data.choices?.[0]?.message?.content || text

  return new Response(JSON.stringify({ polished }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = { runtime: 'edge' }
