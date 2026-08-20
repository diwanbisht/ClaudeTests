import Anthropic from '@anthropic-ai/sdk';
import { config } from '../utils/config';

let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.claude.apiKey() });
  }
  return client;
}

interface HealInput {
  locatorName:      string;
  originalSelector: string;
  pageSource:       string;
  pageUrl:          string;
}

export async function healWithClaude(input: HealInput) {
  const prompt = `
You are a Playwright locator repair expert.

A test locator has BROKEN because the web app changed between builds.

BROKEN LOCATOR:
- Name: ${input.locatorName}
- Original selector: ${input.originalSelector}
- Page URL: ${input.pageUrl}

LIVE PAGE HTML (truncated to relevant section):
${input.pageSource.slice(0, 12000)}

TASK:
1. Find the element this locator was likely targeting
2. Suggest the best replacement selector
3. Prefer: data-testid > aria-label > role > text > CSS class

Respond ONLY with this JSON (no markdown):
{
  "healed": true,
  "newSelector": "[data-testid='new-value']",
  "confidence": 0.95,
  "reason": "Found same element with updated data-testid attribute"
}

If you cannot find a confident match, respond:
{
  "healed": false,
  "newSelector": null,
  "confidence": 0,
  "reason": "Element not found in DOM — may have been removed"
}
`;

  const response = await getClient().messages.create({
    model:      'claude-opus-4-6',
    max_tokens: 500,
    messages:   [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { healed: false, newSelector: null, confidence: 0 };
  }
}