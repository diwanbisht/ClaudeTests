#!/usr/bin/env node
// PostToolUse hook: after Write/Edit touches a file under src/tests/generated/,
// auto-fix lint/format issues so AI-generated specs match repo style.
const { spawnSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = payload?.tool_input?.file_path;
  if (!filePath || !filePath.endsWith('.ts')) process.exit(0);

  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized.includes('src/tests/generated/')) process.exit(0);

  const cwd = path.resolve(__dirname, '..', '..');
  spawnSync('npx', ['eslint', '--fix', filePath], { cwd, stdio: 'inherit', shell: true });
  spawnSync('npx', ['prettier', '--write', filePath], { cwd, stdio: 'inherit', shell: true });
  process.exit(0);
});
