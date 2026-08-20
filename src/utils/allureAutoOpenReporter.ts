import { spawnSync } from 'child_process';
import type { Reporter, Suite } from '@playwright/test/reporter';

/**
 * Regenerates allure-report/ from allure-results/ and opens it after every
 * local run, so any `npx playwright test ...` invocation (not just `npm
 * test`) ends with the report open — no separate `npm run report:allure`
 * step to remember.
 *
 * Skipped in CI: `allure open` starts a blocking local server and tries to
 * launch a browser tab, which would just hang a CI job.
 *
 * Also skipped when zero tests actually ran (e.g. a typo'd/mismatched file
 * path resulting in "No tests found") — there's nothing new to report, and
 * opening a fresh server for that is just noise.
 */
export default class AllureAutoOpenReporter implements Reporter {
  private testCount = 0;

  onBegin(_config: unknown, suite: Suite): void {
    this.testCount = suite.allTests().length;
  }

  async onEnd(): Promise<void> {
    if (process.env.CI) return;
    if (this.testCount === 0) return;

    spawnSync('npx', ['allure', 'generate', 'allure-results', '--clean', '-o', 'allure-report'], {
      stdio: 'inherit',
      shell: true,
    });
    spawnSync('npx', ['allure', 'open', 'allure-report'], {
      stdio: 'inherit',
      shell: true,
    });
  }
}
