import * as fs from 'fs';
import * as path from 'path';
import { fetchRequirement } from '../integrations/jira/fetchRequirements';
import { createXrayManualTest, linkTestToRequirement } from '../integrations/jira/xrayClient';
import { generateManualTestCases } from '../integrations/claude/generateManualTestCases';
import { generatePlaywrightTest } from '../integrations/claude/generatePlaywrightTest';
import { logger } from '../utils/logger';

const PAGES_DIR = path.join(__dirname, '..', 'pages');
const GENERATED_DIR = path.join(__dirname, '..', 'tests', 'generated');

function buildPomInventory(): string {
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.ts'));
  return files
    .map((file) => `--- ${file} ---\n${fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8')}`)
    .join('\n\n');
}

function toSpecFileName(requirementKey: string): string {
  return path.join(GENERATED_DIR, `${requirementKey.toLowerCase()}.spec.ts`);
}

/**
 * Orchestrates: Jira requirement -> Claude manual test cases -> push to Xray
 * (linked to the requirement) -> Claude Playwright spec -> write to
 * src/tests/generated/, reusing existing Page Objects.
 *
 * Usage: npm run generate:tests -- PROJ-123 [XRAY_PROJECT_KEY]
 */
async function main(): Promise<void> {
  const [requirementKey, xrayProjectKey] = process.argv.slice(2);
  if (!requirementKey) {
    console.error('Usage: npm run generate:tests -- <JIRA_ISSUE_KEY> [XRAY_PROJECT_KEY]');
    process.exit(1);
  }
  const projectKey = xrayProjectKey ?? requirementKey.split('-')[0];

  logger.info(`Fetching requirement ${requirementKey} from Jira`);
  const requirement = await fetchRequirement(requirementKey);

  logger.info('Generating manual test cases with Claude');
  const testCases = await generateManualTestCases(requirement);
  logger.info(`Generated ${testCases.length} manual test case(s)`);

  for (const testCase of testCases) {
    const xrayKey = await createXrayManualTest(projectKey, testCase);
    await linkTestToRequirement(xrayKey, requirementKey);
    logger.info(`Created Xray test ${xrayKey}, linked to ${requirementKey}`);
  }

  logger.info('Generating Playwright spec with Claude');
  const pomInventory = buildPomInventory();
  const specContent = await generatePlaywrightTest(requirementKey, testCases, pomInventory);

  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const specPath = toSpecFileName(requirementKey);
  fs.writeFileSync(specPath, specContent, 'utf-8');
  logger.info(`Wrote generated spec to ${specPath}`);
}

main().catch((error) => {
  logger.error('generate-tests failed', { error: String(error) });
  process.exitCode = 1;
});
