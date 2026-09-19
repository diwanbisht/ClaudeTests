import axios from 'axios';
import { readAllureResults, summarizeRun, type RunSummary } from '../reporting/parseAllureResults';

/**
 * Posts the last run's pass/fail summary to Slack and/or MS Teams via
 * incoming webhooks. Reads SLACK_WEBHOOK_URL / TEAMS_WEBHOOK_URL directly
 * from process.env (not src/utils/config.ts, since neither is required for
 * the framework to function — this is a pure no-op when unset, not an
 * error) so `npm run notify` never fails a build for a team that hasn't
 * wired notifications up yet.
 */

function buildRunLink(): string | undefined {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  if (GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID) {
    return `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;
  }
  return undefined;
}

function buildSummaryText(summary: RunSummary): string {
  const runLink = buildRunLink();
  const status = summary.failed + summary.broken > 0 ? '❌ FAILURES' : '✅ ALL PASSED';

  return [
    `*Playwright Test Run — ${status}*`,
    `Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed} | Broken: ${summary.broken} | Skipped: ${summary.skipped}`,
    `Pass rate: ${summary.passRatePct}% | Duration: ${(summary.totalDurationMs / 1000).toFixed(1)}s`,
    runLink ? `Run: ${runLink}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');
}

async function notifySlack(webhookUrl: string, text: string): Promise<void> {
  await axios.post(webhookUrl, { text });
  console.log('[notify] Posted summary to Slack.');
}

async function notifyTeams(webhookUrl: string, text: string, summary: RunSummary): Promise<void> {
  await axios.post(webhookUrl, {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: summary.failed + summary.broken > 0 ? 'FF0000' : '2EB67D',
    summary: 'Playwright Test Run Summary',
    text,
  });
  console.log('[notify] Posted summary to Microsoft Teams.');
}

async function main() {
  const slackUrl = process.env.SLACK_WEBHOOK_URL;
  const teamsUrl = process.env.TEAMS_WEBHOOK_URL;

  if (!slackUrl && !teamsUrl) {
    console.log(
      '[notify] No SLACK_WEBHOOK_URL or TEAMS_WEBHOOK_URL configured — skipping notification (no-op).',
    );
    return;
  }

  const results = readAllureResults();
  if (results.length === 0) {
    console.log('[notify] No allure-results found — nothing to notify. Run the suite first.');
    return;
  }

  const summary = summarizeRun(results);
  const text = buildSummaryText(summary);

  const tasks: Promise<void>[] = [];
  if (slackUrl) tasks.push(notifySlack(slackUrl, text));
  if (teamsUrl) tasks.push(notifyTeams(teamsUrl, text, summary));

  const outcomes = await Promise.allSettled(tasks);
  const failures = outcomes.filter((o): o is PromiseRejectedResult => o.status === 'rejected');
  if (failures.length > 0) {
    failures.forEach((f) => console.error('[notify] Delivery failed:', f.reason));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[notify] Unexpected error:', error);
  process.exit(1);
});
