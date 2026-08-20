---
name: playwright-page-object-model
description: Use when creating or extending a Page Object class in src/pages/,
             or deciding whether a UI step needs a new Page Object method at all.
---

# Page Object Model Conventions

## When to use
Use this when:
- A spec needs a UI action/state getter that no existing Page Object exposes
- Reviewing whether a generated spec is reaching into raw locators instead of
  reusing a Page Object method

For the actual file creation/edit work, prefer delegating to the
`pom-builder` subagent (`.claude/agents/pom-builder.md`) — it owns
`src/pages/*.ts` and already encodes these rules; this file exists so the
rules are discoverable from the skill system too.

---

## Core structure

- One class per logical page/component, named `<Thing>Page.ts` in
  `src/pages/`.
- Every class extends `BasePage` (`src/pages/BasePage.ts`) and calls
  `super(page)` in its constructor.
- Every class overrides `protected getPOMFilePath(): string` returning its own
  path, e.g. `'src/pages/LoginPage.ts'` — the self-healing system
  (see `self-healing.md`) uses this to know which file to patch.
- Locators are **not** stored as class fields. Self-healing needs a live,
  already-navigated page and an async existence check, which a synchronous
  constructor can't do — so each action method resolves what it needs inline:

```ts
async login(username: string, password: string): Promise<void> {
  const user = await this.getLocator('username-input', '#username');
  await user.fill(username);

  const pass = await this.getLocator('password-input', '#password');
  await pass.fill(password);

  const submit = await this.getLocator('login-button', 'button[type="submit"]');
  await submit.click();
}
```

## Method naming

- Public methods are user actions (`login`, `open`, `addRow`) or state
  getters (`getFlashMessage`, `getRowCount`) — never raw locator accessors,
  and never return a bare `Locator`.
- Locators stay private to the class; a spec should never see a `Locator`
  object, only the result of an action or a getter.

## Before adding a new class or method

1. Read `src/pages/BasePage.ts` for the inherited `goto`, `waitForLoad`,
   `getTitle()`, and `getLocator(name, selector)`.
2. Read `src/pages/LoginPage.ts` as the reference shape.
3. Check whether an existing class already covers the flow — extend it rather
   than creating a near-duplicate page object.
4. After adding/changing a class, wire it into
   `src/fixtures/test-fixtures.ts` following the existing `loginPage` fixture
   pattern so specs can consume it via fixture injection.
5. Run `npx tsc --noEmit` and `npm run lint:fix` before considering the
   change done.

## What NOT to do

- Don't write `page.locator(...)` or `page.getByTestId(...)` directly inside
  a Page Object method — always go through `this.getLocator(name, selector)`.
- Don't write raw locators inside spec files (`src/tests/**/*.spec.ts`) at
  all — if a spec needs a new interaction, it needs a new Page Object method,
  not an inline locator.
