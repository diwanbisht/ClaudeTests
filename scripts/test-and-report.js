const { spawnSync } = require('child_process');

const playwrightArgs = process.argv.slice(2);

console.log('🚀 Running Playwright tests...\n');

// Report generation + opening now happens via AllureAutoOpenReporter
// (playwright.config.ts's reporter list), which runs for every invocation
// of `playwright test` — not just this script — so it isn't duplicated here.
const testRun = spawnSync('npx', ['playwright', 'test', ...playwrightArgs], {
  stdio: 'inherit',
  shell: true,
});

// Exit with original test status (important for CI)
process.exit(testRun.status ?? 1);