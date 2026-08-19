---
name: test-data-generator
description: Use when generating test data for Playwright tests, API tests, or database-driven scenarios. Supports dynamic data, random data, DB seeding, and reusable datasets.
---

# 🧪 Test Data Generator

## 🎯 Purpose

Standardize test data creation and usage across automation tests to ensure:

- Repeatable test execution
- Data isolation
- Reduced flakiness
- Support for data-driven testing
- AI-friendly structured data

---

## 📂 Types of Test Data

### 1. Static Data
- Hardcoded values
- Stored in JSON / TS files
- Used for predictable scenarios

Example:
```ts
export const loginData = {
  validUser: { username: 'john', password: 'pass123' },
  invalidUser: { username: 'wrong', password: 'wrong' }
};