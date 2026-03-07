# AI-Enabled Development Lifecycle

> A comprehensive operational framework for human-AI collaborative software development.
> Synthesizes the **GOTCHA Framework** (system structure) with the **SuperClaude Bharath Persona** (behavioral model) into a unified lifecycle.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [The GOTCHA Framework](#2-the-gotcha-framework)
3. [The Development Lifecycle](#3-the-development-lifecycle)
4. [Phase Details](#4-phase-details)
5. [System Architecture](#5-system-architecture)
6. [Operational Protocols](#6-operational-protocols)
7. [Quality Gates](#7-quality-gates)
8. [Memory & Learning](#8-memory--learning)
9. [Failure Recovery](#9-failure-recovery)
10. [File Structure](#10-file-structure)
11. [Quick Reference](#11-quick-reference)

---

## 1. Philosophy

### The Core Problem

LLMs are probabilistic. Business logic is deterministic. When AI tries to do everything itself, errors compound fast — 90% accuracy per step is ~59% accuracy over 5 steps.

### The Solution: Separation of Concerns

| Responsibility | Owner | Why |
|---|---|---|
| **Smart decisions** | AI (Orchestrator) | Reasoning, judgment, creativity |
| **Perfect execution** | Deterministic tools | Reliability, repeatability, speed |
| **Process clarity** | Goals | What to achieve, not how to behave |
| **Behavior settings** | Args | Shape how the system acts right now |
| **Domain knowledge** | Context | Reference material for reasoning |
| **Quality enforcement** | Human (Approval Gates) | Trust but verify |

### The Bharath Principle

> *"Technology alone is not enough. It's technology married with liberal arts, married with the humanities, that yields results that make our hearts sing."*

Every line of code should be so elegant, so intuitive, so *right* that it feels inevitable. The first solution that works is never good enough.

**Priority Hierarchy**: Elegance > System Integrity > Maintainability > Testing > Documentation > Speed

---

## 2. The GOTCHA Framework

A 6-layer architecture for agentic systems. The acronym maps the full stack:

```
┌─────────────────────────────────────────────────────────────┐
│                    GOTCHA FRAMEWORK                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  GOT (The Engine):                                          │
│  ─────────────────                                          │
│  G  Goals          Process definitions (what to achieve)    │
│  O  Orchestration  AI manager (reasoning + coordination)    │
│  T  Tools          Deterministic scripts (perfect execution)│
│                                                              │
│  CHA (The Context):                                         │
│  ──────────────────                                         │
│  C  Context        Domain knowledge & reference material    │
│  H  Hard Prompts   Reusable instruction templates           │
│  A  Args           Behavior settings & configuration        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

#### G — Goals (`goals/`)
- Task-specific instructions in clear markdown
- Each goal defines: objective, inputs, which tools to use, expected outputs, edge cases
- Written like briefing someone competent
- Only modified with explicit permission
- Goals are living documentation — updated when better approaches emerge

#### O — Orchestration (AI Manager)
- Reads the relevant goal
- Decides which tools to call and in what order
- Applies args settings to shape behavior
- References context for domain knowledge
- Handles errors, asks clarifying questions, makes judgment calls
- **Never executes work directly — delegates intelligently**

#### T — Tools (`tools/`)
- Scripts organized by workflow, each with **one job**
- Fast, documented, testable, deterministic
- They don't think. They don't decide. They execute.
- All tools listed in `tools/manifest.md` with a one-sentence description

#### C — Context (`context/`)
- Static reference material the system uses to reason
- Code analysis artifacts, architecture decisions, session state
- Shapes quality and reasoning — not process or behavior

#### H — Hard Prompts (`hardprompts/`)
- Reusable text templates for LLM sub-tasks
- Fixed instructions for common operations (code review, migration analysis, etc.)
- Not context, not goals — pure instruction templates

#### A — Args (`args/`)
- YAML/JSON files controlling current behavior
- Changing args changes behavior without editing goals or tools
- The orchestrator reads args before running any workflow

---

## 3. The Development Lifecycle

### The 7-Phase Cycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                 AI-ENABLED DEVELOPMENT LIFECYCLE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Phase 1    Phase 2    Phase 3    Phase 4    Phase 5    Phase 6     │
│  ANALYZE    DESIGN     VALIDATE   IMPLEMENT  TEST       ITERATE    │
│    │          │          │          │          │          │          │
│    ▼          ▼          ▼          ▼          ▼          ▼          │
│  Understand  Architect  SRC Loop   Craft      Verify     Refine    │
│  the problem the        ≥95%       the        quality    until      │
│  deeply      solution   converge   solution   gates      great     │
│    │          │          │          │          │          │          │
│    ▼          ▼          ▼          ▼          ▼          ▼          │
│  [GATE]    [GATE]     [GATE]    [GATE]     [GATE]    [GATE]       │
│  Approve   Approve    Approve   Review     All pass   Approve     │
│  analysis  design     plan      code       tests      release     │
│                                                                      │
│                              Phase 7                                │
│                              COMMIT                                 │
│                                │                                    │
│                                ▼                                    │
│                            Version &                                │
│                            document                                 │
│                                │                                    │
│                                ▼                                    │
│                            [GATE]                                   │
│                            Approve                                  │
│                            commit                                   │
│                                                                      │
│  ◄──────────── LEARNING LOOP ──────────────────────────────────►   │
│  Every failure strengthens the system. Update goals, fix tools.    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase Summary

| Phase | Action | AI Role | Human Role | Gate |
|-------|--------|---------|------------|------|
| 1. Analyze | Understand problem deeply | Read, investigate, gather evidence | Confirm problem statement | Approve analysis |
| 2. Design | Architect the solution | Present module design, interfaces | Review architecture | Approve design |
| 3. Validate | SRC loop on the plan | Run structural + semantic checks | Review convergence report | Approve plan |
| 4. Implement | Craft the code | Write elegant, tested code | Monitor progress | Review implementation |
| 5. Test | Verify quality gates | Run tests, capture evidence | Review results | All gates pass |
| 6. Iterate | Refine until great | Compare, measure, improve | Judge "good enough" | Approve release |
| 7. Commit | Version and document | Prepare commit, update docs | Final review | Approve commit |

---

## 4. Phase Details

### Phase 1: Analyze

**Objective**: Understand the problem so deeply that the solution becomes obvious.

**For Bug Fixes (RCA Required)**:
```
Root Cause Analysis
├── Problem: [What is actually happening — be specific]
├── Symptoms: [What the user reported/observed]
├── Root Cause: [WHY this is happening — dig deep]
├── Evidence: [Code snippets, logs, traces that prove it]
├── Proposed Fix
│   ├── Files to Change: [file:line — what change]
│   ├── Why This Fixes It: [How this addresses ROOT cause]
│   └── Risk Assessment
│       ├── Could break: [what might fail]
│       ├── Side effects: [ripple effects]
│       └── Test coverage: [is this tested?]
└── Approval: Proceed? (yes/no/discuss)
```

**For New Features (Discovery Required)**:
```
Feature Analysis
├── What: [Single sentence description]
├── Why: [Business/user need]
├── Who: [Who uses this]
├── Where: [Which modules/layers are affected]
├── Existing Patterns: [How similar things work in the codebase]
├── Dependencies: [What this needs, what depends on it]
└── Risks: [What could go wrong]
```

**GOTCHA Integration**:
- Check `goals/manifest.md` for existing relevant workflows
- Check `tools/manifest.md` for existing relevant tools
- Load `context/` for domain knowledge
- Read `args/` for current behavior settings

**Gate**: Human approves the analysis before proceeding.

---

### Phase 2: Design

**Objective**: Create an architecture so clear that anyone could understand it.

**For Every New Module**:
```
Module Design: [name]

Purpose: [single sentence]
Inputs: [what it receives]
Outputs: [what it produces]
Dependencies: [what it needs]
Used By: [who calls it]

Interface Contract:
  [function signatures, types, error handling]

Approve this design? (yes/no)
```

**Design Principles**:
- Single Responsibility — each function does ONE thing
- Clear naming — code reads like prose
- Error handling — graceful failures, meaningful messages
- Type safety — full typing, no `any` unless justified
- Loose coupling — minimize dependencies between components

**GOTCHA Integration**:
- Write the goal in `goals/` if this is a repeatable workflow
- Identify which tools need to be created/modified
- Define args if behavior needs to be configurable

**Gate**: Human approves the design before any code is written.

---

### Phase 3: Validate (SRC Loop)

**Objective**: Ensure the plan is structurally and semantically complete before implementation.

**Structured Reflective Consistency (SRC) Validation**:

```
SRC ITERATION CYCLE (Max: 5, Min: 2)
│
├── Step 1: STRUCTURAL CHECK
│   ├── All required components present?
│   ├── Dependencies defined?
│   └── Task completeness verified?
│
├── Step 2: SEMANTIC GAP ANALYSIS
│   ├── Logical completeness?
│   ├── Missing concerns? (persistence, config, error handling, auth)
│   └── Severity: HIGH / MEDIUM / LOW
│
├── Step 3: FEEDBACK INJECTION
│   ├── Generate corrective tasks for gaps
│   ├── Update dependencies
│   └── Recalculate estimates
│
└── Step 4: CONVERGENCE CHECK
    ├── Score = (structural * 0.4) + (semantic * 0.6)
    ├── If ≥ 95% → HALT → present for approval
    └── If < 95% → inject feedback → continue
```

**SRC Gap Categories**:

| Category | Checks |
|----------|--------|
| Structural | Missing components, undefined deps, incomplete tasks, missing I/O contracts |
| Persistence | Database/storage not defined, migration strategy missing |
| Configuration | Environment config absent, secrets management |
| Error Handling | Not standardized, missing recovery paths |
| Security | Auth/authz gaps, rate limiting, input validation |
| Observability | Logging absent, health checks undefined, monitoring missing |
| Caching | Strategy not considered, invalidation rules missing |

**Baton-Passing Task Design** (each task must define):
- **INPUT**: Explicit handoff artifacts from previous task
- **OUTPUT**: Explicit deliverables for next task
- **ACTIONS**: Atomic, completable in single session
- **VERIFY**: Testable completion criteria
- **HANDOFF**: Documentation file path for context transfer

**Gate**: Human approves the validated plan before implementation begins.

---

### Phase 4: Implement

**Objective**: Craft the solution — don't just code it.

**The Craftsmanship Standard**:
- Every function name should sing
- Every abstraction should feel natural
- Every edge case handled with grace
- First version is never good enough

**Implementation Workflow**:
```
1. Read existing code thoroughly (Read before Write — always)
2. Check goals/ for process guidance
3. Check tools/manifest.md for existing capabilities
4. Load args/ for current behavior settings
5. Reference context/ for domain knowledge
6. Write code following design from Phase 2
7. Run lint/typecheck continuously
8. Write tests alongside code (TDD when possible)
9. If creating a new tool → add to tools/manifest.md
10. If learning new constraints → update the relevant goal
```

**GOTCHA Rules During Implementation**:
- Never execute work the orchestrator should delegate to tools
- If a tool exists, use it. If you create one, add it to the manifest
- When tools fail: fix, test, document what you learned in the goal
- Push reliability into deterministic code, flexibility into AI reasoning

**Anti-Patterns**:
- Writing code without reading existing patterns first
- Skipping the manifest check
- Over-engineering (adding features nobody asked for)
- Suppressing errors silently
- Using `any` types without justification

**Gate**: Human reviews the implementation before testing.

---

### Phase 5: Test

**Objective**: Prove it works. Evidence, not assumptions.

**Testing Pyramid**:
```
         ┌─────────┐
         │  E2E    │  Few, critical paths only
         │ Tests   │
        ┌┴─────────┴┐
        │Integration │  Module interactions
        │  Tests     │
       ┌┴────────────┴┐
       │  Unit Tests   │  Every function, every edge case
       └───────────────┘
```

**Quality Gates (All Must Pass)**:
1. Syntax validation — no parse errors
2. Type checking — full type safety
3. Lint — code quality standards
4. Security — no OWASP top 10 violations
5. Unit tests — ≥80% coverage on changed code
6. Integration tests — module interactions verified
7. Performance — within budget (API <200ms, frontend <3s on 3G)
8. Documentation — public APIs documented

**Evidence Collection**:
- Test results with pass/fail counts
- Coverage reports
- Performance measurements
- Screenshots for UI changes

**Gate**: All quality gates pass before proceeding.

---

### Phase 6: Iterate

**Objective**: Refine until it's not just working, but insanely great.

**Iteration Protocol**:
```
1. Review against original requirements
2. Compare with design from Phase 2
3. Measure against quality budgets
4. Identify rough edges
5. Simplify ruthlessly — remove complexity without losing power
6. Re-run tests after each refinement
7. Get human judgment: "good enough" or "keep going"
```

**Simplification Checklist**:
- [ ] Can any abstraction be removed without losing functionality?
- [ ] Are there duplicate patterns that should be consolidated?
- [ ] Does the naming tell the story clearly?
- [ ] Would a new developer understand this in 5 minutes?
- [ ] Is every line earning its place?

**Gate**: Human approves the final state for release.

---

### Phase 7: Commit

**Objective**: Version control with meaningful history.

**Commit Protocol**:
```
1. Review all changes (git diff)
2. Stage specific files (never git add -A blindly)
3. Write commit message that explains WHY, not just WHAT
4. Never auto-commit — always get explicit approval
5. Update context/ with session decisions if significant
6. Update goals/ if process knowledge was gained
7. Update tools/manifest.md if new tools were created
```

**Commit Message Format**:
```
<type>: <concise description of WHY>

<body: what changed and why it matters>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Gate**: Human approves the commit before it's created.

---

## 5. System Architecture

### How the Layers Interact

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HUMAN                                       │
│                     (Approval Gates)                                 │
│                          │                                           │
│                          ▼                                           │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    ORCHESTRATION LAYER                         │  │
│  │                    (AI Manager / Claude)                       │  │
│  │                                                                │  │
│  │  Reads goals → Applies args → References context →            │  │
│  │  Uses hardprompts → Delegates to tools → Reports results      │  │
│  │                                                                │  │
│  │  ┌─────────────┐  ┌──────────┐  ┌───────────────────────┐    │  │
│  │  │ SuperClaude │  │ Bharath  │  │ Domain Personas       │    │  │
│  │  │ Framework   │  │ Persona  │  │ (architect, frontend, │    │  │
│  │  │ (behaviors) │  │ (base)   │  │  security, etc.)      │    │  │
│  │  └─────────────┘  └──────────┘  └───────────────────────┘    │  │
│  └───────┬──────────────┬──────────────┬──────────────┬──────────┘  │
│          │              │              │              │              │
│          ▼              ▼              ▼              ▼              │
│  ┌────────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐    │
│  │   goals/   │  │  tools/  │  │ context/  │  │ hardprompts/ │    │
│  │            │  │          │  │           │  │              │    │
│  │  Process   │  │ Scripts  │  │ Domain    │  │ Instruction  │    │
│  │  definitions│ │ & utils  │  │ knowledge │  │ templates    │    │
│  └────────────┘  └──────────┘  └───────────┘  └──────────────┘    │
│                                                                      │
│                        ┌──────────┐                                  │
│                        │  args/   │                                  │
│                        │          │                                  │
│                        │ Behavior │                                  │
│                        │ settings │                                  │
│                        └──────────┘                                  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     MEMORY LAYER                               │  │
│  │                                                                │  │
│  │  context/       Session state, code analysis, decisions       │  │
│  │  docs/          Architecture, specs, checklists               │  │
│  │  CLAUDE.md      Project-level persistent instructions         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Deterministic vs Probabilistic Boundary

The most critical design decision in AI-enabled development:

```
┌──────────────────────────┐     ┌──────────────────────────┐
│    PROBABILISTIC          │     │    DETERMINISTIC          │
│    (AI Orchestrator)      │     │    (Tools & Scripts)      │
│                           │     │                           │
│  - Reasoning about code   │     │  - AST parsing            │
│  - Architecture decisions │     │  - Database migrations     │
│  - Code review            │     │  - Test execution          │
│  - Natural language        │     │  - Linting                │
│  - Judgment calls         │     │  - File operations         │
│  - Creative solutions     │     │  - API calls               │
│  - Error diagnosis        │     │  - Build pipelines         │
│  - User interaction       │     │  - Data transformations    │
│                           │     │                           │
│  FLEXIBILITY matters      │     │  RELIABILITY matters       │
│  Approximate is OK        │     │  Exact is required         │
└──────────────────────────┘     └──────────────────────────┘
                │                              │
                └──────────┬───────────────────┘
                           │
                    APPROVAL GATES
                    (Human judgment)
                           │
                    The bridge between
                    "probably right" and
                    "definitely right"
```

---

## 6. Operational Protocols

### Protocol 1: Before Starting Any Task

```
1. Check goals/manifest.md — does a goal exist for this?
2. Check tools/manifest.md — do tools exist for this?
3. Load context/ — what do we already know?
4. Read args/ — what behavior settings apply?
5. Read CLAUDE.md — any project-specific rules?
6. THEN begin Phase 1 (Analyze)
```

### Protocol 2: When Tools Fail

```
1. Read the error and stack trace carefully
2. Identify root cause (not symptoms)
3. Fix the tool to handle the issue
4. Test until it works reliably
5. Update the relevant goal with new knowledge
6. Next time → automatic success
```

### Protocol 3: When Stuck

```
1. Explain what's missing
2. Explain what you need
3. Do NOT guess or invent capabilities
4. Do NOT brute-force retry the same approach
5. Consider alternative approaches
6. Ask the human for guidance
```

### Protocol 4: When Creating New Artifacts

```
New Tool → Add to tools/manifest.md
New Goal → Add to goals/manifest.md
New Pattern → Update relevant context/
New Constraint → Update relevant goal
Schema Change → Requires explicit approval
```

### Protocol 5: Context Preservation

```
Significant decision made → Document in context/
Session ending → Save state to context/
Architecture choice → Document in docs/
Learned constraint → Update the goal
Bug pattern found → Add to guardrails
```

---

## 7. Quality Gates

### The 8-Step Validation Cycle

Every change passes through these gates before it's considered complete:

| Step | Gate | What It Checks | Failure Action |
|------|------|-----------------|----------------|
| 1 | Syntax | Parses without errors | Fix immediately |
| 2 | Types | Full type safety, no implicit `any` | Fix before proceeding |
| 3 | Lint | Code quality standards met | Fix or justify exception |
| 4 | Security | No OWASP violations, no secrets in code | Block until resolved |
| 5 | Unit Tests | Functions work correctly in isolation | Fix code or update test |
| 6 | Integration | Modules work together correctly | Investigate interaction |
| 7 | Performance | Within budget (API <200ms, UI <3s) | Profile and optimize |
| 8 | Documentation | Public APIs documented, decisions recorded | Document before merge |

### Approval Gates (Non-Negotiable)

These are human checkpoints. AI proposes, human approves:

| Gate | When | What's Presented | Required Response |
|------|------|-------------------|-------------------|
| Analysis | After Phase 1 | Problem statement + RCA (bugs) or Feature Analysis (new) | "yes" to proceed |
| Design | After Phase 2 | Module design + interface contracts | "yes" to proceed |
| Plan | After Phase 3 | SRC-validated plan with ≥95% convergence | "yes" to proceed |
| Implementation | After Phase 4 | Working code + evidence | "yes" to proceed |
| Release | After Phase 6 | Final refined state | "yes" to release |
| Commit | Phase 7 | Diff + commit message | "yes" to commit |

### When to Skip Gates

Gates can be skipped ONLY when the human explicitly says:
- "just do it" or "skip RCA"
- Simple refactors the human explicitly requested
- Documentation-only changes
- The human has already approved the approach in this session

---

## 8. Memory & Learning

### The Continuous Improvement Loop

```
Every failure strengthens the system:

  1. Identify what broke and why
  2. Fix the tool script (deterministic layer)
  3. Test until it works reliably
  4. Update the goal with new knowledge (process layer)
  5. Update context if domain understanding changed
  6. Next time → automatic success

This is NOT optional. Every failure that isn't documented is a failure repeated.
```

### Memory Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MEMORY LAYERS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: CLAUDE.md (Always Loaded)                         │
│  ├── Project rules, architecture, gotchas                   │
│  └── Persistent across ALL sessions                         │
│                                                              │
│  Layer 2: context/ (Session State)                          │
│  ├── Current task, files modified, decisions made            │
│  └── Preserved across compactions within session             │
│                                                              │
│  Layer 3: docs/ (Long-Term Knowledge)                       │
│  ├── Architecture decisions, specs, checklists               │
│  └── Permanent project documentation                         │
│                                                              │
│  Layer 4: goals/ (Process Knowledge)                        │
│  ├── How to do things, what was learned                      │
│  └── Updated when better approaches emerge                   │
│                                                              │
│  Layer 5: Git History (Immutable Record)                    │
│  ├── What changed, when, why                                 │
│  └── The authoritative source of truth                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### What to Remember vs What to Discard

| Remember (Persist) | Discard (Ephemeral) |
|---|---|
| Architecture decisions and WHY | Raw debug output |
| API constraints discovered | Intermediate scratch work |
| Patterns that work | Failed experiment details (keep summary) |
| Gotchas and edge cases | Temporary file contents |
| User preferences | Session-specific state after completion |
| Tool improvements | Verbose logs |

---

## 9. Failure Recovery

### Error Classification

| Type | Example | Recovery |
|------|---------|----------|
| Syntax | Parse error, missing import | Fix immediately, re-run |
| Runtime | Null reference, type mismatch | RCA, fix root cause |
| Logic | Wrong algorithm, bad conditional | Trace data flow, fix logic |
| Integration | API change, dependency issue | Check compatibility, update |
| Performance | Timeout, memory issue | Profile, optimize critical path |
| Process | Wrong approach, missing context | Re-enter Phase 1 (Analyze) |

### Blast Radius Assessment

Before fixing anything, assess impact:

```
1. What other features could be affected?
2. Are there shared utilities involved?
3. What's the dependency chain?
4. Could the fix introduce new issues?
5. Is this a symptom or the root cause?
```

### Change Size Classification

| Size | Scope | Backup Strategy |
|------|-------|-----------------|
| Small | <10 lines, single function | Comment old code with reason |
| Medium | Multiple functions, <50 lines | Git branch before changes |
| Large | Multiple files, >50 lines | Full design cycle (Phases 1-3) |

---

## 10. File Structure

### Where Things Live

```
project-root/
│
├── CLAUDE.md              # Project rules (always loaded by AI)
│
├── goals/                 # Process Layer
│   ├── manifest.md        # Index of all goal workflows
│   └── *.md               # Individual goal definitions
│
├── tools/                 # Execution Layer
│   ├── manifest.md        # Master list of tools
│   └── <workflow>/        # Scripts organized by domain
│
├── args/                  # Behavior Layer
│   └── *.yaml             # Current behavior settings
│
├── context/               # Context Layer
│   ├── context.md         # Session state
│   └── *.md               # Domain knowledge artifacts
│
├── hardprompts/           # Instruction Templates
│   └── *.md               # Reusable LLM instruction templates
│
├── docs/                  # Long-Term Knowledge
│   ├── architecture.md    # System architecture
│   └── *.md               # Specs, checklists, guides
│
├── config/                # Application Configuration
│   └── codeloom.yaml      # Unified app config
│
├── codeloom/              # Application Code
│   ├── api/               # FastAPI routes and middleware
│   ├── core/              # Business logic and services
│   └── tests/             # Test suites
│
└── frontend/              # React SPA
    └── src/               # Components, pages, services
```

### Manifest Files

Every layer with multiple files has a manifest:
- `goals/manifest.md` — Index of all goal workflows with one-sentence descriptions
- `tools/manifest.md` — Master list of all tools with one-sentence descriptions

**Rule**: If you create a new goal or tool, you MUST add it to the manifest.

---

## 11. Quick Reference

### The Lifecycle in One Sentence

> Analyze deeply, design elegantly, validate rigorously, implement craftfully, test thoroughly, iterate relentlessly, commit intentionally — and learn from everything.

### Do

- Read before Write (always)
- Check manifests before creating new artifacts
- Present RCA before fixing bugs
- Get approval before implementing designs
- Push reliability into tools, flexibility into AI
- Document what you learn
- Simplify ruthlessly

### Don't

- Write code without reading existing patterns
- Skip approval gates
- Auto-commit without permission
- Guess when you can verify
- Brute-force retry failed approaches
- Over-engineer or add unrequested features
- Suppress errors silently

### The GOTCHA Checklist (Before Every Task)

- [ ] Goal exists? Check `goals/manifest.md`
- [ ] Tool exists? Check `tools/manifest.md`
- [ ] Context loaded? Read `context/`
- [ ] Args applied? Check `args/`
- [ ] CLAUDE.md read? Check project rules
- [ ] Approval gate clear? Human said "yes"

### Your Job in One Sentence

You sit between what needs to happen (goals) and getting it done (tools). Read instructions, apply args, use context, delegate well, handle failures, strengthen the system with each run, and never settle for "works" when "insanely great" is possible.

---

## See Also

- [Module 16: HTC AI-Assisted Development POV](/modules/htc-ai-dev-pov) — The strategic POV introducing the 7-phase lifecycle that this module fully operationalizes.
- [Module 14: AI + Manual Hybrid Workflow](/modules/ai-hybrid-workflow) — Daily workflow patterns that implement lifecycle phases at the sprint level.

---

*This document is the synthesis of the GOTCHA Framework (system structure) and the SuperClaude Bharath Persona (behavioral model). It defines how AI-enabled development operates in this project.*

*Last updated: 2026-02-19*
