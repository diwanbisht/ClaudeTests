import axios from 'axios';
import { ChromaClient, type Collection } from 'chromadb';
import fs from 'fs';
import path from 'path';
import { config } from '../utils/config';
import { chunkText } from '../utils/chunker';
import { embedTexts } from './ollamaClient';

/**
 * Framework-internal RAG (see .claude/skills/framwork/aI-test-architecture.md §15):
 * a small, persistent knowledge base built from this repo's own manual test
 * cases, used to *ground* AI test generation instead of generating from a
 * bare requirement with no awareness of existing coverage/conventions.
 *
 * This is deliberately best-effort: Ollama/Chroma are local, optional
 * dependencies. Every entry point here degrades to "no context" rather than
 * throwing, so `generate:tests` keeps working the same as before when a
 * developer hasn't got the local RAG stack running.
 */

const COLLECTION_NAME = 'framework-knowledge-base';
const MANUAL_TESTS_DIR = path.resolve('src/tests/manualTests');

/** Soft health check — never throws, just reports availability. */
async function isRagStackAvailable(): Promise<boolean> {
  try {
    await axios.get(config.ollama.url, { timeout: 2000 });
  } catch {
    console.warn('[RAG-KB] Ollama not reachable — skipping RAG grounding for this run.');
    return false;
  }

  try {
    await axios.get(`http://${config.chroma.host}:${config.chroma.port}/api/v2/heartbeat`, {
      timeout: 2000,
    });
  } catch {
    console.warn('[RAG-KB] Chroma not reachable — skipping RAG grounding for this run.');
    return false;
  }

  return true;
}

/** Reads every manual-test-case markdown file in src/tests/manualTests/ and chunks it. */
function loadManualTestCaseChunks(): { id: string; text: string }[] {
  if (!fs.existsSync(MANUAL_TESTS_DIR)) return [];

  const files = fs.readdirSync(MANUAL_TESTS_DIR).filter((f) => f.endsWith('.md'));
  const chunks: { id: string; text: string }[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(MANUAL_TESTS_DIR, file), 'utf-8');
    chunkText(raw).forEach((text, index) => {
      chunks.push({ id: `${file}::${index}`, text });
    });
  }

  return chunks;
}

/**
 * (Re)builds the framework knowledge base from the manual test cases
 * currently on disk. Re-embeds from scratch each call rather than a
 * one-time snapshot, per the "lifecycle management" guidance in §15 — cheap
 * enough for this repo's current volume of manual test cases.
 * Returns false (no-op) if the local RAG stack isn't reachable.
 */
export async function rebuildKnowledgeBase(): Promise<boolean> {
  if (!(await isRagStackAvailable())) return false;

  const chunks = loadManualTestCaseChunks();
  if (chunks.length === 0) {
    console.warn(
      '[RAG-KB] No manual test cases found under src/tests/manualTests/ — nothing to index.',
    );
    return false;
  }

  const client = new ChromaClient({ host: config.chroma.host, port: config.chroma.port });

  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
  } catch {
    // collection didn't exist yet — fine
  }

  const collection = await client.createCollection({
    name: COLLECTION_NAME,
    embeddingFunction: null,
  });
  const embeddings = await embedTexts(chunks.map((c) => c.text));

  await collection.add({
    ids: chunks.map((c) => c.id),
    embeddings,
    documents: chunks.map((c) => c.text),
  });

  console.log(
    `[RAG-KB] Indexed ${chunks.length} chunk(s) from ${MANUAL_TESTS_DIR} into "${COLLECTION_NAME}".`,
  );
  return true;
}

/**
 * Retrieves the top-k most similar existing manual-test-case chunks for
 * `queryText` (typically a new requirement's summary + description), so the
 * generator can be told "here's what already exists" instead of generating
 * blind. Returns an empty string if the RAG stack or the knowledge base
 * itself is unavailable — callers should treat that as "no grounding" and
 * proceed exactly as before.
 */
export async function retrieveSimilarTestCases(
  queryText: string,
  topK: number = 3,
): Promise<string> {
  if (!(await isRagStackAvailable())) return '';

  const client = new ChromaClient({ host: config.chroma.host, port: config.chroma.port });

  let collection: Collection;
  try {
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: null,
    });
    const count = await collection.count();
    if (count === 0) {
      const built = await rebuildKnowledgeBase();
      if (!built) return '';
      collection = await client.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: null,
      });
    }
  } catch (error) {
    console.warn('[RAG-KB] Could not open knowledge base collection — skipping grounding:', error);
    return '';
  }

  const [queryEmbedding] = await embedTexts([queryText]);
  const results = await collection.query({ queryEmbeddings: [queryEmbedding], nResults: topK });
  const matches = (results.documents?.[0] ?? []).filter((doc): doc is string => doc !== null);

  return matches.join('\n\n---\n\n');
}
