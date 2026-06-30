// 使用 Agnes AI 分析（稳定，无需维护 token）
export async function analyzePost(content) {
  try {
    const res = await fetch('/agnes/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [{
          role: 'user',
          content: '你是校园社区AI分析助手。请分析以下帖子内容，返回JSON格式：\n{\n  "intent": "分享|求助|吐槽|招募|交易",\n  "emotion": "positive|negative|neutral",\n  "topics": ["话题1", "话题2", "话题3"],\n  "summary": "一句话总结，20字以内"\n}\n\n帖子内容：' + content + '\n\n只返回JSON，不要任何解释。'
        }]
      })
    })
    if (!res.ok) return null
    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content || '{}'
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('[AI] 分析失败:', e)
    return null
  }
}
