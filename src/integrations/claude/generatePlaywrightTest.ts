import { ManualTestCase } from '../jira/xrayClient';
import { askClaude } from './claudeClient';

const SYSTEM_PROMPT = `You are a senior SDET writing Playwright tests in TypeScript for an existing
framework. Rules:
- Import { test, expect } from '../fixtures/test-fixtures' (relative to src/tests/generated/*.spec.ts).
- Use existing Page Object fixtures (e.g. loginPage) instead of raw page.locator calls whenever
  a suitable page object/method already exists in the provided inventory.
- If no existing page object method fits a step, add a clearly named TODO comment instead of
  inventing a new page object class.
- Output ONLY the raw .spec.ts file contents. No markdown fences, no prose.`;

/**
 * Uses Claude to turn manual test cases into a Playwright spec file, reusing the
 * project's existing Page Object Model where possible.
 *
 * @param pomInventory Short text summary of available page objects/fixtures/methods,
 *   e.g. output of listing src/pages/*.ts and src/fixtures/test-fixtures.ts.
 */
export async function generatePlaywrightTest(
  requirementKey: string,
  testCases: ManualTestCase[],
  pomInventory: string,
): Promise<string> {
  const userPrompt = `Source requirement: ${requirementKey}

Available Page Objects / fixtures:
${pomInventory}

Manual test cases to automate:
${JSON.stringify(testCases, null, 2)}`;

  return askClaude(SYSTEM_PROMPT, userPrompt, 8192);
}
