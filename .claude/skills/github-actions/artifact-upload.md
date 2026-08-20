---
name: github-artifact-upload
description: Use when configuring GitHub Actions workflows to upload test execution artifacts such as Playwright reports, Allure reports, logs, and traces. Ensures debugging, traceability, and CI visibility.
---

# 📦 Artifact Upload – GitHub Actions

## 🎯 Purpose
Standardize artifact uploads in CI pipelines for:
- Debugging failures
- Sharing reports
- Traceability across runs
- Feeding the `root-cause-analyzer` subagent when triage happens outside CI

---

## 📂 What to Upload, and When

### 1. Allure Results (raw, per-shard)
- Folder: `allure-results/`
- Upload `if: always()` from **each shard job**, with a shard-unique artifact
  name (e.g. `allure-results-${{ matrix.shard }}`) — a shared name across
  shards causes later shards to overwrite earlier ones instead of
  accumulating.

### 2. Allure Report (merged, one per run)
- Folder: `allure-report/`
- Generated once, in the merge/report job, from all shards' downloaded
  `allure-results-*` artifacts combined — never generate this per-shard,
  since a single shard only has a partial run.

### 3. Playwright HTML report
- Folder: `playwright-report/`
- Useful as a lighter-weight fallback if Allure generation itself fails.

### 4. Test Results (screenshots/videos/traces)
- Folder: `test-results/`
- Only populated for failed/retried tests, per
  `playwright.config.ts`'s `retain-on-failure`/`only-on-failure` settings —
  expect this to be small or empty on a fully green run.

### 5. Logs
- Folder: `logs/`
- `src/utils/logger.ts`'s winston output (`test-run.log`) — attach this when
  a failure needs step-level timing, not just the final error.

---

## ⚙️ Implementation

Use `actions/upload-artifact@v4` (upload) and `actions/download-artifact@v4`
(merge job):

```yaml
- name: Upload Allure results (this shard)
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: allure-results-${{ matrix.shard }}
    path: allure-results/
    retention-days: 7
```

```yaml
# in the merge/report job
- name: Download all shard results
  uses: actions/download-artifact@v4
  with:
    pattern: allure-results-*
    path: allure-results
    merge-multiple: true
- run: npx allure generate allure-results --clean -o allure-report
- uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
    retention-days: 7
```

## Rules
- Always upload with `if: always()`, not the job's default `on success` —
  the point of these artifacts is diagnosing failures, so they must survive
  a failed step.
- Give per-shard artifacts unique names; only the final merged report should
  use a single shared name.
- Set a `retention-days` that matches how long you actually triage failures
  (7 is a reasonable default) — unbounded retention just accumulates storage
  cost on a repo with sharded, frequent CI runs.
