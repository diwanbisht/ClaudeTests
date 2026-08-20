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

---

## 📂 Types of Test Data

### 1. Static Data
Hardcoded values, predictable scenarios — negative/edge-case inputs that
shouldn't vary run to run:
```ts
export const loginData = {
  validUser: { username: 'john', password: 'pass123' },
  invalidUser: { username: 'wrong', password: 'wrong' },
};
```

### 2. Dynamic / DB-backed data
This repo backs dynamic data with MySQL rather than an in-memory faker
library. `src/db/queries/testData.ts` has the typed query helpers:
```ts
import { getTestUserByRole, insertTestUser } from '../../db/queries/testData';

const admin = await getTestUserByRole(db, 'admin');
```
Only pull `db` into a spec via the `db` fixture
(`src/fixtures/test-fixtures.ts`) when a test actually needs it — the pool is
created lazily, so specs that don't request `db` never open a MySQL
connection.

### 3. Seed / cleanup scripts
`src/db/seed.ts` (`npm run db:seed`) and `src/db/cleanup.ts`
(`npm run db:cleanup`) are standalone scripts, not wired into
`globalSetup` — call them explicitly (CI/Docker already do, before the test
run) rather than assuming a spec run seeds its own data.

---

## Rules
- Prefer pulling data through `src/db/queries/testData.ts` helpers over
  writing ad-hoc SQL inside a spec.
- Don't hardcode a value a query helper already exists for.
- New reusable fetch/insert logic belongs in
  `src/db/queries/testData.ts`, not duplicated per-spec.
- For request-time generation instead of DB-backed data (e.g. composing a
  request body), see `test-data-factory.md`.
