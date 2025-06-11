import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`

const GROQ_API_KEY = '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'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_EMBED_URL = 'https://api.groq.com/openai/v1/embeddings'

export async function POST(req) {
  const data = await req.json()
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  })

  const index = pc.index('rag').namespace('ns1')
  const text = data[data.length - 1].content

  // Get embedding from Groq
  const embeddingRes = await fetch(GROQ_EMBED_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  })
  const embeddingData = await embeddingRes.json()
  const embedding = embeddingData.data[0].embedding

  // Query Pinecone
  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding,
  })

  let resultString = ''
  results.matches.forEach((match) => {
    resultString += `
    Returned Results:
    Professor: ${match.id}
    Review: ${match.metadata.stars}
    Subject: ${match.metadata.subject}
    Stars: ${match.metadata.stars}
    \n\n`
  })
  const lastMessage = data[data.length - 1]
  const lastMessageContent = lastMessage.content + resultString
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1)

  // Call Groq chat completion endpoint (streaming)
  const groqRes = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192', // or another Groq-supported model
      messages: [
        { role: 'system', content: systemPrompt },
        ...lastDataWithoutLastMessage,
        { role: 'user', content: lastMessageContent },
      ],
      stream: true,
    }),
  })

  // Stream the response to the client
  const stream = groqRes.body
  return new NextResponse(stream)
}