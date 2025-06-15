import { NextResponse } from 'next/server'
import { groq } from 'groq-js';
import { QdrantClient } from '@qdrant/js-client-rest'

const systemPrompt = `
You are a helpful professor rating assistant that answers questions based on previous student reviews. Use the context provided to form your answers.
`

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const EMBEDDING_URL = 'https://api.groq.com/openai/v1/embeddings'

const GROQ_API_KEY = process.env.GROQ_API_KEY
const QDRANT_URL = process.env.QDRANT_URL
const QDRANT_API_KEY = process.env.QDRANT_API_KEY
const COLLECTION_NAME = 'ai-rate-my-prof'  // <-- update if different

async function getEmbedding(text) {
  const res = await fetch(EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002'  // Check which models Groq supports
    })
  });

  if (!res.ok) {
    throw new Error('Failed to get embedding');
  }

  const json = await res.json();
  return json.data[0].embedding;
}


export async function POST(req) {
  const data = await req.json();
  const lastMessage = data[data.length - 1];


  // Search Qdrant
  const queryEmbedding = await getEmbedding(lastMessage.content);

  const searchResults = await qdrant.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    top: 3,
    with_payload: true,
  });

  const contextText = searchResults.map(
    (item, i) => `(${i + 1}) ${item.payload?.text || 'No review found'}`
  ).join('\n');

  const prompt = `Use the following professor reviews to answer the user's query.\n\n${contextText}\n\nUser: ${lastMessage.content}`;

  const stream = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful professor rating assistant. Be specific and concise.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const encoder = new TextEncoder();
  const streamBody = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(streamBody);
}
