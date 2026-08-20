import { randomUUID } from 'crypto';
import { ChromaClient, type Collection } from 'chromadb';
import { config } from '../utils/config';
import { embedTexts } from './ollamaClient';

/**
 * Embeds `chunks` (via a local Ollama model) and loads them into a fresh
 * local Chroma collection with a unique name per call, so concurrent specs
 * calling this in parallel (Playwright's `fullyParallel`) each get their own
 * isolated collection instead of racing on a shared one.
 * Requires a Chroma server running locally (defaults to http://localhost:8000
 * — override via CHROMA_HOST/CHROMA_PORT) and Ollama running locally with
 * the embedding model pulled (`ollama pull nomic-embed-text`).
 */
export async function createVectorDB(chunks: string[]): Promise<Collection> {
  const client = new ChromaClient({ host: config.chroma.host, port: config.chroma.port });
  const collectionName = `rag-local-testing-${randomUUID()}`;

  // embeddingFunction: null — we supply pre-computed embeddings via add()
  // below, so Chroma shouldn't try to load its own default embedder.
  const collection = await client.createCollection({ name: collectionName, embeddingFunction: null });

  const embeddings = await embedTexts(chunks);
  await collection.add({
    ids: chunks.map((_, index) => `chunk-${index}`),
    embeddings,
    documents: chunks,
  });

  return collection;
}
