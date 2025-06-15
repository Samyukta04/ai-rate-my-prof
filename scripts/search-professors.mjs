import 'dotenv/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { HuggingFaceTransformersEmbeddings } from 'langchain/embeddings/hf_transformers';
import { QdrantVectorStore } from 'langchain/vectorstores/qdrant';
import readline from 'readline';

// Setup CLI prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main search logic
async function searchProfessors(query) {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: 'Xenova/all-MiniLM-L6-v2',
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      client,
      collectionName: 'ai-rate-my-prof',
    }
  );

  const results = await vectorStore.similaritySearch(query, 5); // top 5 results

  console.log("\n🔍 Top professor matches for:", query);
  results.forEach((result, idx) => {
    const meta = result.metadata;
    console.log(`\n${idx + 1}. ${meta.name} (${meta.subject})`);
    console.log(`   ➤ Review: ${meta.text}`);
  });
}

rl.question("Ask me about a professor: ", async (userQuery) => {
  await searchProfessors(userQuery);
  rl.close();
});
