# AI.md — Test Framework Blueprint

> Role: Expert AI Test Architect
> Scope: End-to-end key points from requirement → manual test cases → automation → CI/CD → Allure reporting → email triggering.
> Format: Key points only, organized under headings.

---

## 1. Requirement Analysis & Test Basis
- Gather requirements: user stories, acceptance criteria, PRD, API contracts, wireframes.
- Establish traceability: map each requirement to a unique Requirement ID.
- Define scope: in-scope vs out-of-scope, assumptions, dependencies.
- Identify test types needed: functional, regression, integration, API, UI, performance, security.
- Requirement quality gate: testable, unambiguous, measurable, complete.
- Risk-based prioritization: rank features by business impact and failure probability.
- AI-assisted requirement analysis: use an LLM to flag ambiguous/untestable requirements and to draft first-pass manual test cases directly from a requirement + acceptance criteria (see §13).

## 2. Test Strategy & Planning
- Define test approach: pyramid (unit > API/integration > UI), shift-left testing.
- Choose test levels: unit, component, integration, system, E2E, UAT.
- Entry/exit criteria for each phase.
- Environment strategy: dev, QA, staging, prod-like data.
- Test data strategy: synthetic data, data masking, factories, fixtures.
- Tooling selection: framework, language, runner, reporting, CI.
- Estimation, resourcing, RACI, and timelines.

## 3. Manual Test Case Design
- Derive test cases from requirements + acceptance criteria.
- Apply design techniques: equivalence partitioning, boundary value analysis, decision tables, state transition, pairwise.
- Structure: Test Case ID, Title, Preconditions, Steps, Test Data, Expected Result, Priority, Requirement ID (traceability).
- Cover positive, negative, edge, and boundary scenarios.
- Maintain Requirement Traceability Matrix (RTM).
- Peer review and baseline test cases before automation.
- Store in a test management tool (Jira/Xray, TestRail, Zephyr).

## 4. Automation Framework Design
- Architecture pattern: Page Object Model (POM) / Screenplay / component-based.
- Layered design: tests → business/page layer → utilities/core → drivers.
- Design principles: DRY, SOLID, reusable, maintainable, scalable.
- Framework type: data-driven, keyword-driven, BDD (Cucumber/Behave), hybrid.
- Tool stack examples:
  - UI: Selenium, Playwright, Cypress.
  - API: RestAssured, Requests, Postman/Newman.
  - Mobile: Appium.
  - Unit: JUnit/TestNG, PyTest, Jest.
- Config management: environment configs, secrets vault, `.env`, profiles.
- Waits & synchronization: explicit waits, no hard sleeps.
- Cross-browser / cross-platform support.
- AI-assisted self-healing locators as an architecture pattern: a locator wrapper that falls back to an LLM-diagnosed replacement selector when the original fails, instead of failing the test outright (full pattern in §13).

## 5. Converting Manual TCs to Automation
- Prioritize candidates: stable, repetitive, high-value, regression-heavy tests.
- Don't automate: one-time, exploratory, rapidly changing, low-value cases.
- Map manual steps → reusable automation methods.
- Parameterize test data (data providers, JSON/CSV/Excel, fixtures).
- Add assertions aligned to expected results.
- Tag/group tests: smoke, regression, sanity, critical.
- Maintain traceability: automated test ↔ manual TC ↔ requirement.
- Implement independent, atomic, self-cleaning tests (setup/teardown).

## 6. Test Data & Environment Management
- Test data provisioning: builders, factories, API seeding, DB seeding.
- Data isolation: unique data per run, avoid shared-state conflicts.
- Environment readiness checks / health checks before run.
- Containerization: Docker / Docker Compose for consistent environments.
- Service virtualization / mocking (WireMock, Mockoon) for dependencies.
- Cleanup strategy: teardown, rollback, ephemeral environments.

## 7. Version Control & Code Quality
- Repo structure and branching strategy (trunk-based / GitFlow).
- Code reviews and pull request gates.
- Static analysis / linting (SonarQube, ESLint, Checkstyle).
- Coding standards and naming conventions.
- Dependency management (Maven/Gradle, npm, pip).
- Pre-commit hooks for formatting and quick checks.

