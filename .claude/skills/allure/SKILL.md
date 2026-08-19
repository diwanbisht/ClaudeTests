---
name: allure
description: Use for anything related to Allure reporting including annotations, reporting configuration, attachments, debugging, and AI-based test insights.
---

# Allure Reporting Skill Module

## 📌 Purpose
This module enables Claude to:
- Enhance Playwright tests with Allure annotations
- Standardize reporting configuration
- Attach debugging artifacts (logs, screenshots, videos)
- Integrate AI/self-healing insights into reports
- Improve failure analysis and traceability

---

## 📂 Available Sub-Skills

- annotations.md       → Add feature, story, tags, severity, steps, attachments
- report-config.md     → Configure reporting behavior, attachment rules, failure handling

---

## 🚀 When to Use

Use this skill when:
- Generating Playwright tests
- Enhancing existing tests with reporting
- Debugging test failures
- Integrating Allure in CI/CD
- Adding AI/self-healing insights to reports

For debugging failures and AI-based failure insights specifically, use the
`root-cause-analyzer` subagent (`.claude/agents/root-cause-analyzer.md`) —
it reads `allure-results/`, `error-context.md`, and failure screenshots and
writes a human-readable root-cause summary per failed test.

---

## 🔥 Global Allure Rules (MANDATORY)

### 1. Always Add Basic Annotations
Every test must include:
- feature (module name)
- story (sub-module / functionality)

Example:
```ts
allure.feature('Login Module');
allure.story('Valid Login');