export default async function handler(req) {
  // Agnes AI does not currently provide an embedding API.
  // To enable semantic search, you can:
  // 1. Use OpenAI text-embedding-3-small via a separate key
  // 2. Use a free embedding API like Jina AI (free tier available)
  // Update the fetch URL and model below when ready.
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const { text } = await req.json()
  if (!text?.trim()) {
    return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 })
  }

  // TODO: Replace with an embedding-capable API
  // Example using Jina AI free embedding API:
  // const res = await fetch('https://api.jina.ai/v1/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + process.env.JINA_API_KEY
  //   },
  //   body: JSON.stringify({ model: 'jina-embeddings-v3', input: text })
  // })

  return new Response(JSON.stringify({ 
    error: 'Embedding API not configured',
    note: 'Agnes AI does not provide embeddings. Use Jina AI (free) or OpenAI instead.'
  }), { status: 501 })
}

export const config = { runtime: 'edge' }