## 8. CI/CD Integration
- CI tool: Jenkins, GitHub Actions, GitLab CI, Azure DevOps.
- Pipeline stages: checkout → build → static analysis → test → report → notify → deploy.
- Trigger types: push, PR, scheduled (cron/nightly), manual, webhook.
- Parallel & distributed execution (Selenium Grid, Playwright shards, TestNG parallel).
- Fail-fast strategy and retry logic for flaky tests.
- Store artifacts: logs, screenshots, videos, reports.
- Quality gates: block merge/deploy on test or coverage failure.
- Secrets management in pipeline (credentials, tokens).
- Security/dependency scanning stage: SAST (Semgrep/SonarQube) and dependency-vulnerability audit (`npm audit`, Snyk, Dependabot) run alongside tests, gating on high-severity findings.

## 9. Reporting with Allure
- Integrate Allure adapter with the test runner (TestNG/PyTest/JUnit/etc.).
- Generate results: `allure-results` → `allure-report`.
- Enrich reports: steps, attachments (screenshots, logs, request/response), severity, epics/features/stories.
- Annotations: `@Epic`, `@Feature`, `@Story`, `@Severity`, `@Step`.
- Categorize defects: product defects vs test defects.
- Trend & history: retain history folder across runs for graphs.
- Publish report: Allure server, CI artifact, or hosted (S3, GitHub Pages).

## 10. Email / Notification Triggering
- Trigger post-execution: attach or link Allure/HTML report summary.
- Email content: pass/fail counts, pass %, duration, environment, build number, report link.
- Tools: Jenkins Email-Ext / Editable Email, GitHub Actions email action, SMTP scripts.
- Conditional notifications: on failure only, on success, on unstable.
- Multi-channel alerts: Slack, MS Teams, webhooks alongside email.
- Distribution lists: stakeholders, dev, QA leads.
- Include dashboards/links for quick triage.

## 11. Maintenance & Reliability
- Flaky test management: detect, quarantine, root-cause, fix.
- Self-healing locators: a closed loop of detect (locator fails) → AI-diagnose (LLM proposes a replacement selector from the live DOM) → auto-patch the Page Object source → audit-log every heal for review — see §13 for the full pattern.
- Regular refactoring and dead-test cleanup.
- Version-pin dependencies; scheduled upgrade checks.
- Monitor execution time and optimize slow tests.

## 12. Metrics & Continuous Improvement
- Key metrics: pass %, defect leakage, automation coverage, execution time, flakiness rate, MTTR.
- Test coverage vs requirements (traceability coverage).
- Trend analysis across builds.
- Retrospectives and framework improvement backlog.
- ROI of automation: effort saved vs maintenance cost.

## 13. AI-Augmented Testing & LLM/RAG Application Testing
- AI-assisted test generation: turn a requirement (Jira issue, user story) into structured manual test cases via an LLM, then into an automation spec that reuses existing framework methods instead of inventing new locators.
- Self-healing locators (closed loop): wrap each locator access → on failure, capture the live DOM/page source → send it + the broken selector to an LLM asking for a replacement (with a confidence score and reason) → auto-patch the replacement into the Page Object source file → append every heal (old selector, new selector, confidence, timestamp) to an audit log for human review → surface unconfident/failed heals as real test failures rather than silently patching them.
- Testing AI/LLM-powered application features (RAG pipelines, chatbots, semantic search): treat each pipeline stage as independently testable — ingestion (document/PDF parsing) → chunking → embedding → vector-store indexing → retrieval → generation — and add infra health-checks (is the vector DB / local model server reachable) as pre-flight gates so a down dependency fails fast with a clear message instead of a confusing pipeline error.
- Assertion strategy for LLM output: prefer semantic/substring/keyword checks or an LLM-as-judge over exact-string matching, since generative output is non-deterministic; pin model/version and temperature where reproducibility matters.
- AI-orchestrated multi-agent QA workflow: chain specialized agents for generate → execute → analyze failures → heal → re-run, each owned by a single-responsibility agent (test generation, page-object maintenance, execution, root-cause analysis) with clear handoffs between them, rather than one monolithic script/agent doing everything.

