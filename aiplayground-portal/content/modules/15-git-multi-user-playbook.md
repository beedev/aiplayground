# Git in Multi-User & AI-Assisted Environments

> A practical playbook for teams where multiple developers and AI assistants work on the same codebase. Covers branching models, conflict prevention, merge strategies, bot governance, and auditing.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [Branching Models](#2-branching-models)
3. [Branch & PR Policies](#3-branch--pr-policies)
4. [Workflow Templates](#4-workflow-templates)
5. [Conflict Prevention](#5-conflict-prevention)
6. [Conflict Resolution](#6-conflict-resolution)
7. [Merge Strategies](#7-merge-strategies)
8. [Handling AI & Bot Commits](#8-handling-ai--bot-commits)
9. [Large Diffs & AI-Generated Code](#9-large-diffs--ai-generated-code)
10. [CI/CD Gates & Automation](#10-cicd-gates--automation)
11. [Merge Queues & Race Conditions](#11-merge-queues--race-conditions)
12. [Auditing & Provenance](#12-auditing--provenance)
13. [Repository Hygiene](#13-repository-hygiene)
14. [Monorepo & Multi-Package Considerations](#14-monorepo--multi-package-considerations)
15. [Incident Response: When Merges Go Wrong](#15-incident-response-when-merges-go-wrong)
16. [Templates & Checklists](#16-templates--checklists)

---

## 1. Core Philosophy

### The Multi-User Git Problem

When many people push to the same repo, three things break fast:

| Problem | Cause | Solution |
|---------|-------|----------|
| **Merge conflicts** | Parallel edits to same files | Small PRs, frequent rebases, file ownership |
| **Broken main** | Untested code merged | CI gates, review requirements, merge queues |
| **Lost accountability** | Unclear who changed what and why | Provenance, labels, commit conventions |

Add AI assistants to the mix and the risks multiply — AI generates large diffs, doesn't know about in-flight work on other branches, and can't judge architectural fit.

### Three Non-Negotiable Rules

1. **Protected branches are sacred** — no direct pushes, no skipping CI, no exceptions
2. **Every change is reviewed** — AI code gets MORE scrutiny, not less
3. **History tells the story** — commits, PRs, and audit trails must be meaningful

---

## 2. Branching Models

### Option A: Trunk-Based (Recommended for Fast-Feedback Teams)

```
main ─────●────●────●────●────●────●────●─────
           \  /      \  /      \  /
            ●         ●         ●
         feature    feature    feature
         (1-2 days) (hours)   (1 day)
```

**How it works**:
- Everyone commits to short-lived branches off `main`
- Branches live hours to days, not weeks
- Feature flags gate incomplete work
- Small, frequent merges

**Best for**: Teams that ship continuously, want fast feedback, and can handle feature flags.

**Advantages**:
- Fewer merge conflicts (branches diverge less)
- Faster integration feedback
- Simpler mental model

**Trade-offs**:
- Requires good CI (broken main is immediately visible)
- Requires feature flag discipline
- Less isolation for large features

### Option B: GitFlow / Feature-Branch (For Release-Gated Products)

```
main     ─────●──────────────────●──────────
               \                /
release         \──●────●──●──/
                 \        /
develop    ───●───●──●──●───●───●───●───
              \  / \    / \  /
               ●    ●  ●   ●
             feat  feat feat feat
```

**How it works**:
- `feature/*` branches merge to `develop`
- `release/*` branches cut from `develop` for stabilization
- `main` only receives tested release merges
- `hotfix/*` branches go directly from `main`

**Best for**: Products with scheduled releases, compliance requirements, or complex QA cycles.

**Advantages**:
- Clear release boundaries
- Staging/QA environments per release
- Explicit hotfix process

**Trade-offs**:
- More merge conflicts (long-lived branches)
- Slower feedback loops
- More complex branch management

### Decision Matrix

| Factor | Trunk-Based | GitFlow |
|--------|-------------|---------|
| Release cadence | Continuous / daily | Scheduled / periodic |
| Team size | Any (especially small-medium) | Medium-large |
| Feature flags available | Required | Optional |
| Compliance/audit needs | Moderate | High |
| Merge conflict frequency | Low | Higher |
| CI/CD maturity | Must be strong | Can be weaker |

---

## 3. Branch & PR Policies

### Branch Protection (Non-Negotiable)

| Rule | `main` | `develop` | `release/*` |
|------|--------|-----------|-------------|
| Require PR | Yes | Yes | Yes |
| Require CI pass | Yes | Yes | Yes |
| Require review (min 1) | Yes | Yes | Yes |
| Require 2 reviews for sensitive files | Yes | Recommended | Yes |
| Allow force push | No | No | No |
| Allow deletion | No | No | After merge only |
| Require commit signing | Recommended | Optional | Recommended |
| Require linear history | Team preference | Team preference | Recommended |

### CODEOWNERS

```
# .github/CODEOWNERS

# Default — require review from team leads
*                           @team-leads

# Security-critical — require security team
codeloom/core/auth/         @security-team @team-leads
codeloom/api/routes/auth*   @security-team @team-leads

# Infrastructure — require DevOps
Dockerfile                  @devops-team
docker-compose*.yml         @devops-team
.github/workflows/          @devops-team

# Database — require DBA or backend lead
codeloom/core/db/models.py  @backend-lead @dba
alembic/                    @backend-lead @dba

# Frontend — require frontend lead
frontend/                   @frontend-lead
```

### PR Size Guidelines

| PR Size | Lines Changed | Policy |
|---------|--------------|--------|
| Small | <200 | Standard review |
| Medium | 200-500 | Thorough review, consider splitting |
| Large | 500-1000 | Must justify why not split; extra reviewer |
| Very Large | >1000 | Split required (except generated files, migrations) |

**AI-specific rule**: AI often generates 500+ line diffs. Split into logical PRs: interface changes, implementation, tests, documentation.

---

## 4. Workflow Templates

### 4.1 Trunk-Based Short-Lived Feature

```bash
# 1. Start from latest main
git checkout main && git pull --rebase

# 2. Create feature branch
git switch -c feature/CL-123-add-parser

# 3. Work: code + tests + local verification
#    (multiple small commits are fine)
git add <specific-files>
git commit -m "feat(parser): add C# tree-sitter parser"

# 4. Stay current (do this at least daily)
git fetch origin
git rebase origin/main

# 5. Push and create PR
git push -u origin feature/CL-123-add-parser
# → Create PR via GitHub/GitLab UI or CLI

# 6. After merge, clean up
git checkout main && git pull
git branch -d feature/CL-123-add-parser
```

### 4.2 GitFlow Feature

```bash
# 1. Start from develop
git checkout develop && git pull --rebase

# 2. Create feature branch
git checkout -b feature/CL-456-migration-engine

# 3. Work, commit, stay current with develop
git fetch origin
git rebase origin/develop   # or merge, per team convention

# 4. Push and PR to develop
git push -u origin feature/CL-456-migration-engine
# → PR targets develop (not main)

# 5. When develop is ready for release
git checkout develop && git pull
git checkout -b release/2.1.0
# → Stabilize, fix, then PR to main AND back-merge to develop
```

### 4.3 Hotfix (Both Models)

```bash
# 1. Branch from main (the broken state)
git checkout main && git pull
git checkout -b hotfix/CL-789-fix-auth-bypass

# 2. Fix, test, commit
git add <files>
git commit -m "fix(auth): prevent session token reuse after logout"

# 3. PR to main (urgent review)
git push -u origin hotfix/CL-789-fix-auth-bypass

# 4. After merge to main, back-merge to develop (GitFlow)
git checkout develop && git pull
git merge main
git push origin develop
```

---

## 5. Conflict Prevention

### 5.1 Tactical Measures

| Tactic | Effect | Effort |
|--------|--------|--------|
| **Rebase daily** | Catch conflicts early when they're small | Low |
| **Small PRs** | Less overlap surface area | Medium |
| **CODEOWNERS** | Domain experts review their area | Low (one-time setup) |
| **File-level ownership** | Reduce parallel edits to same files | Medium |
| **Feature flags** | Land code without activating; merge early | Medium |
| **Modular architecture** | Loosely coupled modules = fewer cross-file edits | High (long-term investment) |
| **Communication** | "I'm working on X" in standup / Slack | Free |

### 5.2 High-Conflict Zones

These files attract the most conflicts in any project. Plan accordingly:

| File Type | Why Conflicts Happen | Mitigation |
|-----------|---------------------|------------|
| `package.json` / `requirements.txt` | Multiple devs add dependencies | Merge frequently; use lockfile merge tools |
| Migration files | Sequential ordering conflicts | Generate migration as last step before PR |
| Shared config files | Everyone touches them | Minimize config; use env vars |
| Route registrations | New routes added to same file | Alphabetize; use auto-discovery patterns |
| CSS/styling globals | Multiple UI changes | Use scoped styles, CSS modules, or utility classes |
| `index.ts` / `__init__.py` barrel exports | Re-exports change with every new module | Use auto-generated barrels or lazy imports |

### 5.3 AI-Specific Conflict Risks

| Risk | Why It Happens | Prevention |
|------|---------------|------------|
| AI rewrites more than asked | Scope creep in AI output | Review diffs carefully; reject over-broad changes |
| Two AI sessions edit the same file | No coordination between sessions | Communicate; use branch naming conventions |
| AI doesn't know about in-flight work | No visibility into other branches | Rebase before pushing; mention active PRs in prompts |
| AI generates utilities that already exist | Doesn't search codebase first | Always search before accepting new helpers |
| AI reformats unchanged code | Style preferences differ | Pre-commit hooks enforce consistent style |

---

## 6. Conflict Resolution

### 6.1 Resolution via Rebase (Recommended)

```bash
# Fetch latest
git fetch origin

# Rebase your branch onto updated main
git rebase origin/main

# Git will stop at each conflict. For each one:
# 1. Open the conflicted file(s)
# 2. Look for <<<<<<< / ======= / >>>>>>> markers
# 3. Resolve manually (keep correct code, remove markers)
# 4. Stage the resolved file
git add <resolved-file>

# 5. Continue the rebase
git rebase --continue

# 6. Repeat until all conflicts are resolved

# 7. Run the full test suite BEFORE pushing
pytest                    # or npm test, etc.

# 8. Force-push safely (won't overwrite others' work)
git push --force-with-lease
```

### 6.2 Resolution via Merge

```bash
git fetch origin
git merge origin/main

# Resolve conflicts in each file
# Stage resolved files
git add <resolved-files>

# Complete the merge commit
git commit    # Git provides a default merge message

# Run tests, then push
pytest
git push
```

### 6.3 Using Visual Merge Tools

```bash
# Configure your preferred tool
git config --global merge.tool vscode   # or vimdiff, kdiff3, meld

# When conflicts arise, launch the tool
git mergetool

# After resolving all files
git add .
git rebase --continue   # or git commit for merges
```

### 6.4 Conflict Resolution Decision Tree

```
Conflict detected
│
├── Is it a lockfile (package-lock.json, poetry.lock)?
│   └── Regenerate: delete lockfile, reinstall, commit
│
├── Is it a migration file?
│   └── Accept incoming, regenerate your migration with a new timestamp
│
├── Is it in auto-generated code?
│   └── Regenerate from source, don't manually merge
│
├── Is it a simple addition conflict (both sides added to same list)?
│   └── Keep both additions, verify order doesn't matter
│
└── Is it a logic conflict (both sides changed the same logic)?
    └── Understand BOTH changes. Manually merge intent, not just text.
        Run tests. Get review if unsure.
```

### 6.5 The Cardinal Rule

**Always run the full test suite after resolving conflicts, before pushing.** A clean merge doesn't mean correct code.

---

## 7. Merge Strategies

### 7.1 Strategy Comparison

| Strategy | History | Best For | Command |
|----------|---------|----------|---------|
| **Squash merge** | Single commit per PR | Feature branches, clean history | `git merge --squash` |
| **Rebase & merge** | Linear, all commits preserved | Small teams, detailed history | `git rebase` then `git merge --ff-only` |
| **Merge commit (no-ff)** | Branch structure visible | When branch context matters | `git merge --no-ff` |

### 7.2 Recommendations by Scenario

| Scenario | Strategy | Why |
|----------|----------|-----|
| Feature branch to main | Squash merge | Clean history, one revert point |
| Hotfix to main | Merge commit | Preserve hotfix context |
| Release to main | Merge commit | Preserve release history |
| AI-generated large diff | Squash merge | Collapse AI iterations into one meaningful commit |
| Small bug fix (1-2 commits) | Rebase & merge | Keep simple linear history |
| Back-merge main to develop | Merge commit | Don't rewrite shared history |

### 7.3 Commit Message Conventions

```
<type>(<scope>): <short description>

<body: what changed and why>

<footer: references, breaking changes, co-authors>
```

**Types**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`, `build`

**Examples**:
```
feat(parser): add C# tree-sitter parser with implements/overrides detection

fix(auth): prevent session token reuse after logout

refactor(retrieval): extract hybrid search into composable strategy

test(migration): add integration tests for 6-phase pipeline
```

**AI-assisted footer**:
```
AI-EXE: <exec-id-or-session-link>
AI-PROMPT: <short prompt or link to prompt log>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## 8. Handling AI & Bot Commits

### 8.1 Bot Account Policy

| Rule | Why |
|------|-----|
| Use a dedicated bot/service account | Track AI commits separately from human commits |
| Bots create PRs, never commit directly to protected branches | Human review required |
| Bot PRs require the `ai-assisted` label | Visibility and auditing |
| Bot PRs include prompt provenance | Reproducibility |
| Human approval required before bot PR merge | Accountability |

### 8.2 Bot Account Setup

```
Bot identity:
  Name: ai-assistant (or team-specific: codeloom-ai)
  Email: ai-bot@yourorg.com
  Permissions: Push to feature branches only
  Cannot: Merge to protected branches, approve PRs, delete branches
```

### 8.3 AI Commit Attribution

When a human uses AI to write code and commits it themselves:

```
git commit -m "$(cat <<'EOF'
feat(chunker): add semantic boundary detection for AST-informed splitting

Uses tree-sitter node boundaries to avoid splitting mid-function.
Reduces cross-chunk dependency by ~40% in benchmarks.

AI-PROMPT: "Add semantic boundary detection to code chunker using tree-sitter node types"
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

When a bot account creates the commit:

```
# The commit author IS the bot; the reviewer is the human
# PR approval record serves as the human accountability trail
```

---

## 9. Large Diffs & AI-Generated Code

### 9.1 The Problem

AI assistants routinely generate 500-2000+ line diffs. These are:
- Hard to review thoroughly
- Likely to conflict with other branches
- Risky to merge as one atomic change

### 9.2 Splitting Strategy

```
Large AI output
│
├── PR 1: Interface / Types / Contracts
│   (small, sets the foundation, merge first)
│
├── PR 2: Core Implementation
│   (depends on PR 1, focused on logic)
│
├── PR 3: Tests
│   (depends on PR 2, verifies behavior)
│
└── PR 4: Documentation / Config
    (depends on PR 2, non-blocking)
```

### 9.3 Review Techniques for Large Diffs

| Technique | When |
|-----------|------|
| **Split view** (GitHub) | Side-by-side comparison |
| **File-by-file review** | When changes span many files |
| **Review by commit** | When commits are logical units |
| **Pair review** | For critical or complex changes |
| **AI-assisted review** | Use a different AI to review (second opinion) |
| **Checklist-driven** | Walk through the PR checklist systematically |

### 9.4 Feature Flag Pattern

Land large changes safely by gating them:

```python
# Feature flag — code lands but doesn't activate
if feature_flags.is_enabled("new_parser_v2", user_id):
    result = new_parser.parse(code)
else:
    result = legacy_parser.parse(code)
```

**Benefits**: Merge early, test in production with small audience, roll back instantly without revert.

---

## 10. CI/CD Gates & Automation

### 10.1 Required Pipeline

```
PR Opened / Updated
│
├── Lint & Format Check
├── Type Check (mypy / tsc --strict)
├── Unit Tests
├── Integration Tests
├── Security Scan (SAST + dependency + secrets)
├── Build Verification
│
├── All pass? → Ready for review
└── Any fail? → Block merge, notify author
```

### 10.2 Gate Configuration

| Gate | Blocking | Tool Examples |
|------|----------|--------------|
| Lint | Yes | Ruff, ESLint, Flake8 |
| Format | Yes (or auto-fix) | Black, Prettier |
| Type check | Yes | mypy, tsc |
| Unit tests | Yes | pytest, jest |
| Integration tests | Yes | pytest, Playwright |
| Security scan | Yes | Bandit, Snyk, gitleaks |
| Build | Yes | webpack, setuptools |
| Coverage threshold | Warning (block if <threshold) | coverage.py, istanbul |
| Bundle size | Warning | webpack-bundle-analyzer |
| Commit message format | Yes | commitlint |

### 10.3 Pre-Commit Hooks

```bash
# Install pre-commit
pip install pre-commit
pre-commit install

# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: format
        name: Format
        entry: black .
        language: system
        pass_filenames: false
      - id: lint
        name: Lint
        entry: ruff check .
        language: system
        pass_filenames: false
      - id: typecheck
        name: Typecheck
        entry: mypy codeloom/
        language: system
        pass_filenames: false
      - id: secrets
        name: Secret scan
        entry: gitleaks detect --source . --no-git
        language: system
        pass_filenames: false
```

---

## 11. Merge Queues & Race Conditions

### 11.1 The Problem

When many PRs pass CI simultaneously and merge in quick succession, you get:

```
PR A passes CI ✓  ──┐
PR B passes CI ✓  ──┤──→ All merge to main
PR C passes CI ✓  ──┘
                        BUT: A+B+C together may conflict or break
```

Each PR was tested against the main that existed BEFORE the others merged. Combined, they may break.

### 11.2 Merge Queue Solution

```
PR A passes CI ✓  → Queue position 1 → Merge → main updated
PR B passes CI ✓  → Queue position 2 → Rebase on new main → Re-test → Merge
PR C passes CI ✓  → Queue position 3 → Rebase on new main → Re-test → Merge
```

**Platform support**:
- **GitHub**: Merge Queue (native feature)
- **GitLab**: Merge Train
- **Bitbucket**: Premium merge checks
- **Bors**: Open-source merge bot

### 11.3 When to Use Merge Queues

| Team Size | PR Volume | Recommendation |
|-----------|-----------|----------------|
| 1-5 devs | <10 PRs/day | Not needed; manual coordination suffices |
| 5-15 devs | 10-30 PRs/day | Recommended |
| 15+ devs | 30+ PRs/day | Required |
| Any + AI bots | High volume | Strongly recommended |

---

## 12. Auditing & Provenance

### 12.1 What to Track

Every committed change should be traceable to:

| Question | Where to Find the Answer |
|----------|-------------------------|
| Who wrote this code? | Git author + `Co-Authored-By` |
| Was AI involved? | `ai-assisted` label + commit footer |
| What prompt produced this? | PR description or linked prompt log |
| Who reviewed it? | PR approval record |
| What tests validated it? | CI run logs |
| Why was this change made? | Commit message body + PR description |

### 12.2 Commit Footer Convention

```
AI-EXE: session-2026-02-19-abc123
AI-PROMPT: "Refactor retrieval engine to support pluggable strategies"
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### 12.3 PR Description Requirements

```markdown
## AI Usage (required if ai-assisted)
- **Tool**: Claude Code / Copilot / etc.
- **Session/Exec ID**: [link or ID]
- **Prompt**: [paste or link to prompt log]
- **Human modifications**: [what was changed from raw AI output]
- **Files AI-generated**: [list]
- **Files human-written**: [list]
```

### 12.4 Audit-Friendly Practices

| Practice | Why |
|----------|-----|
| Never rewrite published history (`--force-push` to shared branches) | Preserves audit trail |
| Use merge commits for releases | Clear branch merge points |
| Tag releases with annotated tags | Immutable release markers |
| Keep PR conversations (don't delete) | Decision context preserved |
| Archive prompt logs | Reproducibility for compliance |

---

## 13. Repository Hygiene

### 13.1 Branch Cleanup

```bash
# Delete merged local branches
git branch --merged main | grep -v "main\|develop" | xargs git branch -d

# Delete merged remote branches
git remote prune origin

# List stale remote branches (>30 days, no activity)
git for-each-ref --sort=committerdate refs/remotes/ \
  --format='%(committerdate:short) %(refname:short)'
```

**Automate**: Configure GitHub/GitLab to auto-delete branches after PR merge.

### 13.2 Git Configuration for Teams

```bash
# Recommended global settings for team members

# Default to rebase on pull (reduces merge commits)
git config --global pull.rebase true

# Force-with-lease instead of force (safety)
git config --global push.default current

# Auto-prune deleted remote branches
git config --global fetch.prune true

# Sign commits (if required)
git config --global commit.gpgsign true

# Default branch name
git config --global init.defaultBranch main
```

### 13.3 .gitignore Discipline

Never commit:
- IDE settings (`.vscode/`, `.idea/`) — unless team-shared configs
- Environment files (`.env`, `.env.local`)
- Credentials (`*.pem`, `*.key`, `credentials.json`, `token.json`)
- Build artifacts (`dist/`, `build/`, `__pycache__/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Large binaries (use Git LFS if needed)

---

## 14. Monorepo & Multi-Package Considerations

### 14.1 When Your Project Has Multiple Packages

```
project-root/
├── codeloom/          # Python backend
├── frontend/          # React SPA
├── tools/             # CLI utilities
└── docs/              # Documentation
```

### 14.2 Monorepo-Specific Rules

| Challenge | Solution |
|-----------|----------|
| PR touches backend AND frontend | Use separate reviewers per area (CODEOWNERS) |
| CI runs everything on every change | Use path-based CI triggers (only run backend tests if backend changed) |
| Multiple teams, one repo | Clear directory ownership, area-specific review rules |
| AI generates cross-cutting changes | Split into per-area PRs |

### 14.3 Path-Based CI Triggers

```yaml
# GitHub Actions example
on:
  pull_request:
    paths:
      - 'codeloom/**'    # Only run backend CI when backend changes
      - 'requirements.txt'

# Separate workflow for frontend
on:
  pull_request:
    paths:
      - 'frontend/**'
      - 'frontend/package.json'
```

---

## 15. Incident Response: When Merges Go Wrong

### 15.1 Quick Revert

```bash
# Identify the bad commit
git log --oneline -10

# Revert a single commit (creates a new revert commit)
git revert <commit-hash>

# Revert a merge commit (specify which parent to keep)
git revert -m 1 <merge-commit-hash>

# Push the revert
git push origin main
```

### 15.2 Escalation Ladder

| Severity | Symptom | Action | Who |
|----------|---------|--------|-----|
| Low | CI broken on main | Revert the PR, fix on branch | PR author |
| Medium | Feature broken in staging | Revert or hotfix | Team lead + PR author |
| High | Production degraded | Revert immediately, investigate | On-call + team lead |
| Critical | Production down, data at risk | Revert + rollback deploy + page incident team | Incident commander |

### 15.3 Post-Merge Incident Checklist

```
1. [ ] Revert the problematic change (don't debug in production)
2. [ ] Verify main/production is stable again
3. [ ] Identify root cause on the reverted branch
4. [ ] Fix and add tests that would have caught it
5. [ ] Re-submit PR with fix + new tests
6. [ ] Post-mortem: What did review miss? What CI gate would have caught this?
7. [ ] Update processes (CODEOWNERS, CI gates, review checklist)
```

---

## 16. Templates & Checklists

### 16.1 PR Template

Save as `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
- What changed:
- Why:

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Tests
- [ ] Documentation
- [ ] Infrastructure

## AI-Assisted
- [ ] This PR contains AI-generated changes
- Exec ID:
- Prompt: (paste or link)
- Human modifications:

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All CI checks pass

## Review Focus
- Areas needing careful review:
- Known risks or trade-offs:

## Reviewers
- @codeowner1 @codeowner2
```

### 16.2 Team Quick-Reference Card

```
GIT MULTI-USER QUICK REFERENCE
===============================

DAILY WORKFLOW:
  git fetch origin
  git rebase origin/main          # Stay current
  <work on feature branch>
  git push --force-with-lease     # After rebase

CONFLICT RESOLUTION:
  git rebase origin/main
  <resolve conflicts in editor>
  git add <resolved-files>
  git rebase --continue
  <run tests>
  git push --force-with-lease

MERGE STRATEGIES:
  Feature → main:    Squash merge (clean history)
  Hotfix → main:     Merge commit (preserve context)
  Release → main:    Merge commit (preserve history)
  main → develop:    Merge commit (don't rewrite shared)

RULES:
  - Never force-push to main/develop/release
  - Always run tests after conflict resolution
  - Small PRs, frequent merges
  - Label AI-assisted PRs
  - CODEOWNERS for sensitive files
  - Merge queue for high-traffic repos
```

### 16.3 Repository Setup Checklist

```
INITIAL SETUP:
  [ ] Branch protection on main (require PR, CI, review)
  [ ] CODEOWNERS file configured
  [ ] CI pipeline (lint, test, security, build)
  [ ] Pre-commit hooks installed
  [ ] PR template added
  [ ] .gitignore comprehensive
  [ ] Merge queue enabled (if >5 developers)
  [ ] Auto-delete merged branches enabled
  [ ] Commit signing configured (if required)
  [ ] Commit message convention documented

AI-SPECIFIC:
  [ ] ai-assisted label created
  [ ] Bot account created (if using AI automation)
  [ ] Prompt logging system set up
  [ ] AI-generated code review guidelines documented
  [ ] CLAUDE.md (or equivalent) with project context
```

### 16.4 Conflict Prevention Checklist (Daily)

```
  [ ] Rebased on latest main today
  [ ] PR is <500 lines changed
  [ ] No edits to shared config files (or coordinated with team)
  [ ] No duplicate utilities (searched codebase first)
  [ ] Feature flagged if incomplete
  [ ] Communicated what I'm working on
```

---

## Summary

Multi-user Git with AI assistants works when you:

1. **Pick a branching model** and enforce it — trunk-based for speed, GitFlow for control
2. **Protect branches** with CI gates, reviews, and CODEOWNERS
3. **Prevent conflicts** with small PRs, daily rebases, and clear ownership
4. **Resolve conflicts** locally, run tests, push safely with `--force-with-lease`
5. **Handle AI commits** through bot accounts, labels, and mandatory human review
6. **Split large AI diffs** into focused, reviewable PRs
7. **Use merge queues** when PR volume is high
8. **Audit everything** — prompts, reviews, approvals, decisions
9. **Clean up** — delete merged branches, prune stale remotes, maintain hygiene
10. **Recover fast** — revert first, investigate second, improve third

The goal is not to slow down. The goal is to go fast without breaking things.

---

## See Also

- [Module 16: HTC AI-Assisted Development POV](/modules/htc-ai-dev-pov) — Strategic overview of CI/CD as the final safety net, which this module provides the Git-level implementation for.
- [Module 14: AI + Manual Hybrid Workflow](/modules/ai-hybrid-workflow) — Workflow patterns that depend on the Git strategies covered here.

---

*Last updated: 2026-02-19*
