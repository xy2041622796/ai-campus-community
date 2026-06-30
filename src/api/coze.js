import { CozeAPI } from '@coze/api'

const WORKFLOW_ID = '7656724184508792895'
const TOKEN = import.meta.env.VITE_COZE_TOKEN || 'cztei_qGXfIVRCZgdvy0i5LOcHBhyW5vScE5jytKRKwiCbxge4wVC1cp41XVlbyF3IV4DgO'

const coze = new CozeAPI({
  token: TOKEN,
  baseURL: 'https://api.coze.cn'
})

export async function analyzePost(content) {
  try {
    const stream = coze.workflows.runs.stream({
      workflow_id: WORKFLOW_ID,
      parameters: { input: content }
    })

    let result = null
    for await (const event of stream) {
      if (event && event.data && event.data.content) {
        // content 是 JSON 字符串，如 '{"output":{"intent":"分享",...}}'
        const parsed = JSON.parse(event.data.content)
        result = parsed.output || parsed
      }
    }
    return result
  } catch (e) {
    console.error('[Coze] 分析失败:', e)
    return null
  }
}