## 14. Security & Non-Functional Testing
- Accessibility testing: automated WCAG checks (axe-core, Pa11y) integrated into UI test runs, not just manual audits.
- Visual regression testing: baseline screenshot comparison (Playwright's built-in snapshot compare, Percy, Applitools) to catch unintended UI/layout drift.
- Performance/load testing: response-time and throughput checks under load (k6, JMeter) and page-level performance budgets (Lighthouse CI).
- Security testing: dependency/vulnerability scanning (`npm audit`, Snyk, OWASP Dependency-Check), SAST, and where applicable DAST (OWASP ZAP) against a running test environment.
- Contract testing: consumer-driven contracts (Pact) between services/API consumers to catch breaking changes before integration/E2E stages.
- These are the pillars most often missing from an otherwise "complete" framework — call them out explicitly as scope decisions (in vs. deliberately out) rather than silent gaps.

## 15. RAG-Powered Test Intelligence (Framework-Internal RAG)
_Distinct from §13(c) "testing RAG applications" — this is RAG used **as** the framework's own architecture, grounding its AI features in curated knowledge instead of raw, unfiltered context._

- **Knowledge base composition**: embed and index the framework's own artifacts — Page Object source, past manual/automated test cases, requirement/acceptance-criteria text, historical failure summaries, self-healing audit history, Allure run history — into a vector store, kept in sync with the codebase (re-embed on change, not a one-time snapshot).
- **Grounded self-healing** (replaces "stuff the whole DOM/POM file into the prompt"): when a locator breaks, retrieve the top-k most similar prior heals and DOM patterns from the knowledge base to ground the LLM's replacement-selector suggestion — cheaper per call, more consistent, and far less prone to hallucinating a plausible-looking but wrong selector than a cold, context-free prompt.
- **Grounded test generation & dedup**: before generating a new manual or automated test case, retrieve semantically similar existing test cases/RTM entries first, so the LLM reuses existing Page Object methods and coverage instead of duplicating or inventing new ones — retrieval-before-generation, not generation-then-hope-it-matches-conventions.
- **Grounded root-cause analysis**: seed `root-cause-analyzer`-style agents with the most similar historical failures and their confirmed fixes (retrieved from a vector store of past failure summaries/incident postmortems), so triage starts from "this matches a known failure class, previously fixed by X" instead of a blank slate every time.
- **Agentic / self-reflective / corrective RAG** (2026 state of the art): the retrieval+generation loop should evaluate its own retrieval confidence and re-query — or escalate to a human — when evidence is weak, rather than a single-pass retrieval acted on blindly. Applied to self-healing, this means a low-confidence healed selector should never auto-patch source silently; it should fall back to a human-reviewable suggestion.
- **Natural-language test-suite querying**: a RAG-backed chat/CLI surface so stakeholders can ask "what tests cover requirement X" or "why did test Y fail last week" and get an answer grounded in the vector index + Allure/failure history, instead of manually cross-referencing reports.
- **Lifecycle management**: versioning, staleness invalidation, and re-embedding policy for the knowledge base so it evolves alongside the code it describes rather than silently going stale.

## 16. 2026 Advanced/Emerging Capabilities
_Forward-looking pillars an "advanced" 2026 framework is expected to have, per current industry direction (agentic QA, LLMOps, AI governance)._

- **Agentic test orchestration**: move from a fixed chain of single-purpose agents toward agents that autonomously plan, generate, execute, analyze, and adapt within a single loop given a goal — scripted automation plateaus around a fixed coverage ceiling, while agentic orchestration is reported to materially cut cycle time and raise coverage.
- **Predictive test selection / test impact analysis**: use historical failure patterns and code-diff signals to run only the tests relevant to a change instead of the full suite every time, trading full coverage on every run for much faster feedback loops (with periodic full-suite runs as a safety net).
- **LLMOps for the framework's own embedded prompts**: every LLM call the framework makes (locator healer, manual-test generator, spec generator, RAG asker) is a versioned artifact — needs golden-set regression evals that must pass before bumping a pinned model id (e.g. today's hardcoded `claude-opus-4-6` in `claudeHealer.ts`) or editing a prompt, since provider model updates ship frequently and can silently shift behavior.
- **AI cost/token governance**: track and budget LLM token spend per run across healing, generation, and RAG calls; cache deterministic results (e.g. a healed selector keyed by a DOM-content hash) so re-runs don't re-pay for an identical LLM call.
- **Governance & guardrails for AI-authored changes**: autonomous edits to source (self-healing patches, generated specs) should land as a reviewable diff/PR with a confidence threshold and rollback path — not a direct, unreviewed write to a source file — per current guidance on governance controls for AI-generated test artifacts.
- **Multimodal / computer-use testing agents**: vision-grounded agents that perceive the rendered screen (screenshots) rather than only the DOM, as a complement to DOM-based self-healing for canvas/chart-heavy UI or components with no stable DOM structure. Current guidance is that these agents excel at repetitive/regression/visual work but still fall short of human judgment on exploratory, accessibility, and business-context-heavy testing — so they extend, not replace, human QA.
- **Production-signal-driven test generation (shift-right feeding shift-left)**: mine real user session/telemetry/error-rate data to surface heavily-used-but-under-tested flows and propose new test scenarios from them.
- **Chaos/resilience testing**: extend the existing dependency health-check pattern (Ollama/Chroma pre-flight checks) into active fault injection — what happens when a dependency goes down *mid-run*, not just before — for critical flows.
- **AI-generated test analytics digest**: a scheduled AI-written summary of flakiness trends, self-healing frequency, and coverage drift posted to Slack/Teams — turns the notification gap (§10) into an actual insight rather than a raw pass/fail count.

