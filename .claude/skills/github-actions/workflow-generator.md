---
name: github-workflow-generator
description: Use when generating or updating GitHub Actions workflows for Playwright automation frameworks. Supports CI pipelines, sharding, Allure reporting, artifact uploads, and failure handling.
---

# ⚙️ GitHub Actions Workflow Generator

## 🎯 Purpose
Generate production-ready CI/CD workflows for:
- Playwright test execution
- Parallel (sharded) runs
- Allure reporting
- Artifact uploads
- Debugging & traceability

---

## 🧩 Supported Capabilities

- Playwright test execution
- Multi-browser support
- Parallel sharding
- Allure report generation
- Artifact upload (reports, logs, traces)
- Retry handling
- CI optimization

---

## 🏗️ Standard Workflow Structure

### 1. Trigger

```yaml
on:
  push:
    branches: [ main ]
  pull_request: