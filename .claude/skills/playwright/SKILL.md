---
name: playwright
description: Use this skill for generating Playwright TypeScript tests, Page Object Models, selectors, and assertions following best practices.
---

# 🎭 Playwright Core Skill

## When to use
Use this skill when:
- Generating Playwright test cases
- Creating or updating Page Object Models (POM)
- Writing assertions for UI validation
- Designing selectors using data-testid
- Refactoring or improving Playwright test structure

---

## Sub-skills (reference only)
- test-generator → Generate new Playwright test files
- page-object-model → Create reusable POM classes
- assertions → Write robust assertions
- self-healing → Implement locator fallback strategies

---

## Global Playwright Rules (MANDATORY)

### Code Standards
- Always use **TypeScript**
- Always use **async/await**
- Follow **Playwright test structure (test, describe, hooks)**

---

### Locator Strategy
- Always prefer `getByTestId()`
- Avoid XPath unless absolutely necessary
- Avoid fragile CSS selectors

---

### Wait Strategy
- ❌ Never use `waitForTimeout`
- ✅ Use Playwright auto-waiting
- ✅ Use `expect()` for synchronization

---

### Framework Design
- Always follow **Page Object Model (POM)**
- Do NOT write raw locators inside test files
- Reuse existing page methods wherever possible

---

### Assertions
- Prefer:
  - `toBeVisible()`
  - `toBeChecked()`
  - `toContainText()`
- Avoid unnecessary assertions

---

## Output Expectations
When generating code:
- Use clean, readable TypeScript
- Follow existing project structure
- Ensure code is runnable without modification