import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../utils/config';

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.claude.apiKey() });
  }
  return client;
}

/** Sends a single-turn prompt to Claude and returns the text response. */
export async function askClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
): Promise<string> {
  const response = await getClient().messages.create({
    model: config.claude.model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude response contained no text content');
  }
  return textBlock.text;
}

/** Same as askClaude but parses the response as JSON, stripping markdown code fences if present. */
export async function askClaudeForJson<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
): Promise<T> {
  const text = await askClaude(systemPrompt, userPrompt, maxTokens);
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  return JSON.parse(cleaned) as T;
}
