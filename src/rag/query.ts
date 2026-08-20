import type { Collection } from 'chromadb';
import { embedTexts } from './ollamaClient';

/**
 * Embeds `question` (via a local Ollama model), runs a similarity search
 * against `db`, and returns the top-matching chunks joined into a single
 * context string for askOllama.
 */
export async function queryRAG(db: Collection, question: string, topK: number = 4): Promise<string> {
  const [queryEmbedding] = await embedTexts([question]);

  const results = await db.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
  });

  const matches = results.documents?.[0] ?? [];
  return matches.filter((doc): doc is string => doc !== null).join('\n\n');
}
