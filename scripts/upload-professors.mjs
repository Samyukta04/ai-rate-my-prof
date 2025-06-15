import 'dotenv/config';
import { QdrantClient } from '@qdrant/js-client-rest';
import { HuggingFaceTransformersEmbeddings } from "langchain/embeddings/hf_transformers";
import { QdrantVectorStore } from "langchain/vectorstores/qdrant";

// 1. Your data
const professors = [
  {
    id: "1",
    name: "Prof. Smith",
    subject: "Math",
    text: "Prof. Smith is a great teacher for Math 101."
  },
  {
    id: "2",
    name: "Prof. Johnson",
    subject: "Physics",
    text: "Prof. Johnson explains physics concepts very clearly."
  },
  { 
    id: "3", name: "Prof. Patel", 
    subject: "Computer Science", 
    text: "She makes data structures so easy to understand!" },
  { id: "4", name: "Prof. Thompson", subject: "English", text: "Gives amazing feedback on essays and encourages creative thinking." },
  { id: "5", name: "Prof. Liang", subject: "History", text: "Tells fascinating stories that make history come alive." },
  { id: "6", name: "Prof. Davis", subject: "Mathematics", text: "Very detail-oriented. Great for students who like structure." },
  { id: "7", name: "Prof. Singh", subject: "Mechanical Engineering", text: "Makes thermodynamics surprisingly fun!" },
  { id: "8", name: "Prof. Fernandez", subject: "Psychology", text: "Super friendly and loves class discussions." },
  { id: "9", name: "Prof. Nakamura", subject: "Physics", text: "Has deep knowledge but speaks very fast." },
  { id: "10", name: "Prof. Williams", subject: "Business", text: "Real-world case studies and group work — never a boring lecture!" },
  { id: "11", name: "Prof. Ahmad", subject: "Biology", text: "Best professor if you love research. Lab sessions are amazing!" },
  { id: "12", name: "Prof. Kim", subject: "Economics", text: "Explains tough concepts like game theory with real examples." },
  { id: "13", name: "Prof. Taylor", subject: "Philosophy", text: "Makes you think beyond the textbook. Super inspiring." },
  { id: "14", name: "Prof. Osei", subject: "Political Science", text: "Brings in current affairs and makes every class relevant." },
  { id: "15", name: "Prof. Romanov", subject: "Art", text: "Very chill but pushes you to explore your creative limits." },
  { id: "16", name: "Prof. Mehta", subject: "Chemistry", text: "Tough grading but you’ll learn a LOT if you pay attention." },
  { id: "17", name: "Prof. Garcia", subject: "Sociology", text: "Open-minded, encourages diverse opinions." },
  { id: "18", name: "Prof. Zhou", subject: "Statistics", text: "Makes R and Python feel like second nature." },
  { id: "19", name: "Prof. Anand", subject: "AI/ML", text: "Explains concepts with intuition before diving into code." },
  { id: "20", name: "Prof. Lopez", subject: "Environmental Science", text: "Super passionate about sustainability. Inspires action." }
];

  // Add more professors here...


// 2. Main function
async function main() {
  // Set up Qdrant client
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  console.log("Loading HuggingFace local embedding model...");
  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2", // local + lightweight + accurate
  });

  // Prepare texts and metadatas
  const texts = professors.map(p => p.text);
  const metadatas = professors.map(p => ({
    id: p.id,
    name: p.name,
    subject: p.subject,
    text: p.text,
  }));

  // Upload to Qdrant
  await QdrantVectorStore.fromTexts(
    texts,
    metadatas,
    embeddings,
    {
      client,
      collectionName: "ai-rate-my-prof",
    }
  );

  console.log("✅ Uploaded all professors to Qdrant!");
}

main();
