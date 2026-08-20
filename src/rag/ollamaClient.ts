import axios from 'axios';
import { config } from '../utils/config';

/** Embeds one or more texts via a local Ollama server (`ollama pull nomic-embed-text`). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await axios.post(`${config.ollama.url}/api/embed`, {
    model: config.ollama.embedModel,
    input: texts,
  });
  return response.data.embeddings;
}

/** Sends a single-turn prompt to a local Ollama model (`ollama pull llama3`) and returns the text response. */
export async function askOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await axios.post(`${config.ollama.url}/api/generate`, {
    model: config.ollama.generateModel,
    system: systemPrompt,
    prompt: userPrompt,
    stream: false,
  });
  return response.data.response;
}
