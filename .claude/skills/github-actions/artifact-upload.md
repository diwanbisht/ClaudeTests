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
- AI-assisted analysis (future use)

---

## 📂 What to Upload

### 1. Playwright Report
- Folder: `playwright-report/`
- Contains HTML execution report

---

### 2. Allure Report
- Folder: `allure-report/`
- Generated after test execution
- Rich reporting with steps, attachments, logs

---

### 3. Allure Results (RAW DATA)
- Folder: `allure-results/`
- Required for:
  - Regeneration
  - Historical trend analysis
  - AI analysis

---

### 4. Test Results (Playwright)
- Folder: `test-results/`
- Contains:
  - screenshots
  - videos
  - traces

---

### 5. Logs (Optional but Recommended)
- Folder: `logs/`
- Custom framework logs

---

## ⚙️ GitHub Actions Implementation

Use `actions/upload-artifact@v4`

### ✅ Example

```yaml
- name: Upload Playwright Report
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7

- name: Upload Allure Report
  uses: actions/upload-artifact@v4
  with:
    name: allure-report
    path: allure-report/
    retention-days: 7

- name: Upload Allure Results
  uses: actions/upload-artifact@v4
  with:
    name: allure-results
    path: allure-results/
    retention-days: 7

- name: Upload Test Results (videos/screenshots)
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results/
    retention-days: 7