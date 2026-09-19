import fs from 'fs';
import path from 'path';
import { askClaude } from '../integrations/claude/claudeClient';
import { config } from '../utils/config';
import { readAllureResults, summarizeRun } from './parseAllureResults';

const OUTPUT_PATH = path.resolve('test-results/ai-insights.md');

const SYSTEM_PROMPT = `You are a QA lead writing a short, high-signal insights digest for a
Playwright test run, based on Allure result data. Given aggregate pass/fail counts and the
names + failure messages of any failed/broken tests, write:
1. A 2-3 sentence executive summary of the run's health.
2. A short bulleted list grouping failures into likely root-cause themes (e.g. "selector
   drift", "timing/flake", "real app regression", "environment/infra") — do not invent a
   theme if there's no evidence for it.
3. 2-4 concrete, actionable recommendations.
Be concise. Do not just restate the raw numbers back — interpret them. Plain markdown, no
preamble like "Here is the summary".`;

function formatStatsTable(summary: ReturnType<typeof summarizeRun>): string {
  return `| Metric | Value |
|---|---|
| Total tests | ${summary.total} |
| Passed | ${summary.passed} |
| Failed | ${summary.failed} |
| Broken | ${summary.broken} |
| Skipped | ${summary.skipped} |
| Pass rate | ${summary.passRatePct}% |
| Total duration | ${(summary.totalDurationMs / 1000).toFixed(1)}s |`;
}

async function main() {
  const results = readAllureResults();

  if (results.length === 0) {
    const noData = `# AI Test Insights\n\nNo \`allure-results/*-result.json\` files found. Run the suite first (\`npm test\`), then re-run \`npm run report:insights\`.\n`;
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, noData);
    console.log(noData);
    return;
  }

  const summary = summarizeRun(results);
  const statsTable = formatStatsTable(summary);

  let narrative: string;
  try {
    config.claude.apiKey(); // throws if unset — fail fast into the catch below
    const failureContext = summary.failedTests
      .map((t) => `- ${t.fullName ?? t.name}: ${(t.message ?? '(no message)').slice(0, 300)}`)
      .join('\n');

    const userPrompt = `Run stats:
- Total: ${summary.total}, Passed: ${summary.passed}, Failed: ${summary.failed}, Broken: ${summary.broken}, Skipped: ${summary.skipped}
- Pass rate: ${summary.passRatePct}%
- Duration: ${(summary.totalDurationMs / 1000).toFixed(1)}s

${summary.failedTests.length > 0 ? `Failed/broken tests:\n${failureContext}` : 'No failed or broken tests this run.'}`;

    narrative = await askClaude(SYSTEM_PROMPT, userPrompt, 1024);
  } catch (error) {
    narrative = `_AI narrative skipped — ${
      error instanceof Error ? error.message : String(error)
    }. Set ANTHROPIC_API_KEY to enable AI-written insights; stats above are still accurate._`;
  }

  const report = `# AI Test Insights\n\nGenerated: ${new Date().toISOString()}\n\n## Run Stats\n\n${statsTable}\n\n## AI Analysis\n\n${narrative}\n`;

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, report);
  console.log(report);
  console.log(`\nWritten to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error('Failed to generate insights:', error);
  process.exit(1);
});