## 17. Framework Feature Summary — This Repository
_A concrete, combined checklist merging this blueprint's categories (§1–§16) with what is actually implemented in this repo today (per `CLAUDE.md` and the codebase), so gaps against a 2026-grade "advanced" framework are visible rather than assumed._

**Implemented**
- **Requirements → Manual TCs**: Jira Cloud REST v3 requirement fetch → Claude-generated structured manual test cases → created as Xray "Manual" Test issues, linked back to the source requirement (§1–§3).
- **Automation framework / POM**: `BasePage` navigation/wait helpers + a `getLocator(name, selector)` wrapper on every page object; page classes never expose raw locators publicly (§4).
- **AI self-healing locators**: failed locator → live DOM + selector sent to Claude → JSON `{newSelector, confidence, reason}` → auto-patches the Page Object `.ts` source in place → every heal logged to a `flaky.json` audit trail (§13).
- **Manual → automated conversion**: Claude turns the same manual test cases into a Playwright spec, given the full contents of `src/pages/*.ts` as context so it reuses existing methods (§5).
- **Test data & environment**: lazily-created MySQL pool with typed query helpers and standalone seed/cleanup scripts; Excel-driven data-driven login tests; PDF fixture data for RAG tests (§6).
- **RAG implementation — as an application under test**: a dedicated suite exercises PDF extraction → chunking → Chroma vector DB → embedding retrieval → local Ollama generation, asserting on semantic content in the LLM's answer, gated by Ollama/Chroma health-checks (§13c). *(See "Not yet present" below — this is the only RAG usage in the repo; RAG is not yet used to power the framework's own AI features.)*
- **Version control & code quality**: ESLint + Prettier + strict TypeScript with path aliases, all wired to npm scripts (§7).
- **CI/CD**: GitHub Actions, 4-way shard matrix with a MySQL service container per job, plus an equivalent Docker/Compose 4-way sharded local setup (§8).
- **Reporting**: Allure (with a custom auto-open reporter) + built-in HTML reporter; Winston logger (console + file) with a timed `step()` helper; failure videos/traces/screenshots auto-attached (§9).
- **Maintenance/reliability**: a `src/tests/quarantine/` convention for flaky tests, plus the self-healing audit log as a live record of locator drift (§11).
- **AI-orchestrated multi-agent QA loop**: `test-generator` (writes/repairs generated specs) → `test-execution-agent` (runs the narrowest relevant scope, checks infra pre-reqs, writes an execution summary) → `root-cause-analyzer` (reads Allure/error-context/screenshots, writes a failure summary) → `pom-builder` (extends Page Objects when a step has no existing method) — a generate → execute → analyze → heal → re-run chain (§13/§16).
- **Claude Code tooling layer**: skills for the Jira/Xray pipeline, Allure reporting, GitHub Actions workflow generation, and test-data generation; a `PostToolUse` hook auto-lints/formats any generated spec; MCP server entries for Atlassian, GitHub, and MySQL for direct tool access.

