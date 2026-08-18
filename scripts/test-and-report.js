// Runs `playwright test` (forwarding any CLI args), then opens the Allure
// report regardless of pass/fail, exiting with the Playwright run's own
// exit code so CI-style callers still see a failure.
const { spawnSync } = require('child_process');

const playwrightArgs = process.argv.slice(2);

const testRun = spawnSync('npx', ['playwright', 'test', ...playwrightArgs], {
  stdio: 'inherit',
  shell: true,
});

spawnSync('npm', ['run', 'report:allure'], {
  stdio: 'inherit',
  shell: true,
});

process.exit(testRun.status ?? 1);
