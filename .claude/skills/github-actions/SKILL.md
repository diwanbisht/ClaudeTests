---
name: github-actions
description: Use for anything related to GitHub Actions CI/CD pipelines including workflow creation, test execution, artifact uploads, Allure reporting, and pipeline optimization.
---

# ⚙️ GitHub Actions Module

## 🎯 Purpose
This module provides standardized CI/CD automation capabilities for the Playwright-based test automation framework.

It enables:
- Automated test execution in CI
- Parallel execution (sharding)
- Allure report generation
- Artifact management
- Debugging & traceability

---

## 📂 Available Skills

- workflow-generator.md → Generate complete CI pipelines
- artifact-upload.md → Upload reports, logs, and test artifacts
- ci-optimization.md → Improve pipeline speed & efficiency (optional)
- allure-publish.md → Publish Allure reports (optional)

---

## 🧩 When to Use

Use this module when:
- Creating GitHub Actions workflows
- Running Playwright tests in CI
- Adding Allure reporting to CI
- Uploading artifacts (reports, logs, traces)
- Implementing parallel execution (sharding)

---

## ⚙️ Global CI/CD Rules

### 1. Always install dependencies cleanly
```bash
npm ci