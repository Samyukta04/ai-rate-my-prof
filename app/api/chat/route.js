import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { QdrantClient } from '@qdrant/js-client-rest'

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})

const QDRANT_URL = process.env.QDRANT_URL
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const COLLECTION_NAME = 'ai-rate-my-prof'

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
})

import { pipeline } from '@xenova/transformers'

// Load once globally (avoid reloading the model on every request)
let embedder = null

async function getEmbedding(text) {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const output = await embedder(text, {
    pooling: 'mean', // get one vector
    normalize: true, // unit length
  });

  return Array.from(output.data); // convert from Tensor to plain array
}



export async function POST(req) {
  const data = await req.json()
  const lastMessage = data[data.length - 1]

  const queryEmbedding = await getEmbedding(lastMessage.content)

  const searchResults = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    top: 3,
    with_payload: true,
  })

  const contextText = searchResults.map(
    (item, i) => `(${i + 1}) ${item.payload?.text || 'No review found'}`
  ).join('\n')

  const prompt = `Use the following professor reviews to answer the user's query.\n\n${contextText}\n\nUser: ${lastMessage.content}`

  const stream = await openai.chat.completions.create({
    model: 'llama3-8b-8192',
    stream: true,
    messages: [
      { role: 'system', content: 'You are a helpful professor rating assistant. Be specific and concise.' },
      { role: 'user', content: prompt },
    ],
  })

  const encoder = new TextEncoder()
  const streamBody = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content
        if (content) {
          controller.enqueue(encoder.encode(content))
        }
      }
      controller.close()
    }
  })

  return new NextResponse(streamBody)
}
