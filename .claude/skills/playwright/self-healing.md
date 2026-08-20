---
name: self-healing-locator
description: Automatically recover from broken locators by detecting failure,
             asking Claude to analyze the page and propose a new selector, and
             patching both the runtime and the owning Page Object file.
---

# Self-Healing Locator System

## When to use
Use this when:
- A locator fails during test execution and you need to understand why
- A new Page Object needs resilient locator handling
- Investigating entries in `flaky.json` or a healing-related test failure

---

## How it actually works in this repo

The pieces live in `src/healing/`:

- `SelfHealingLocator.ts` exports `healLocator(page, name, selector, pomFilePath)`,
  called from `BasePage.getLocator()` (`src/pages/BasePage.ts`) only after the
  original locator fails to attach within 2s.
- `claudeHealer.ts` sends the current page's DOM/accessibility snapshot plus the
  broken `name`/`selector` to Claude and asks for a replacement selector.
- `PomPatcher.ts` writes the healed selector back into the owning Page Object
  source file (the `pomFilePath` returned by that class's
  `getPOMFilePath()` override), so the fix persists instead of re-healing on
  every run.
- `HealingReporter.ts` records each healing attempt (name, old selector, new
  selector, outcome) to `flaky.json` at the repo root.

## Core rule for Page Objects

All locators MUST be resolved through the base class, never directly:

```ts
// Inside a Page Object method:
const emailInput = await this.getLocator('email-input', '[data-testid="email"]');
```

Never call `page.locator(...)` or `page.getByTestId(...)` directly in a Page
Object or a spec — `getLocator` is what gives a selector a healing path. The
`selector` argument must be a plain CSS/attribute string (not a `getByTestId`
call), because `PomPatcher` rewrites that literal string in place when healing
succeeds.

## Diagnosing a healing-related failure

1. Check `flaky.json` for the `name`/`pomFile` involved — a prior healing
   attempt there is a strong signal the underlying app markup changed.
2. If `getLocator` still throws (`Locator not found and healing failed: <name>`),
   Claude's proposed selector didn't resolve either — treat it as a real UI
   change or a missing element, not a flaky timing issue.
3. Hand off the actual selector fix to the `pom-builder` subagent
   (`.claude/agents/pom-builder.md`) rather than patching it inline — it knows
   the `getPOMFilePath()` / `getLocator()` conventions this system depends on.

For failure triage in general (not just locator healing), use the
`root-cause-analyzer` subagent, which cross-references `flaky.json` against
`allure-results/` and `test-results/` to decide whether a failure is
selector-drift vs. a real regression.
