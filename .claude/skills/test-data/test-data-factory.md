---
name: test-data-factory
description: Use when creating reusable, scalable test data factories that generate or fetch test data from multiple sources such as the MySQL test-data helpers, faker, or fixture parameters. Ensures centralized, maintainable test data handling.
---

# 🏭 Test Data Factory

## 🎯 Purpose

Provide a **centralized mechanism** to:

- Generate dynamic test data
- Fetch data from `src/db/queries/testData.ts` (the framework's actual data
  source — see `data-generator.md`)
- Standardize data structures across tests
- Enable reusable, non-duplicated test data creation

---

## 🧠 Core Concept

```text
Factory = Data Creation + Data Fetching + Data Standardization
```

A factory function should be the single place a given entity shape gets
built, so a schema change (e.g. `app_users` gaining a column) only needs
updating in one place.

## Where factories live in this repo

There's no separate `src/factories/` directory yet — until one exists, put a
new factory function next to the query helpers it wraps, in
`src/db/queries/testData.ts`, following the existing `getTestUserByRole`/
`insertTestUser` naming pattern:

```ts
export async function createTestUser(
  pool: Pool,
  overrides: Partial<{ name: string; email: string; role: string }> = {},
): Promise<TestUser> {
  const user = {
    name: overrides.name ?? `Test User ${Date.now()}`,
    email: overrides.email ?? `test-${Date.now()}@example.com`,
    role: overrides.role ?? 'viewer',
  };
  return insertTestUser(pool, user);
}
```

## Rules
- A factory takes an `overrides` object with sensible defaults for
  everything else — callers should only specify what the test actually cares
  about, not every field.
- A factory that inserts data (like `createTestUser` above) is a
  responsibility of the test/fixture that created it to clean up — use
  `npm run db:cleanup` or a scoped `afterEach` delete, don't leave rows
  behind for later runs to trip over.
- Don't build a new ad-hoc object literal in a spec when a factory already
  produces that shape — extend the factory's `overrides` instead.
- If a factory needs values from an *external* source (API, CSV, faker),
  keep the fetch/generation logic inside the factory function, not scattered
  across the calling spec.
