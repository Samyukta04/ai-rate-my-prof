import { NextResponse } from 'next/server'

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, answer using your knowledge base.
`

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function POST(req) {
  const data = await req.json()
  const lastMessage = data[data.length - 1]

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
        ...data.slice(0, data.length - 1),
        { role: 'user', content: lastMessage.content },
      ],
      stream: true,
    }),
  })

  // Stream the response to the client
  return new NextResponse(groqRes.body)
}