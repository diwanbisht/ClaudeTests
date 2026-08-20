// src/utils/chunker.ts

/**
 * Splits large text into smaller chunks for embedding
 * Important for RAG (better retrieval accuracy)
 */

export function chunkText(
  text: string,
  chunkSize: number = 500,
  overlap: number = 100
): string[] {
  const chunks: string[] = [];

  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = startIndex + chunkSize;

    const chunk = text.slice(startIndex, endIndex).trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move forward with overlap
    startIndex += chunkSize - overlap;
  }

  return chunks;
}