**Not yet present — 2026 "advanced framework" gaps**
- **RAG implementation is incomplete / missing as a framework capability.** The only RAG usage today is testing a RAG *demo* pipeline (§13c); there is no framework-internal RAG (§15) grounding self-healing, test generation, or root-cause analysis — every LLM call today gets ad-hoc raw context (a full DOM dump, or the entire contents of `src/pages/*.ts`) instead of retrieved, curated context from a persistent, versioned knowledge base. This is the single biggest architectural gap versus a 2026-grade framework and the most actionable next build.
- **No governance gate on self-healing patches**: `PomPatcher.patch()` writes the AI-suggested selector directly to the Page Object source file with no PR/diff review step and no confidence threshold gate — a low-confidence or wrong heal can land in source unreviewed. §16 flags this as a required guardrail.
- **No LLMOps eval-gating** for the framework's own embedded prompts/models — `claudeHealer.ts` pins a specific Claude model id with no golden-set regression suite run before that pin is ever bumped, and no eval suite for the Jira→manual-TC or manual-TC→spec generation prompts either.
- **No predictive test selection / test impact analysis** — every CI run executes the full suite regardless of what changed; no ML- or history-driven test-selection layer.
- **No AI cost/token governance or caching** — locator heals and generation calls re-invoke the LLM every time with no caching of prior results (e.g. by DOM-content hash) and no per-run token/cost tracking.
- **No agentic (goal-driven) orchestration** — the current agent chain is a fixed, single-purpose pipeline (generate → execute → analyze → heal), not agents that plan their own approach per goal; it also references a `rerun-report-agent` step that doesn't exist yet in `.claude/agents/`.
- **No multimodal/computer-use testing** — locator resolution is DOM-only; nothing falls back to a vision-grounded agent for canvas/chart-heavy or DOM-unstable UI.
- **No chaos/resilience testing** — health-checks for Ollama/Chroma only run pre-flight, not as active fault injection mid-run.
- **No production-telemetry-driven test generation** — no mining of real usage/session data to propose new coverage.
- No API test layer (no `APIRequestContext`/REST client tests) — UI and RAG-pipeline tests only.
- No visual regression, accessibility, performance/load, or contract testing anywhere in the repo (§14 in full is a gap).
- No cross-browser or mobile coverage — a single desktop Chromium project.
- No CI security/dependency-scanning stage (no SAST, no `npm audit`/Snyk/Dependabot step).
- No pre-commit hooks (no husky/lint-staged) enforcing lint/format before commit.
- No email/Slack/Teams notification step in CI — reporting is artifact-only (no AI-generated digest either, §16).
- Inconsistent smoke/regression/sanity tagging — only used on a single test today, not a repo-wide convention.

---

## Quick Reference: End-to-End Flow
`Requirements → Manual Test Cases (RTM) → Automation Framework → RAG-Grounded AI Self-Healing → Convert TCs → Test Data/Env → Version Control → CI/CD Pipeline → Parallel Execution → Allure Report → Email/Slack Notification → Metrics & Improvement → Agentic Continuous Learning (RAG)`
