# AI + Manual Hybrid Development Workflow

> A practical playbook for sprints where both humans and AI touch the same stories. Covers the daily workflow, conflict prevention, conflict resolution, and how PRs serve as the central coordination mechanism.

---

## Table of Contents

1. [The Hybrid Reality](#1-the-hybrid-reality)
2. [Big-Picture Rules](#2-big-picture-rules)
3. [The Daily Workflow](#3-the-daily-workflow)
4. [Keeping AI Changes Sane](#4-keeping-ai-changes-sane)
5. [Conflict Prevention](#5-conflict-prevention)
6. [Conflict Resolution: Step by Step](#6-conflict-resolution-step-by-step)
7. [AI vs Human Conflicts](#7-ai-vs-human-conflicts)
8. [The PR as Conflict Resolution Engine](#8-the-pr-as-conflict-resolution-engine)
9. [PR Patterns That Reduce Conflicts](#9-pr-patterns-that-reduce-conflicts)
10. [Review Dynamics in Hybrid Teams](#10-review-dynamics-in-hybrid-teams)
11. [Sprint Ceremonies for Hybrid Teams](#11-sprint-ceremonies-for-hybrid-teams)
12. [Story Decomposition for AI + Manual Work](#12-story-decomposition-for-ai--manual-work)
13. [Testing Strategy for Hybrid Code](#13-testing-strategy-for-hybrid-code)
14. [Binary Assets & Non-Mergeable Files](#14-binary-assets--non-mergeable-files)
15. [CI/CD Enforcement](#15-cicd-enforcement)
16. [When Things Go Wrong](#16-when-things-go-wrong)
17. [Team Habits That Reduce Churn](#17-team-habits-that-reduce-churn)
18. [Quick Reference](#18-quick-reference)

---

## 1. The Hybrid Reality

### What "Hybrid" Actually Looks Like

In practice, most stories in a sprint involve a mix:

```
Story: "Add user settings page"
│
├── Human decides the data model and API shape
├── AI scaffolds the React component
├── Human writes the business logic for validation
├── AI generates unit tests from the implementation
├── Human reviews, adjusts edge cases
├── AI writes documentation
├── Human does the final review and merge
│
└── Result: 70% AI-generated, 100% human-reviewed
```

The question isn't "AI or manual" — it's "how do they coexist on the same branch, same story, same sprint without creating chaos?"

### The Three Failure Modes

| Failure Mode | What Happens | Root Cause |
|---|---|---|
| **Conflict explosion** | Rebasing is a nightmare; PRs are unmergeable | Large diffs, infrequent syncs, no coordination |
| **Quality erosion** | Bugs slip through; AI code isn't properly tested | Rubber-stamping AI output; missing test coverage |
| **Accountability gap** | Nobody owns the AI-generated code | No provenance; no clear human responsible for review |

This playbook prevents all three.

---

## 2. Big-Picture Rules

Seven rules. Memorize them.

| # | Rule |
|---|------|
| 1 | Work in short feature branches — one branch per story/subtask |
| 2 | Keep AI edits and manual edits on the same branch, but tag every AI run with `exec_id` + prompt in the commit |
| 3 | Push frequently, open PRs early, keep them small |
| 4 | Require human review for any AI-assisted changes — no exceptions |
| 5 | Let CI enforce tests/lint/security before merges |
| 6 | Use feature flags for risky behavior changes |
| 7 | When AI and human conflict, human business logic wins — always |

---

## 3. The Daily Workflow

### 3.1 Starting the Day

```bash
# 1. Sync with main
git checkout main && git pull origin main

# 2. Create or switch to your story branch
git switch -c feat/S1234-user-settings
# or if continuing:
git checkout feat/S1234-user-settings
git fetch origin && git rebase origin/main
```

### 3.2 Working: Manual + AI Interleaved

```bash
# --- MANUAL WORK ---
# Edit files directly, write business logic
git add codeloom/api/routes/settings.py
git commit -m "feat(settings): add user preferences endpoint

Manual implementation of validation rules per PM spec."

# --- AI WORK ---
# Use your AI tool/CLI (returns exec_id)
# AI generates the frontend component
git add frontend/src/pages/Settings.tsx
git commit -m "feat(settings): scaffold settings page component

AI-EXE: 7f3a1c2e-xxxx-xxxx-xxxx-xxxxxxxx
AI-PROMPT: 'Create a settings page with dark mode toggle and notification prefs'
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# --- MANUAL REFINEMENT OF AI OUTPUT ---
# Review AI output, adjust, then commit
git add frontend/src/pages/Settings.tsx
git commit -m "feat(settings): refine AI-generated component

Adjusted validation logic, fixed accessibility labels,
added error handling for API failures."

# --- AI GENERATES TESTS ---
git add frontend/src/pages/Settings.test.tsx
git commit -m "test(settings): add unit tests for settings page

AI-EXE: 8b4c2d3f-xxxx-xxxx-xxxx-xxxxxxxx
AI-PROMPT: 'Generate unit tests for Settings.tsx covering happy path and error states'"
```

### 3.3 Pushing and Opening PR

```bash
# Push frequently (at least end of day, ideally after each logical unit)
git push -u origin feat/S1234-user-settings

# Open a PR early (draft if incomplete)
gh pr create --draft \
  --title "feat: add user settings page (S-1234)" \
  --body "$(cat <<'EOF'
## Summary
- User settings page with dark mode and notification preferences
- API endpoint for persisting preferences

## AI-Assisted
- [x] This PR includes AI-assisted changes
- ExecID: 7f3a1c2e-xxxx, 8b4c2d3f-xxxx
- AI-generated: Settings.tsx (scaffold), Settings.test.tsx
- Human-written: settings.py (API), validation logic, accessibility fixes

## Testing
- Unit tests: yes (AI-generated + human-reviewed)
- Manual testing: yes (dark mode toggle, notification save/load)
EOF
)"
```

### 3.4 End of Day

```bash
# Sync before leaving
git fetch origin
git rebase origin/main
# Resolve any conflicts now while context is fresh
git push --force-with-lease
```

---

## 4. Keeping AI Changes Sane

### 4.1 The ai-commit Wrapper

Automate provenance so it's never forgotten:

```
Developer runs:
  ai-commit --prompt "Refactor settings to hooks" --allowed-paths "frontend/src/pages/"

Wrapper does:
  1. Scrubs secrets from prompt
  2. Calls model with prompt + relevant file context
  3. Stores {prompt, response, model, timestamp} → returns exec_id
  4. Applies changes to working directory
  5. Validates: all modified files within --allowed-paths?
     YES → Stage and commit with AI-EXE footer
     NO  → Reject out-of-scope changes, show which owners to contact
  6. Pushes to current branch
```

### 4.2 Scoping AI Output

| Control | How | Why |
|---|---|---|
| `--allowed-paths` | Restrict AI to specific directories | Prevents cross-boundary changes |
| Context files (CLAUDE.md) | Tell AI about project patterns and off-limits areas | Better output, fewer conflicts |
| Small, focused prompts | One task per AI invocation | Predictable, reviewable output |
| Review before commit | Always `git diff` before staging AI output | Catch scope creep early |

### 4.3 The Review-Before-Stage Habit

Never blindly `git add .` after an AI run:

```bash
# After AI generates changes:
git diff                          # Review unstaged changes
git diff --stat                   # See which files were touched
git add -p                        # Stage interactively, hunk by hunk
# or
git add <specific-files>          # Stage only what you intended
```

---

## 5. Conflict Prevention

### 5.1 Tactical Measures (Ranked by Impact)

| Rank | Tactic | Impact | Effort |
|---|---|---|---|
| 1 | **Small PRs** | Reduces conflict surface by ~80% | Medium (discipline) |
| 2 | **Rebase daily** | Catches conflicts early | Low (habit) |
| 3 | **Open PR early** | Surfaces issues sooner | Low |
| 4 | **CODEOWNERS** | Right people review right files | Low (one-time setup) |
| 5 | **Feature flags** | Merge early, activate later | Medium |
| 6 | **Pre-commit hooks** | Clean code before push | Low (one-time setup) |
| 7 | **Communicate in standup** | "I'm AI-generating settings page today" | Free |
| 8 | **One branch per story** | Prevent multi-story branch conflicts | Low (discipline) |
| 9 | **AI path scoping** | AI can't touch other teams' files | Medium |
| 10 | **Merge queues** | Serialize merges, prevent race conditions | Low (config) |

### 5.2 The Rebase Rhythm

```
Morning:  git fetch origin && git rebase origin/main
Midday:   git fetch origin && git rebase origin/main  (if active repo)
Pre-push: git fetch origin && git rebase origin/main
```

Every rebase should be followed by a local test run. If tests pass, push. If they don't, fix before pushing.

### 5.3 High-Conflict Zones in Hybrid Development

Files that both AI and humans frequently touch:

| File Type | Why It Conflicts | Prevention |
|---|---|---|
| Route registrations | Multiple stories add routes | Alphabetize; use auto-discovery |
| Shared types/interfaces | Multiple features extend types | Open PR for type changes first; others rebase onto it |
| Configuration files | AI adds config, humans add config | Coordinate; review config PRs quickly |
| Package manifests | AI suggests deps, humans add deps | Lock file merge strategy; regenerate don't merge |
| Test fixtures | Multiple stories add test data | Namespace fixtures by story |
| CSS/style globals | AI and humans both touch styling | Use scoped styles; avoid global CSS |
| Index/barrel files | Every new module modifies the barrel | Auto-generate or lazy imports |

---

## 6. Conflict Resolution: Step by Step

### 6.1 Rebase Method (Preferred)

```bash
# 1. Fetch latest
git fetch origin

# 2. Start rebase
git checkout feat/S1234-user-settings
git rebase origin/main

# 3. Git stops at each conflicting commit
#    Open the conflicting file(s)
#    Look for <<<<<<< / ======= / >>>>>>> markers

# 4. For each conflict, decide:
#    - Is this MY change or THEIRS?
#    - Is this AI-generated or human-written?
#    - Which version is correct for the business logic?
#    - Can both changes coexist?

# 5. After resolving each file:
git add path/to/resolved-file

# 6. Continue the rebase
git rebase --continue

# 7. Repeat for each conflicting commit

# 8. Run the FULL test suite
pytest && cd frontend && npm test

# 9. Push safely
git push --force-with-lease origin feat/S1234-user-settings

# 10. Update PR description with conflict resolution notes
```

### 6.2 Merge Method (Alternative)

```bash
git fetch origin
git merge origin/main

# Resolve conflicts in each file
git add <resolved-files>
git commit                    # Git provides default merge message

# Run tests
pytest && cd frontend && npm test

# Push
git push origin feat/S1234-user-settings
```

### 6.3 Conflict Decision Tree

```
Conflict detected in a file
│
├── Is it a lockfile (package-lock.json, poetry.lock)?
│   └── Delete it, regenerate: npm install / poetry lock
│
├── Is it a migration file?
│   └── Accept incoming, regenerate your migration with new timestamp
│
├── Is it auto-generated code (types, barrels, configs)?
│   └── Regenerate from source, don't manually merge
│
├── Is it an additive conflict (both sides added to same list)?
│   └── Keep both additions, verify order doesn't matter, run tests
│
├── Is it AI vs human on the same function?
│   └── See Section 7 (AI vs Human Conflicts)
│
└── Is it human vs human?
    └── Discuss in PR thread, agree on correct behavior, codify in test
```

---

## 7. AI vs Human Conflicts

### 7.1 The Core Rule

> **When AI-generated code conflicts with human-written code, human business logic wins.** AI can be re-run; human judgment cannot be auto-generated.

### 7.2 Decision Matrix

| Conflict Type | Resolution | Action |
|---|---|---|
| AI refactored a function that a human also changed | Keep human's version; re-run AI if needed | `git checkout --theirs <file>` (keep human) |
| AI and human both added to the same list/config | Keep both if independent; merge manually | Manual merge, verify no duplicates |
| AI introduced a regression that conflicts with a fix | Revert AI changes; apply fix manually | `git checkout --ours <file>` (keep fix) |
| AI improved code style; human changed behavior | Keep human's behavior, optionally re-apply style | Selective merge |
| Both AI and human wrote tests for the same function | Keep both if they test different cases; deduplicate | Manual review |

### 7.3 Workflow for AI Conflict Resolution

```bash
# If AI changes are the problem, revert them on your branch:
git log --grep="AI-EXE" --oneline       # Find AI commits
git revert <ai-commit-hash>             # Revert specific AI commit
# Then re-run AI with a more constrained prompt, or write manually

# If you want to keep PARTS of AI output:
git diff HEAD~1 -- <file>               # See what AI changed
# Manually cherry-pick the good parts into a new commit
```

### 7.4 Documenting the Resolution

In the PR, always note when you resolved an AI vs human conflict:

```markdown
## Conflict Resolution Notes
- `Settings.tsx`: AI-generated scaffold conflicted with @alice's validation changes.
  Kept Alice's validation logic, re-applied AI's layout structure.
  ExecID 7f3a1c2e no longer fully represented in final code.
- `api.ts`: Both AI and manual changes added API methods.
  Merged both; deduplicated the settings endpoint definition.
```

---

## 8. The PR as Conflict Resolution Engine

### 8.1 Why PRs Are the Natural Conflict Resolution Point

| PR Capability | How It Resolves Conflicts |
|---|---|
| Centralized discussion | Everyone sees the change, its context, and the conflicts |
| CI validation | Tests run on the combined diff before merge — catches integration issues |
| CODEOWNERS routing | Right domain experts automatically assigned |
| Audit trail | Who reviewed, what comments, which commits — traceable for debugging |
| Suggested changes | Reviewers can propose fixes inline — author applies with one click |
| Merge checks | Branch must be current with main before merge |

### 8.2 The PR Conflict Resolution Flow

```
Developer opens PR (early, even as draft)
│
├── PR shows diff against main
│   └── Conflicts visible immediately if branch is behind
│
├── CI runs on current state
│   └── Tests catch integration issues early
│
├── Reviewers comment on conflicts or concerns
│   └── Discussion happens IN the PR, not over Slack
│
├── Developer rebases and resolves
│   └── git rebase origin/main → fix → push --force-with-lease
│
├── CI re-runs on updated branch
│   └── Validates the resolution
│
├── Reviewers re-review resolved state
│   └── Confirm resolution is correct
│
├── CODEOWNERS approve their areas
│   └── Domain experts sign off
│
└── Merge (squash or merge commit)
    └── Clean entry into main
```

### 8.3 Using PR Features for Conflict Resolution

| Feature | How to Use It |
|---|---|
| **Draft PRs** | Open early to surface conflicts; mark ready when done |
| **Review comments** | Discuss conflicting logic inline, at the exact line |
| **Suggested changes** | Reviewer proposes fix; author applies with one click |
| **Require up-to-date branch** | Force rebase before merge; ensures no stale conflicts |
| **Required status checks** | CI must pass after every push, including conflict resolutions |
| **Merge queues** | Serialize merges so CI validates each PR against latest main |
| **PR labels** | `ai-assisted`, `has-conflicts`, `needs-rebase` for visibility |
| **Auto-merge** | After approvals + passing CI, merge automatically — reduces window for new conflicts |

---

## 9. PR Patterns That Reduce Conflicts

### 9.1 The Stacking Pattern

Instead of one large PR, stack small dependent PRs:

```
PR 1: Add API types/interfaces (small, merge first)
  │
  └── PR 2: Implement API endpoint (depends on PR 1)
       │
       └── PR 3: Add frontend page (depends on PR 2)
            │
            └── PR 4: Add tests (depends on PR 3)
```

**Benefits**: Each PR is small, reviewable, and merges independently. Conflicts are isolated to their scope.

### 9.2 The Contract-First Pattern

```
Step 1: PR with interface/type definitions only
        (Small, fast to review, merge quickly)

Step 2: Backend PR implements the interface
        (Can be AI-assisted)

Step 3: Frontend PR consumes the interface
        (Can be AI-assisted, no conflict with Step 2)

Step 4: Test PR validates the integration
        (Can be AI-generated)
```

**Why it works**: By merging the contract first, backend and frontend can work in parallel without conflicting on interface definitions.

### 9.3 The Flag-and-Merge Pattern

```
PR 1: Add feature-flagged code (disabled by default)
      → Merge immediately, no risk

PR 2: Enable flag for internal testing
      → Small config change, quick review

PR 3: Enable flag for canary (5% of users)
      → Monitor metrics

PR 4: Enable flag for all users (or remove flag)
      → Full rollout after validation
```

**Why it works**: Code lands early, reducing branch divergence. Behavior is controlled separately from code.

### 9.4 The Separation of Concerns Pattern

When a story involves both AI and manual work, split by concern:

```
PR A: API endpoint (human-written, business logic)
PR B: UI component (AI-scaffolded, human-refined)
PR C: Tests (AI-generated, human-reviewed)
PR D: Documentation (AI-generated)
```

Each PR has a clear author and review profile. AI-heavy PRs get extra scrutiny without slowing down human-written PRs.

---

## 10. Review Dynamics in Hybrid Teams

### 10.1 Who Reviews What

| Code Origin | Primary Reviewer | Focus |
|---|---|---|
| Human-written business logic | Domain expert | Correctness, edge cases, design fit |
| AI-scaffolded UI | Frontend developer | Accessibility, responsiveness, patterns |
| AI-generated tests | Original code author | Test quality, meaningful assertions, coverage gaps |
| AI-generated docs | Domain expert | Accuracy, completeness |
| Mixed (AI + human on same file) | Senior developer | Integration coherence, no conflict artifacts |

### 10.2 Review Effort by AI Trust Level

| Trust Level | Review Depth | Time Estimate |
|---|---|---|
| AI-generated formatting/style | Quick scan | 2-5 min |
| AI-generated docs/comments | Read for accuracy | 5-10 min |
| AI-generated tests | Verify assertions are meaningful, not just coverage padding | 10-20 min |
| AI-generated boilerplate/scaffold | Check patterns, naming, error handling | 15-30 min |
| AI-generated business logic | Line-by-line, question every decision | 30-60 min |
| AI-generated auth/security code | Security team deep review | 60+ min |

### 10.3 The "Second Opinion" Pattern

For complex AI-generated code, use a different AI to review:

```
Developer's AI → generates code
Different AI   → reviews the code (fresh perspective, catches blind spots)
Human reviewer → final decision
```

Not a replacement for human review, but an additional signal. Especially useful for catching hallucinated APIs or wrong patterns.

### 10.4 Avoiding Review Fatigue

Large AI-generated PRs cause reviewer fatigue — the #1 cause of bugs slipping through:

| Problem | Solution |
|---|---|
| 500+ line AI PR | Split into multiple focused PRs |
| Many files, all AI-generated | Highlight which files need deep review vs scan |
| Repetitive boilerplate | Note in PR: "files X-Y are boilerplate, focus review on Z" |
| Reviewer doesn't understand the prompt | Include the prompt in the PR description |
| Too many AI PRs in one sprint | Set a team limit; prioritize human-written PRs for review |

---

## 11. Sprint Ceremonies for Hybrid Teams

### 11.1 Sprint Planning

| Activity | AI Consideration |
|---|---|
| Story estimation | Factor in AI scaffolding time AND review time (AI saves dev time but adds review time) |
| Story decomposition | Identify which subtasks are AI-suitable vs human-required (see Section 12) |
| Capacity planning | Account for review burden of AI-generated code |
| Risk assessment | Flag stories where AI might touch shared/critical code |

### 11.2 Daily Standup

Add one question to standup: **"Did you use AI on your story? Which files?"**

| Why | Benefit |
|---|---|
| Surfaces potential conflicts early | "Alice and I both used AI on the settings module — let's coordinate" |
| Alerts reviewers | "My PR has AI-generated auth code — need security review" |
| Tracks AI usage naturally | Team develops intuition for when AI helps vs hurts |

### 11.3 Sprint Review / Demo

When demoing AI-assisted features:
- Note which parts were AI-generated (transparency)
- Highlight where human judgment improved AI output
- Share prompts that worked well (grow the prompt library)
- Discuss where AI caused problems (grow the anti-pattern list)

### 11.4 Retrospective

Add to retro template:

```
AI-SPECIFIC RETRO QUESTIONS:
- Where did AI save the most time this sprint?
- Where did AI cause the most problems?
- Did any AI-generated code make it to production with bugs?
- Were any PRs harder to review because of AI-generated code?
- Should any prompts be added to the prompt library?
- Should any areas be restricted from AI editing?
```

---

## 12. Story Decomposition for AI + Manual Work

### 12.1 The Decomposition Matrix

| Subtask Type | AI Suitability | Why |
|---|---|---|
| Data model / schema | Low | Requires domain knowledge, migration strategy |
| API interface / types | Medium | Good for scaffolding, needs human validation |
| API implementation | Medium | Good for boilerplate, business logic needs human |
| UI scaffolding | High | AI excels at component structure |
| Business logic | Low | Requires domain context, subtle correctness |
| Validation rules | Medium | AI can generate, human must verify rules |
| Error handling | Medium | AI can scaffold, human refines messages and recovery |
| Unit tests | High | AI generates well from implementation |
| Integration tests | Medium | AI can scaffold, human defines scenarios |
| Documentation | High | AI drafts, human reviews accuracy |
| Performance optimization | Low | Requires profiling and measurement, not guessing |
| Security implementation | Very Low | Must be human-led with security review |

### 12.2 Example Story Decomposition

```
STORY: "As a user, I want to configure notification preferences"

Subtask 1: Define data model (MANUAL)
  - Add notification_preferences to user model
  - Create alembic migration
  - Human: domain knowledge required, DBA review

Subtask 2: API endpoint (HYBRID)
  - AI: scaffold FastAPI route structure
  - Human: implement validation, business rules
  - Human: error handling, rate limiting

Subtask 3: Frontend component (AI-ASSISTED)
  - AI: generate Settings page scaffold
  - Human: refine accessibility, error states
  - Human: connect to API, handle loading/error

Subtask 4: Tests (AI-ASSISTED)
  - AI: generate unit tests from implementation
  - Human: review assertions, add edge cases
  - Human: write integration test for full flow

Subtask 5: Documentation (AI-GENERATED)
  - AI: generate API docs, component docs
  - Human: review accuracy
```

---

## 13. Testing Strategy for Hybrid Code

### 13.1 Testing Responsibilities

| Who Wrote It | Who Tests It | Focus |
|---|---|---|
| Human wrote code | AI generates tests, human reviews | Does AI understand the intent? |
| AI wrote code | Human writes tests | Does AI's code actually work for edge cases? |
| AI wrote code + AI wrote tests | Human reviews BOTH | Do the tests meaningfully validate the code? |
| Human refined AI code | Human updates AI's tests | Do tests cover the refinements? |

### 13.2 The Hybrid Testing Flow

```
1. Human writes business logic
2. AI generates unit tests → Human reviews:
   - Are assertions meaningful (not just "returns something")?
   - Are edge cases covered (null, empty, boundary, concurrent)?
   - Do tests verify BEHAVIOR, not implementation details?

3. AI scaffolds UI component
4. Human writes integration test → Verifies AI's code against real behavior
   - Don't trust AI to test its own output without human validation

5. Both AI and human changes merge
6. Full test suite runs in CI → Catches integration issues
```

### 13.3 Test Quality Signals

| Signal | Healthy | Unhealthy |
|---|---|---|
| AI-generated test assertions | Check business rules, edge cases | Just check "result is not null" |
| Test names | Describe behavior: "returns error when email invalid" | Describe implementation: "calls validate function" |
| Coverage | Meaningful coverage of critical paths | 100% coverage of trivial code |
| Mutation testing | Tests catch mutants (behavior changes) | Tests pass even with mutated code |
| Independence | Tests pass in any order | Tests depend on execution order |

---

## 14. Binary Assets & Non-Mergeable Files

### 14.1 Git LFS for Binary Files

When a story touches binary assets (images, diagrams, compiled files):

```bash
# Lock the file before working on it
git lfs lock path/to/diagram.png

# Work, commit, push
git add path/to/diagram.png
git commit -m "docs: update architecture diagram"
git push

# Unlock when done
git lfs unlock path/to/diagram.png
```

### 14.2 Non-Mergeable File Strategies

| File Type | Strategy |
|---|---|
| Binary images | Git LFS locks; one person edits at a time |
| Generated lockfiles | Regenerate, don't merge (`npm install`, `poetry lock`) |
| Compiled outputs | Never commit; regenerate from source in CI |
| Database exports | Use migration scripts, not data dumps |
| Design files (Figma, Sketch) | Keep in external tool, link from repo |

---

## 15. CI/CD Enforcement

### 15.1 Required Checks

```
Every PR (human or AI):
  ├── Tests pass
  ├── Lint passes
  ├── Type check passes
  ├── Security scan passes
  ├── Secret detection passes
  └── Branch is up-to-date with main

AI-assisted PRs (additional):
  ├── ExecID present in PR body
  ├── ai-assisted label applied
  ├── Diff size within threshold (or senior reviewer)
  └── No changes to blocked paths
```

### 15.2 Merge Requirements

| Requirement | Purpose |
|---|---|
| Branch up-to-date with main | No stale merges |
| All CI checks green | Quality gate |
| CODEOWNER approval | Domain expert sign-off |
| At least 1 human reviewer | Accountability |
| No unresolved review threads | All concerns addressed |
| ExecID present (if AI-assisted) | Provenance |

### 15.3 Merge Queue Benefits

```
Without merge queue:
  PR A passes CI ✓ → merge  ─┐
  PR B passes CI ✓ → merge  ─┤→ A+B+C together may break main
  PR C passes CI ✓ → merge  ─┘   (each tested alone, not together)

With merge queue:
  PR A passes CI ✓ → merge → main updated
  PR B queued → rebase on new main → re-test → merge → main updated
  PR C queued → rebase on new main → re-test → merge → main updated
  (each tested against actual latest main)
```

---

## 16. When Things Go Wrong

### 16.1 Common Hybrid Workflow Failures

| Problem | Symptom | Fix |
|---|---|---|
| Massive rebase conflict | 20+ conflict markers after `git rebase` | Abort (`git rebase --abort`), split into smaller PRs, merge incrementally |
| AI introduced regression | Tests pass but behavior is wrong | Revert AI commit, re-run with constrained prompt or write manually |
| PR too large to review | Reviewer gives up, rubber-stamps | Split into stacked PRs; merge pieces incrementally |
| Two devs AI-generated the same utility | Duplicate code merged | Search before accepting AI output; dedup in follow-up PR |
| AI changed a file outside scope | Boundary violation | Reject out-of-scope changes; use `--allowed-paths` |
| Tests pass but AI hallucinated an API | Works in test (mocked), fails in production | Add integration tests with real dependencies |
| Conflict resolution lost someone's changes | Incorrect merge | `git reflog` to find lost commit, cherry-pick back |

### 16.2 Emergency: Recovering Lost Work

```bash
# Find lost commits (even after bad rebase)
git reflog

# Find the commit hash before the bad rebase
# e.g., abc1234 HEAD@{5}: commit: feat: my lost work

# Cherry-pick the lost commit onto your branch
git cherry-pick abc1234

# Or create a new branch from the lost state
git checkout -b recovery abc1234
```

### 16.3 Nuclear Option: Start the Branch Over

```bash
# If the branch is too tangled to fix
git checkout main && git pull
git switch -c feat/S1234-v2

# Cherry-pick the good commits from the old branch
git log --oneline feat/S1234-user-settings    # find good commits
git cherry-pick <good-commit-1> <good-commit-2>

# Delete the old branch
git branch -D feat/S1234-user-settings
```

---

## 17. Team Habits That Reduce Churn

### Daily Habits

| Habit | Why It Works |
|---|---|
| Rebase on main before starting work | Start from latest state |
| Rebase again before pushing | Catch conflicts while context is fresh |
| `git diff` before `git add` | Catch AI scope creep |
| Push at end of day | Others can see your progress |
| Run tests locally before push | Don't break CI for others |

### PR Habits

| Habit | Why It Works |
|---|---|
| Open PR early (draft) | Surfaces conflicts sooner |
| Keep PRs under 400 lines | Reviewable, less conflict surface |
| Include prompt in PR description | Reviewers understand AI's intent |
| Add tests for AI-generated code | Tests prevent future regressions |
| Resolve conflicts promptly | Stale conflicts compound |

### Communication Habits

| Habit | Why It Works |
|---|---|
| Say in standup: "Using AI on X today" | Prevents simultaneous AI edits |
| Pair-review AI logic with domain expert | Short session catches subtle issues |
| Share successful prompts in team channel | Improves everyone's AI output quality |
| Flag AI-heavy PRs for extra review time | Prevents reviewer fatigue |

### Sprint Habits

| Habit | Why It Works |
|---|---|
| Decompose stories into AI-suitable vs human-required | Right tool for each subtask |
| Account for review time in estimates | AI saves dev time but adds review time |
| Limit AI PRs per sprint | Prevents review bottleneck |
| Retro on AI usage quarterly | Continuous improvement |

---

## 18. Quick Reference

### The Workflow in 60 Seconds

```
git checkout main && git pull
git switch -c feat/S1234-desc
<manual + AI work, commit frequently with AI-EXE footer>
git fetch origin && git rebase origin/main
<resolve conflicts, run tests>
git push --force-with-lease
<open PR early, label ai-assisted, include ExecID>
<get review, address feedback>
<merge via merge queue or squash>
```

### Conflict Resolution in 30 Seconds

```
git fetch origin
git rebase origin/main
<resolve markers: human logic wins over AI>
git add <resolved>
git rebase --continue
<run tests>
git push --force-with-lease
```

### Decision: AI or Manual?

```
Is it security/auth/crypto?    → Manual (AI can draft, human implements)
Is it business logic?          → Manual (AI can scaffold, human decides)
Is it boilerplate/scaffold?    → AI-assisted (human reviews)
Is it tests?                   → AI-generated (human validates)
Is it documentation?           → AI-generated (human checks accuracy)
Is it performance-critical?    → Manual (profile first, optimize after)
```

### PR Checklist (Copy This)

```markdown
- [ ] Branch rebased on latest main
- [ ] All CI checks pass locally
- [ ] PR is <400 lines (or split justified)
- [ ] AI-assisted label applied (if applicable)
- [ ] ExecID included for AI changes
- [ ] Tests added for new behavior
- [ ] CODEOWNERS will be auto-requested
- [ ] Conflict resolution documented (if any)
- [ ] No AI changes to blocked paths
```

---

## See Also

- [Module 16: HTC AI-Assisted Development POV](/modules/htc-ai-dev-pov) — Strategic framework for the hybrid AI + human collaboration model detailed here.
- [Module 13: AI-Enabled Development Lifecycle](/modules/ai-development-lifecycle) — The full lifecycle framework that this workflow implements day-to-day.

---

*The best hybrid teams aren't the ones that use the most AI. They're the ones that know exactly where AI helps and where humans must lead — and they enforce that boundary with process, automation, and discipline.*

*Last updated: 2026-02-19*
