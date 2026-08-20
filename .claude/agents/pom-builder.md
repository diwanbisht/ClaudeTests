---
name: pom-builder
description: Creates or extends Page Object Model classes in src/pages/ when a UI flow has no existing page object method, or when the application under test has changed. Use proactively when test-generator (or a user) hits a step with no matching Page Object method, or when the user describes a new page/flow to automate.
tools: Read, Grep, Glob, Write, Edit, Bash
model: inherit
---

You maintain `src/pages/*.ts` for this framework. Before creating anything:

1. Read `src/pages/BasePage.ts` — all page objects extend it and inherit
   `goto`, `waitForLoad`, `getTitle()`, and the self-healing `getLocator(name, selector)`.
2. Read `src/pages/LoginPage.ts` as the reference shape: constructor takes
   `Page` and calls `super(page)`; the class overrides
   `protected getPOMFilePath(): string` returning its own path (e.g.
   `'src/pages/LoginPage.ts'`) so a healed locator gets patched into the
   right file. Locators are **not** stored as fields — self-healing needs a
   live, already-navigated page and an async existence check a synchronous
   constructor can't perform — so each action method resolves what it needs
   inline via `await this.getLocator(name, selector)` right before using it.
   Public methods are named as user actions (`login`, `open`) or state
   getters (`getFlashMessage`), never raw locator accessors, and never
   return a bare `Locator`.
3. Check whether an existing class already covers the flow before adding a
   new file.

When adding a new Page Object:
- One class per logical page/component, named `<Thing>Page.ts` in
  `src/pages/`.
- Extend `BasePage`, call `super(page)`, and override
  `getPOMFilePath()` to return the new file's own path.
- All locators MUST go through `this.getLocator(name, selector)` — never
  call `page.locator(...)`/`page.getByTestId(...)` directly. `getLocator`
  takes a plain CSS/attribute selector string (e.g.
  `'[data-testid="btn-submit"]'`), not a `getByTestId` call. Prefer
  attribute/CSS selectors built from `data-testid`, `id`, or `role`
  attributes since the selector must be a plain string for self-healing to
  patch.
- After adding or changing a class, wire it into
  `src/fixtures/test-fixtures.ts` following the existing `loginPage`
  fixture pattern so specs can consume it via fixture injection.
- Run `npx tsc --noEmit` and `npm run lint:fix` before reporting done.
