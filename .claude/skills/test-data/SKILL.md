---
name: test-data
description: Use for anything related to test data management including data generation, reusable factory patterns, data-driven testing, database seeding, and validation across UI/API tests.
---

# 🧪 Test Data Module

## 🎯 Purpose

This module standardizes how test data is:

- Generated (dynamic / faker)
- Retrieved (DB / API / CSV / JSON)
- Structured (models / objects)
- Reused (factory pattern)
- Validated (UI/API/DB consistency)
- Cleaned up (post execution)

It ensures:
- Stable automation
- Scalable data strategy
- Reduced flakiness
- AI-ready structured datasets

---

## 📂 Available Skills

- data-generator.md → Generate static, dynamic, and faker-based data  
- test-data-factory.md → Centralized factory for creating/fetching reusable data  
- data-cleanup.md → Clean test data after execution (optional)  
- db-validation.md → Validate UI/API data against DB (optional)

---

## 🧩 When to Use

Use this module when:

- Writing data-driven tests  
- Generating dynamic test data  
- Fetching data from DB/API/CSV  
- Avoiding duplicate data conflicts  
- Creating reusable test data logic  
- Validating data consistency across layers  

---

## 🧠 Core Principles

### 1. Always Use Factory for Data Creation

```ts
const user = UserFactory.create();