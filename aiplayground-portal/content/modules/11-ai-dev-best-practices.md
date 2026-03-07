# AI-Assisted Development Best Practices

> A battle-tested playbook for teams using AI coding assistants (Claude Code, Codex, Copilot, etc.) to ship faster without sacrificing quality, security, or maintainability.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Principles](#2-core-principles)
3. [Team Workflow & Policies](#3-team-workflow--policies)
4. [Git Strategy & Conflict Management](#4-git-strategy--conflict-management)
5. [CI/CD Gates for AI-Generated Code](#5-cicd-gates-for-ai-generated-code)
6. [PR & Review Process](#6-pr--review-process)
7. [Productive AI Integration Patterns](#7-productive-ai-integration-patterns)
8. [Anti-Patterns: What NOT to Do](#8-anti-patterns-what-not-to-do)
9. [Prompt Engineering for Code Generation](#9-prompt-engineering-for-code-generation)
10. [Context Management](#10-context-management)
11. [Testing Strategies for AI-Generated Code](#11-testing-strategies-for-ai-generated-code)
12. [Governance, Security & Legal](#12-governance-security--legal)
13. [When NOT to Use AI](#13-when-not-to-use-ai)
14. [Failure Recovery & Rollback](#14-failure-recovery--rollback)
15. [Metrics & Measurement](#15-metrics--measurement)
16. [Team Onboarding & Skill Development](#16-team-onboarding--skill-development)
17. [Operational Rollout Plan](#17-operational-rollout-plan)
18. [Templates & Checklists](#18-templates--checklists)

---

## 1. Executive Summary

AI coding assistants can 2-5x development speed — but only when paired with strong processes. Without guardrails, you get faster production of bugs, security holes, and architectural debt.

**The one-line rule**: Treat AI as a brilliant junior developer — fast, knowledgeable, but needs supervision, review, and clear direction.

**Five non-negotiables**:

| Rule | Why |
|------|-----|
| AI assists, humans commit | Accountability stays with the developer |
| Standard Git workflows + extra gates | AI-generated diffs need more scrutiny, not less |
| Tests, lint, security scans on every PR | AI code passes the same bar as human code |
| Prompts and outputs are auditable | Reproducibility and compliance |
| Human review is mandatory | AI misses context, intent, and system-level concerns |

---

## 2. Core Principles

### The AI-Human Responsibility Split

```
┌────────────────────────────────┐  ┌────────────────────────────────┐
│        AI IS GOOD AT           │  │      HUMANS ARE GOOD AT        │
│                                │  │                                │
│  Boilerplate & scaffolding     │  │  Architecture & design         │
│  Pattern completion            │  │  Business logic decisions      │
│  Test generation               │  │  Security threat modeling      │
│  Refactoring known patterns    │  │  User experience judgment      │
│  Documentation drafts          │  │  Performance trade-offs        │
│  Bug pattern detection         │  │  Code review & approval        │
│  Code translation              │  │  System-level reasoning        │
│  Explaining existing code      │  │  Ethical & legal judgment      │
│                                │  │                                │
│  SPEED + BREADTH               │  │  DEPTH + JUDGMENT              │
└────────────────────────────────┘  └────────────────────────────────┘
```

### The Trust Gradient

Not all AI output deserves equal trust:

| Trust Level | Category | Review Rigor |
|-------------|----------|--------------|
| High | Formatting, linting fixes, docstrings | Quick scan |
| Medium | Test generation, boilerplate, translations | Standard review |
| Low | Business logic, algorithms, state management | Line-by-line review |
| Very Low | Auth, crypto, payments, data access | Security team + domain expert |
| Zero | Infrastructure, secrets management, deployment | Never auto-merge |

### The Compound Error Problem

AI is ~90% accurate per step. Over multiple steps:

| Steps | Accuracy |
|-------|----------|
| 1 | 90% |
| 3 | 73% |
| 5 | 59% |
| 10 | 35% |

**Implication**: Break AI tasks into small, independently verifiable units. Never let AI chain 10 steps without human checkpoints.

---

## 3. Team Workflow & Policies

### 3.1 Roles & Permissions

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| Developer | Use AI tools, push to feature branches | Merge to protected branches without review |
| Reviewer | Approve AI-assisted PRs | Skip security review on sensitive code |
| AI Bot Account | Open draft PRs, run automated checks | Push to main, approve its own PRs |
| Admin | Configure branch protections, CODEOWNERS | Bypass CI gates (except emergency) |

**CODEOWNERS**: Auto-request domain-expert reviewers for affected areas. Critical files (auth, payments, infra) require additional approvals.

### 3.2 Branch Strategy

```
main (protected)
  │
  ├── feature/CL-123-add-parser    ← AI-assisted work happens here
  ├── feature/CL-124-fix-retrieval ← Small, focused branches
  └── feature/CL-125-update-tests  ← Split large AI diffs into multiple PRs
```

**Rules**:
- Feature branches or trunk-based short-lived branches
- **Small PRs** — AI can generate large diffs; split into focused PRs (<400 lines changed)
- Rebase frequently to minimize conflicts
- Delete branches after merge

### 3.3 Human-in-the-Loop Policy

| Change Type | Minimum Reviewers | Required Expertise |
|-------------|-------------------|--------------------|
| Standard code | 1 human reviewer | Domain familiarity |
| Critical paths (auth, payments, data) | 2 human reviewers | Security + domain expert |
| Infrastructure / deployment | 2 human reviewers | DevOps + security |
| Schema / migration changes | 2 human reviewers | DBA + domain expert |
| AI-generated tests only | 1 human reviewer | QA or domain developer |

**What reviewers must check** (beyond syntax):
- Correctness: Does it do what it claims?
- Performance: Any O(n^2) hidden in clean-looking code?
- Security: Input validation, injection vectors, auth checks?
- Design fit: Does it match existing patterns and architecture?
- Edge cases: What happens with null, empty, concurrent, or adversarial inputs?

### 3.4 Label & Document AI Contributions

Every AI-assisted PR must:
1. Carry the `ai-assisted` label
2. Include the prompt used (or link to internal prompt log)
3. Note which files were AI-generated vs human-written
4. Describe what human modifications were made to AI output

---

## 4. Git Strategy & Conflict Management

### 4.1 Keeping Branches Current

```bash
# On feature branch — rebase onto latest main
git fetch origin
git rebase origin/main

# Resolve any conflicts, then:
git push --force-with-lease   # Safe force-push (won't overwrite others' work)
```

**Prefer rebase** for small teams / trunk-based flow (linear history).
**Use merge** for teams that want explicit merge commits and visual history.

### 4.2 Conflict Reduction Tactics

| Tactic | Why It Works |
|--------|--------------|
| Smaller PRs, more frequent merges | Less time for drift |
| Pull/rebase daily | Catch conflicts early when they're small |
| Define "touch rules" for critical files | Prevent multiple AI sessions editing the same file |
| Feature flags | Land changes early without activating — reduces merge fear |
| Module ownership | Clear boundaries reduce overlap |
| Lock files during large refactors | Prevent parallel AI sessions from colliding |

### 4.3 AI-Specific Conflict Risks

AI tools can cause unique merge problems:

| Risk | Mitigation |
|------|------------|
| AI generates code in a style different from the project | Enforce style via linters + pre-commit hooks + CLAUDE.md |
| AI rewrites more than asked (scope creep) | Review diffs carefully; reject over-broad changes |
| Two developers use AI on the same module simultaneously | Coordinate via branch naming, standups, or file-level locks |
| AI generates duplicate utilities that already exist | Always search the codebase before accepting AI-generated helpers |
| AI doesn't know about in-flight changes on other branches | Rebase before pushing; review against latest main |

---

## 5. CI/CD Gates for AI-Generated Code

### 5.1 Required Gates (All PRs)

| Gate | Tool Examples | Failure Policy |
|------|--------------|----------------|
| Unit tests | pytest, jest, go test | Block merge |
| Integration tests | pytest, Playwright | Block merge |
| Linting | ESLint, Ruff, Flake8 | Block merge |
| Formatting | Prettier, Black | Auto-fix or block |
| Type checking | mypy, tsc --strict | Block merge |
| Security scan | Snyk, Dependabot, Bandit, OWASP ZAP | Block merge |
| Secret detection | git-secrets, TruffleHog, gitleaks | Block merge |
| Dependency/license check | license-checker, pip-licenses | Block merge on GPL in proprietary |

### 5.2 Recommended Gates (AI-Specific)

| Gate | Purpose |
|------|---------|
| Mutation testing | Verify tests actually catch bugs (not just coverage theater) |
| Property-based tests | For critical algorithms — test invariants, not just examples |
| Complexity analysis | Flag functions with cyclomatic complexity >10 |
| Duplicate detection | Catch AI-generated code that duplicates existing utilities |
| Bundle size check | Prevent AI from adding unnecessary dependencies |
| API contract validation | Ensure AI changes don't break API contracts |

### 5.3 Pre-Commit Hooks

```yaml
# .pre-commit-config.yaml (example)
repos:
  - repo: local
    hooks:
      - id: format
        name: Format code
        entry: black .  # or prettier
        language: system
      - id: lint
        name: Lint code
        entry: ruff check .  # or eslint
        language: system
      - id: typecheck
        name: Type check
        entry: mypy .  # or tsc --noEmit
        language: system
      - id: secrets
        name: Detect secrets
        entry: gitleaks detect --source .
        language: system
```

---

## 6. PR & Review Process

### 6.1 PR Checklist (Copyable)

```markdown
## AI-Assisted PR Checklist

### Provenance
- [ ] PR labeled `ai-assisted`
- [ ] Prompt used is documented (description or linked log)
- [ ] AI-generated files clearly identified
- [ ] Human modifications to AI output described

### Quality
- [ ] CI passes (tests, linters, type checks)
- [ ] Code read line-by-line by domain-knowledgeable reviewer
- [ ] No unnecessary scope expansion beyond the task
- [ ] Naming and patterns match existing codebase conventions
- [ ] No duplicate utilities — checked existing code first

### Security
- [ ] No secrets, credentials, or PII in code
- [ ] Security-sensitive changes reviewed by security team
- [ ] Input validation present where needed
- [ ] No eval(), shell injection, SQL injection, or XSS vectors

### Dependencies
- [ ] New dependencies justified and approved
- [ ] License compatibility verified
- [ ] No unnecessary dependency additions

### Testing
- [ ] Unit tests cover new behavior and edge cases
- [ ] Integration tests cover module interactions
- [ ] Tests are meaningful (not just coverage padding)

### Performance
- [ ] No performance regressions (benchmark if concerned)
- [ ] No O(n^2) or worse hidden in clean-looking code
- [ ] Resource usage reasonable (memory, CPU, network)
```

### 6.2 PR Template

```markdown
## [type] Short description

**Labels**: `ai-assisted`, `<area>`

### What changed
- [Bullet points describing the change]

### Why
- [Business or technical reason]

### AI Usage
- **Tool**: [Claude Code / Copilot / etc.]
- **Prompt**: [Paste prompt or link to internal log]
- **Human modifications**: [What was changed from AI output]

### Testing
- [How this was tested]

### Risks
- [Any concerns, edge cases, or areas needing extra attention]
```

---

## 7. Productive AI Integration Patterns

### 7.1 High-Value Use Cases

| Use Case | AI Contribution | Human Contribution |
|----------|-----------------|---------------------|
| **Scaffolding** | Generate boilerplate, project structure | Define architecture, review output |
| **Test generation** | Write first-pass tests from code | Verify edge cases, add domain-specific tests |
| **Documentation** | Generate docstrings, README drafts, PR descriptions | Review accuracy, add context |
| **Code explanation** | Analyze unfamiliar code, trace data flow | Validate understanding, add institutional knowledge |
| **Refactoring** | Apply known patterns (extract method, rename, simplify) | Decide what to refactor, verify behavior preservation |
| **Bug investigation** | Read logs, trace call stacks, suggest root causes | Verify diagnosis, approve fix approach |
| **Code translation** | Convert between languages or frameworks | Verify idiom correctness, test behavior |
| **Migration assistance** | Generate migration scaffolding, map APIs | Design migration strategy, verify data integrity |

### 7.2 The Prompt Library

Maintain a team-shared library of approved prompts for common tasks:

```
prompts/
├── testing/
│   ├── generate-unit-tests.md
│   ├── generate-integration-tests.md
│   └── generate-edge-case-tests.md
├── documentation/
│   ├── generate-docstrings.md
│   ├── generate-api-docs.md
│   └── generate-changelog.md
├── refactoring/
│   ├── extract-method.md
│   ├── simplify-conditional.md
│   └── reduce-duplication.md
└── review/
    ├── security-review.md
    ├── performance-review.md
    └── architecture-review.md
```

**Benefits**: Consistency across the team, accumulated knowledge of what works, reduced prompt trial-and-error.

### 7.3 Task Automation via AI

| Task | Manual Effort | AI Effort | Quality |
|------|---------------|-----------|---------|
| Changelog generation | 30 min | 2 min + review | Good with review |
| Test boilerplate | 1-2 hr | 10 min + review | Good starting point |
| PR description | 15 min | 1 min + edit | Good |
| Code comments | 30 min | 5 min + review | Needs editing |
| TODO/issue triage | 1 hr | 10 min + review | Decent first pass |
| Dependency update PRs | 2 hr | 15 min + review | Good for minor versions |

---

## 8. Anti-Patterns: What NOT to Do

### 8.1 Organizational Anti-Patterns

| Anti-Pattern | Why It's Dangerous | Better Approach |
|---|---|---|
| **"AI wrote it, ship it"** | Skipping review because AI is "smart" | AI code gets the same review bar as human code |
| **AI as sole contributor** | No human understands the code | A human must own, understand, and be able to maintain every line |
| **Prompt-and-pray** | Vague prompts produce vague code | Invest in prompt quality; provide context, constraints, examples |
| **AI sprawl** | Every dev uses different AI tools with different settings | Standardize tools, prompts, and review processes |
| **Over-reliance** | Team skills atrophy; can't work without AI | Maintain manual coding skills; use AI as accelerator, not crutch |
| **Shadow AI** | Developers use AI without team knowledge | Require labeling; make AI usage visible and auditable |

### 8.2 Technical Anti-Patterns

| Anti-Pattern | Why It's Dangerous | Better Approach |
|---|---|---|
| **Accepting large AI diffs without reading** | Hidden bugs, security holes, unnecessary changes | Read every line; reject scope creep |
| **AI-generated "util" libraries** | Duplicates existing code; creates maintenance burden | Search codebase first; extend existing modules |
| **Chaining AI calls without checkpoints** | Compound errors (90%^n accuracy) | Verify at each step; small, independent units |
| **Using AI for crypto/auth without expert review** | Subtle security flaws that look correct | Always require security expert review |
| **Letting AI choose dependencies** | May add unnecessary, unmaintained, or incompatible libraries | Human approves all new dependencies |
| **AI-generated tests that test implementation** | Tests break on refactor but don't catch bugs | Tests should verify behavior, not implementation details |
| **Blindly accepting AI refactors** | May change behavior while "improving" style | Run full test suite; diff behavior, not just code |

### 8.3 Process Anti-Patterns

| Anti-Pattern | Better Approach |
|---|---|
| Merging AI PRs to meet deadlines | Quality gates are non-negotiable; push deadline instead |
| Disabling CI for AI-generated code | AI code needs MORE scrutiny, not less |
| Using AI on protected branches directly | Always use feature branches with review |
| Skipping RCA because "AI fixed it" | Understand WHY it broke; prevent recurrence |
| Ignoring AI hallucinations because output looks clean | Verify facts, imports, API signatures against actual sources |

---

## 9. Prompt Engineering for Code Generation

### 9.1 The Anatomy of a Good Code Prompt

```
1. CONTEXT     — What exists (codebase, patterns, constraints)
2. TASK        — What you want (specific, bounded, measurable)
3. CONSTRAINTS — What to avoid (style rules, forbidden patterns, limits)
4. EXAMPLES    — What good output looks like (from your codebase)
5. OUTPUT      — What format you want (file, function, diff, test)
```

### 9.2 Prompt Quality Spectrum

| Quality | Example | Result |
|---------|---------|--------|
| Bad | "Write a function to handle users" | Vague, wrong assumptions, wrong patterns |
| OK | "Write a Python function to validate email addresses" | Works but may not match your patterns |
| Good | "Write a Python function to validate email addresses using our existing `ValidationError` pattern in `core/validators.py`. Follow the type hints and docstring style used there." | Matches codebase; ready for review |
| Great | Good + "Here's an example of an existing validator: [paste]. The new function should follow this exact pattern. It must handle: empty input, unicode domains, plus-addressing. Return type: `Result[str, ValidationError]`." | Production-ready with minor adjustments |

### 9.3 Prompting Techniques

| Technique | When to Use | Example |
|-----------|-------------|---------|
| **Show, don't tell** | When your codebase has established patterns | "Here's how we write API endpoints: [example]. Write one for /users/delete." |
| **Constrain the output** | When AI tends to over-generate | "Only modify the `parse_response` function. Do not change any other code." |
| **Think-then-code** | For complex logic | "First explain your approach, then implement. I'll approve the approach before you code." |
| **Negative examples** | When there are known pitfalls | "Do NOT use `eval()`. Do NOT add new dependencies. Do NOT modify the database schema." |
| **Incremental building** | For large features | Break into small prompts: design → interface → implementation → tests → integration |
| **Reference existing code** | For consistency | "Follow the patterns in `auth_service.py`. Use the same error handling approach." |

### 9.4 Context Files That Improve AI Output

| File | Purpose | Impact on AI Quality |
|------|---------|---------------------|
| `CLAUDE.md` | Project rules, architecture, patterns | Prevents wrong assumptions |
| `.editorconfig` | Formatting rules | Consistent style |
| `.eslintrc` / `ruff.toml` | Linting rules | Fewer lint failures in AI output |
| `tsconfig.json` / `pyproject.toml` | Language config | Correct type strictness, features |
| Test examples | How tests look in this project | Better test generation |
| API examples | How endpoints look in this project | Better API code generation |

---

## 10. Context Management

### 10.1 The Context Hierarchy

AI quality is directly proportional to context quality:

```
┌─────────────────────────────────────────────┐
│  Level 4: CONVERSATION CONTEXT              │
│  Current task, recent changes, active files  │
├─────────────────────────────────────────────┤
│  Level 3: PROJECT CONTEXT                   │
│  CLAUDE.md, architecture docs, config files │
├─────────────────────────────────────────────┤
│  Level 2: TEAM CONTEXT                      │
│  Coding standards, prompt library, patterns  │
├─────────────────────────────────────────────┤
│  Level 1: TOOL CONTEXT                      │
│  Model capabilities, tool limitations        │
└─────────────────────────────────────────────┘
```

### 10.2 What to Include in Project Context

| Context Type | What to Document | Where |
|---|---|---|
| Architecture | System design, module boundaries, data flow | `docs/architecture.md` |
| Patterns | How things are done in this codebase | `CLAUDE.md` |
| Gotchas | Known pitfalls, non-obvious constraints | `CLAUDE.md` |
| Conventions | Naming, file organization, import style | `CLAUDE.md` + linter config |
| API contracts | Endpoint shapes, auth patterns | OpenAPI spec or `docs/` |
| Data model | Schema, relationships, constraints | `docs/` or ORM models |
| Dependencies | What's used and why; what's NOT allowed | `CLAUDE.md` |
| History | Why past decisions were made | ADR (Architecture Decision Records) |

### 10.3 Context Window Management

AI tools have finite context. Prioritize what goes in:

| Priority | Content | Strategy |
|----------|---------|----------|
| 1 (always) | CLAUDE.md / project rules | Auto-loaded |
| 2 (always) | Files being modified | Read before edit |
| 3 (usually) | Related files (imports, callers) | Load on demand |
| 4 (when needed) | Architecture docs | Reference for design tasks |
| 5 (rarely) | Full codebase | Use search tools, not bulk loading |

**Rule**: Provide the minimum context needed for the task. More context isn't always better — it can dilute focus.

---

## 11. Testing Strategies for AI-Generated Code

### 11.1 Why AI Code Needs Special Testing Attention

AI-generated code has unique risk patterns:

| Risk | Example | Testing Strategy |
|------|---------|-----------------|
| **Looks correct, subtly wrong** | Off-by-one errors, wrong boundary conditions | Property-based testing, edge case focus |
| **Works for happy path, fails on edges** | Null handling, empty collections, unicode | Explicit edge case tests |
| **Correct logic, wrong integration** | Uses wrong API version, wrong config key | Integration tests with real dependencies |
| **Hallucinated APIs** | Calls methods that don't exist | Compilation/import verification |
| **Security-correct but logically wrong** | Validates input but applies wrong business rule | Domain-expert review + acceptance tests |
| **Test that tests itself** | AI-generated test mirrors implementation instead of verifying behavior | Review tests for independence from implementation |

### 11.2 Testing Pyramid for AI-Assisted Development

```
                    ┌─────────┐
                    │ Manual  │  Exploratory testing by humans
                    │ Testing │  (judgment, UX, edge cases AI misses)
                   ┌┴─────────┴┐
                   │   E2E     │  Critical user journeys
                   │  Tests    │  (Playwright, Cypress)
                  ┌┴───────────┴┐
                  │ Integration  │  Module interactions
                  │   Tests     │  (real DB, real APIs)
                 ┌┴─────────────┴┐
                 │  Unit Tests    │  Every function, every edge case
                 │               │  (pytest, jest)
                ┌┴───────────────┴┐
                │ Static Analysis  │  Types, lint, security scan
                │                 │  (mypy, ESLint, Bandit)
                └─────────────────┘
```

### 11.3 AI-Generated Test Quality Checklist

- [ ] Tests verify BEHAVIOR, not implementation details
- [ ] Tests include edge cases (null, empty, boundary, unicode, concurrent)
- [ ] Tests are independent — can run in any order
- [ ] Tests have clear arrange-act-assert structure
- [ ] Tests use meaningful assertion messages
- [ ] Tests don't duplicate existing test coverage
- [ ] Tests would catch a real bug if the implementation broke
- [ ] Mutation testing confirms tests are effective (not just coverage)

---

## 12. Governance, Security & Legal

### 12.1 Security Policy

| Concern | Policy |
|---------|--------|
| **Secrets** | Never allow AI tools to access or generate real secrets. Use secret scanning in CI (gitleaks, TruffleHog). |
| **Data privacy** | Understand provider's data usage policy. Never send PII, customer data, or proprietary algorithms to third-party models without legal approval. |
| **Code injection** | AI may generate `eval()`, shell commands, or dynamic SQL. Static analysis must catch these. |
| **Dependency risk** | AI may suggest unmaintained, vulnerable, or license-incompatible libraries. Require approval for all new deps. |
| **Auth code** | All authentication, authorization, and cryptographic code requires security team review regardless of author (AI or human). |

### 12.2 Data Classification for AI Tools

| Classification | Can Send to AI? | Examples |
|---|---|---|
| Public | Yes | Open-source code, public docs |
| Internal | Yes (with approved tools) | Internal business logic, non-sensitive configs |
| Confidential | With restrictions | Proprietary algorithms (check provider policy) |
| Restricted | No | Customer PII, credentials, financial data, health data |

### 12.3 Legal Considerations

| Risk | Mitigation |
|------|------------|
| AI suggests GPL-licensed code patterns in proprietary project | Run license checks in CI; legal review for risky cases |
| Copyright ambiguity of AI-generated code | Document AI usage; consult legal on IP policy |
| Regulatory compliance (SOC2, HIPAA, GDPR) | Audit trail of AI usage; data handling documentation |
| Liability for AI-generated bugs in production | Human review + approval = human responsibility |

### 12.4 Audit Trail Requirements

Every AI interaction that produces committed code must be traceable:

| Record | Where Stored | Retention |
|--------|-------------|-----------|
| Prompt used | PR description or internal log | Lifetime of the code |
| Model and version | PR metadata | Lifetime of the code |
| AI output (raw) | Internal log (optional but recommended) | 1 year minimum |
| Human modifications | Git diff (AI output vs committed code) | Git history |
| Reviewer approval | PR approval record | Git/platform history |

---

## 13. When NOT to Use AI

### 13.1 Hard No — Never Use AI For

| Category | Why |
|----------|-----|
| **Generating real credentials or secrets** | Insecure, not random enough, may leak |
| **Making production deployment decisions** | Requires human judgment and accountability |
| **Modifying infrastructure without review** | Blast radius too high |
| **Bypassing security controls** | Even if it "works" |
| **Final security audit** | AI can assist but not replace security experts |
| **Legal or compliance determinations** | Requires qualified human judgment |

### 13.2 Proceed with Extreme Caution

| Category | Risk | Required Mitigation |
|----------|------|---------------------|
| Cryptographic code | Subtle implementation flaws | Security expert review + known-good library usage |
| Financial calculations | Rounding, precision, regulatory rules | Domain expert review + property-based testing |
| Medical/safety-critical logic | Life-safety implications | Formal verification where possible |
| Privacy-sensitive data handling | GDPR, HIPAA violations | Privacy team review |
| Authentication & authorization | Access control bypass | Security team review + penetration testing |
| Database migrations | Data loss, corruption | DBA review + tested rollback plan |

### 13.3 Diminishing Returns — Consider Manual Instead

| Scenario | Why AI Helps Less |
|----------|-------------------|
| Deep domain-specific logic (rare business rules) | AI lacks domain context |
| Highly coupled legacy code with undocumented behavior | AI can't infer hidden contracts |
| Performance-critical hot paths | Requires profiling, not guessing |
| UX decisions and visual design | Requires human judgment and taste |
| Architectural decisions | Requires understanding of team, org, and long-term goals |

---

## 14. Failure Recovery & Rollback

### 14.1 When AI-Assisted Code Breaks Production

```
1. DETECT     — Monitoring alerts, user reports, health checks
2. CONTAIN    — Feature flag off, rollback, or hotfix
3. DIAGNOSE   — Root cause analysis (was it AI-specific or general?)
4. FIX        — Fix the root cause, not just the symptom
5. PREVENT    — Update tests, CI gates, prompt library, review process
6. DOCUMENT   — Post-mortem with specific AI-related learnings
```

### 14.2 Rollback Strategies

| Strategy | When to Use | Speed |
|----------|-------------|-------|
| Feature flag toggle | Code is flag-protected | Seconds |
| Git revert | Clean single-commit changes | Minutes |
| Canary rollback | Canary deployment detected issue | Minutes |
| Full deployment rollback | Wide-spread issue | Minutes to hours |
| Database rollback | Schema or data issue | Hours (plan ahead) |

### 14.3 Post-Mortem: AI-Specific Questions

In addition to standard post-mortem questions, ask:

- Was the AI-generated code the root cause or a contributing factor?
- Was the prompt insufficient? What context was missing?
- Did the review process catch this? If not, why?
- Should this type of change have been AI-generated at all?
- What CI gate would have caught this? Can we add it?
- Should this be added to the "When NOT to use AI" list?
- Update the prompt library with the lesson learned.

---

## 15. Metrics & Measurement

### 15.1 Measuring AI-Assisted Development ROI

| Metric | How to Measure | Target |
|--------|----------------|--------|
| **Velocity** | Story points / sprint (AI-assisted vs baseline) | 30-50% improvement |
| **Defect rate** | Bugs per 1000 lines (AI vs human code) | Parity or better |
| **Review time** | Hours per PR (AI-assisted vs manual) | Should NOT increase significantly |
| **Merge cycle time** | Time from PR open to merge | Maintain or improve |
| **Revert rate** | % of AI-assisted PRs reverted | <5% |
| **Test coverage** | Coverage of AI-generated code | Same as project standard |
| **Developer satisfaction** | Survey (quarterly) | Positive trend |

### 15.2 Warning Signs

| Signal | What It Means | Action |
|--------|--------------|--------|
| Revert rate >10% | AI code isn't being reviewed well enough | Increase review rigor |
| Review time doubling | AI diffs are too large or complex | Enforce smaller PRs |
| Test coverage dropping | AI code isn't being tested properly | Require tests with AI PRs |
| Same bug pattern repeating | Prompt library or CI gates need updating | Add specific gate or test |
| Developer frustration increasing | Tool is slowing them down, not speeding up | Retrain, adjust workflow |
| Security findings increasing | AI introducing vulnerabilities | Add security-specific gates |

### 15.3 Tracking Dashboard (Recommended Metrics)

```
Weekly AI Development Health:
├── PRs opened (total / ai-assisted %)
├── PRs merged (total / ai-assisted %)
├── PRs reverted (total / ai-assisted %)
├── CI failure rate (ai-assisted vs manual)
├── Average review time (ai-assisted vs manual)
├── Bugs filed against ai-assisted code
└── Developer sentiment (1-5 scale)
```

---

## 16. Team Onboarding & Skill Development

### 16.1 Onboarding Checklist for AI-Assisted Development

- [ ] Read this document
- [ ] Review the prompt library (`prompts/`)
- [ ] Read project `CLAUDE.md` and understand conventions
- [ ] Practice: generate tests for an existing module, review AI output
- [ ] Practice: have AI explain an unfamiliar part of the codebase
- [ ] Practice: submit an AI-assisted PR and go through review
- [ ] Understand the trust gradient (what needs more vs less scrutiny)
- [ ] Know when NOT to use AI (section 13)

### 16.2 Maintaining Human Skills

| Risk | Mitigation |
|------|------------|
| "Forgot how to write tests" | Rotate AI-free coding days or sprints |
| "Can't debug without AI" | Practice manual debugging in incident response |
| "Don't understand the architecture" | Code walkthroughs, design reviews, documentation ownership |
| "Rubber-stamping AI PRs" | Review training, pair reviewing, review quality metrics |
| "Can't estimate without AI" | Manual estimation exercises, planning poker |

### 16.3 Leveling Up with AI

| Level | Behavior | Next Step |
|-------|----------|-----------|
| **Beginner** | Uses AI for autocomplete and simple generation | Learn to provide better context and constraints |
| **Intermediate** | Writes structured prompts, reviews AI output critically | Build prompt library, teach others |
| **Advanced** | Uses AI for architecture exploration, multi-step workflows | Contribute to team AI practices, mentor beginners |
| **Expert** | Designs AI-integrated workflows, optimizes team processes | Lead AI practice, define org-wide standards |

---

## 17. Operational Rollout Plan

### Phase 1: Foundation (Week 1-2)

- [ ] Add `ai-assisted` label to repository
- [ ] Add PR checklist template (section 6.1)
- [ ] Add pre-commit hooks (formatting, lint, secret detection)
- [ ] Configure CI to require passes + CODEOWNERS approvals
- [ ] Create project `CLAUDE.md` with architecture, patterns, gotchas
- [ ] Define which files/modules are off-limits for AI

### Phase 2: Pilot (Week 3-4)

- [ ] Select 1-2 developers for pilot
- [ ] Start with low-risk AI use cases (tests, docs, boilerplate)
- [ ] Capture all prompts and outcomes in a shared log
- [ ] Weekly retro: what worked, what didn't, what surprised
- [ ] Begin building prompt library from successful prompts

### Phase 3: Expand (Week 5-8)

- [ ] Roll out to full team with training session
- [ ] Add AI-specific CI gates (duplicate detection, complexity analysis)
- [ ] Establish review pairing (experienced AI user + newcomer)
- [ ] Start tracking metrics (section 15)
- [ ] Monthly retro and process adjustment

### Phase 4: Optimize (Ongoing)

- [ ] Refine prompt library based on team usage
- [ ] Tighten or loosen controls based on metrics
- [ ] Share learnings across teams
- [ ] Update this document with new patterns and anti-patterns
- [ ] Quarterly AI practice review

---

## 18. Templates & Checklists

### 18.1 Quick Decision: Should I Use AI for This?

```
Is the task security-critical (auth, crypto, payments)?
  └── YES → Use AI for drafting only. Require security expert review.
  └── NO ↓

Is the task in a well-understood domain with established patterns?
  └── YES → Good candidate for AI. Provide context + examples.
  └── NO ↓

Is the task exploratory or architectural?
  └── YES → Use AI for research/options. Human makes final decision.
  └── NO ↓

Is the task repetitive/boilerplate?
  └── YES → Ideal for AI. Generate, review, ship.
  └── NO → Consider manual. AI may not add value here.
```

### 18.2 Daily AI-Assisted Development Checklist

```
Before starting:
  [ ] Pull latest main, rebase feature branch
  [ ] Check CLAUDE.md for any updates
  [ ] Review today's tasks and identify AI-suitable work

During work:
  [ ] Provide context with every AI prompt (files, patterns, constraints)
  [ ] Review AI output line-by-line before accepting
  [ ] Run tests after each AI-generated change
  [ ] Commit frequently with clear messages

Before PR:
  [ ] All CI gates pass locally
  [ ] PR labeled and prompt documented
  [ ] Self-review: would you approve this if a junior wrote it?
  [ ] Scope check: did AI change more than was asked?
```

### 18.3 Monthly AI Practice Health Check

```
Quantitative:
  [ ] AI-assisted PR revert rate < 5%?
  [ ] CI failure rate for AI PRs comparable to manual?
  [ ] Review time for AI PRs reasonable?
  [ ] Test coverage maintained or improved?

Qualitative:
  [ ] Team comfortable with AI tools?
  [ ] Review quality maintained (not rubber-stamping)?
  [ ] Prompt library growing and useful?
  [ ] New anti-patterns documented?
  [ ] Skills maintenance activities happening?
```

---

## Summary

AI-assisted development is a force multiplier, not a replacement for engineering discipline. The teams that get the most value are the ones that:

1. **Set clear boundaries** — where AI helps, where it doesn't
2. **Maintain high review standards** — AI code gets MORE scrutiny, not less
3. **Invest in context** — better context in = better code out
4. **Build institutional knowledge** — prompt libraries, pattern docs, shared learnings
5. **Measure and iterate** — track what's working, fix what isn't
6. **Keep human skills sharp** — AI augments, never replaces

The goal isn't to use AI everywhere. The goal is to use AI where it creates the most value with the least risk, and to have the processes in place to catch the rest.

---

## See Also

- [Module 16: HTC AI-Assisted Development POV](/modules/htc-ai-dev-pov) — The strategic framework that this module's best practices operationalize. Start here for the "why" before diving into the "how."
- [Module 12: AI Boundary Enforcement](/modules/ai-boundary-enforcement) — Enforcement mechanisms that complement the governance practices covered here.

---

*This document is a living guide. Update it as your team learns. Every mistake that isn't documented is a mistake repeated.*

*Last updated: 2026-02-19*
