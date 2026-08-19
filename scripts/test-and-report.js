const { spawnSync } = require('child_process');

const playwrightArgs = process.argv.slice(2);

console.log('🚀 Running Playwright tests...\n');

// 1️⃣ Run Playwright tests
const testRun = spawnSync('npx', ['playwright', 'test', ...playwrightArgs], {
  stdio: 'inherit',
  shell: true,
});

console.log('\n📊 Generating & Opening Allure Report...\n');

// 2️⃣ Generate report
spawnSync('npx', [
  'allure',
  'generate',
  'allure-results',
  '--clean',
  '-o',
  'allure-report',
], {
  stdio: 'inherit',
  shell: true,
});

// 3️⃣ Open report automatically
spawnSync('npx', ['allure', 'open', 'allure-report'], {
  stdio: 'inherit',
  shell: true,
});

// 4️⃣ Exit with original test status (important for CI)
process.exit(testRun.status ?? 1);