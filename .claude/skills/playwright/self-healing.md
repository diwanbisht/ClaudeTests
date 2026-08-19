---
name: self-healing-locator
description: Automatically recover from broken locators by detecting failure,
             analyzing page source, generating new selectors, and updating flaky.json.
---

# Self-Healing Locator System

## When to use
Use this when:
- A locator fails during test execution
- A new POM needs resilient locator handling
- Improving framework stability

---

## Core Rule
All locators MUST go through:

```ts
this.getLocator(name, selector)