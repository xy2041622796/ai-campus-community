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
        { role: 'system', content: '根据用户的帖子内容，推荐3-5个最相关的标签。只返回JSON数组格式，例如：[“标签1”,“标签2”,“标签3”]。不要加任何解释。' },
        { role: 'user', content: text }
      ],
      max_tokens: 200,
      temperature: 0.3
    })
  })

  if (!agnesRes.ok) {
    const err = await agnesRes.text()
    return new Response(JSON.stringify({ error: 'AI service error', detail: err }), { status: 502 })
  }

  const data = await agnesRes.json()
  const raw = data.choices?.[0]?.message?.content || '[]'
  let tags
  try {
    tags = JSON.parse(raw)
  } catch {
    tags = raw.split(/[,,、]/).map(t => t.trim()).filter(Boolean).slice(0, 5)
  }

  return new Response(JSON.stringify({ tags }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

export const config = { runtime: 'edge' }
