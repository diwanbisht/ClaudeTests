---
name: playwright-codegen-helper
description: Use when you need to discover selectors for a new page/flow
             before writing a Page Object method — via Playwright's codegen
             tool or the Playwright MCP browser tools, not by guessing markup.
---

# Codegen / Selector Discovery Helper

## When to use
Use this when:
- A new page or flow has no existing Page Object coverage and you don't know
  its markup yet
- You're about to add a locator and want to confirm the real selector instead
  of guessing one from the requirement text

Do not hand-write a `data-testid`/CSS selector from assumption — verify it
against the live page first, then have `pom-builder` wire it in through
`this.getLocator(name, selector)`.

---

## Options for discovering selectors

### 1. Playwright's own codegen CLI (outside Claude Code)
```bash
npx playwright codegen <url>
```
Opens a browser + inspector; interacting with the page prints generated
locators. Useful for a human pass before generation, but it isn't runnable
from inside a Claude Code turn.

### 2. Playwright MCP browser tools (inside Claude Code)
When available, use the `mcp__playwright__browser_*` tools to navigate to the
target URL and take a snapshot (`browser_snapshot`) or find an element
(`browser_find`) — this returns the actual accessibility tree/DOM so you can
read off a stable selector (prefer `data-testid`, then `id`, then `role`,
same priority as `pom-builder`) instead of inferring one from the requirement
text.

---

## After discovering a selector

1. Confirm it's stable: prefer `data-testid` > `id`/`role` attributes over
   structural CSS (`div > span:nth-child(3)`) or XPath, since structural
   selectors break on unrelated markup changes and defeat the point of
   self-healing (see `self-healing.md`).
2. Pass it as a plain string to `pom-builder` (or write it yourself if you're
   already in that role) as the `selector` argument of
   `this.getLocator(name, selector)` — never inline it in a spec.
3. Don't hardcode dynamic values (row IDs, timestamps) into the selector
   itself; parameterize the Page Object method instead.
