# AI Boundary Enforcement in Multi-Team Environments

> How to prevent AI (and AI-assisted developers) from changing code outside their responsibility. Policies, automation, and enforcement for teams that share a codebase.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [Principles](#2-principles)
3. [Ownership & Boundary Definition](#3-ownership--boundary-definition)
4. [Enforcement Layers](#4-enforcement-layers)
5. [CODEOWNERS Deep Dive](#5-codeowners-deep-dive)
6. [Pre-Commit Enforcement](#6-pre-commit-enforcement)
7. [CI/CD Path Guards](#7-cicd-path-guards)
8. [AI Tool Restrictions](#8-ai-tool-restrictions)
9. [Agent Sandboxing](#9-agent-sandboxing)
10. [Branch & Permission Architecture](#10-branch--permission-architecture)
11. [Exception Handling](#11-exception-handling)
12. [Cross-Team Change Protocols](#12-cross-team-change-protocols)
13. [Observability & Audit](#13-observability--audit)
14. [Organizational Controls](#14-organizational-controls)
15. [Implementation Playbook](#15-implementation-playbook)
16. [Quick Reference](#16-quick-reference)

---

## 1. The Problem

### Why AI Makes Boundary Enforcement Harder

A human developer usually knows team boundaries intuitively — "that's the payments team's code, I shouldn't touch it." AI has no such awareness. It optimizes for completing the task, not respecting organizational boundaries.

| What Goes Wrong | How It Happens | Consequence |
|---|---|---|
| AI edits auth code while fixing a UI bug | Followed an import chain into `auth/` | Security-critical code changed without security review |
| AI refactors shared utilities | "Improved" a utility used by 5 teams | 5 teams broken, no one asked |
| AI modifies infrastructure config | Prompt said "fix the deployment" | Production infrastructure changed |
| AI updates database schema | "Added a column for the feature" | Migration affects every service using that table |
| AI changes API contracts | "Updated the endpoint" | Downstream consumers broken |
| AI adds dependencies globally | `pip install` in root requirements | Every team inherits a new dependency |

### The Cost of Getting This Wrong

- **Broken builds** across teams that didn't expect changes
- **Security incidents** from unauthorized changes to auth/crypto/infra
- **Deployment failures** from untested infrastructure changes
- **Trust erosion** between teams ("who touched our code?")
- **Compliance violations** in regulated environments (SOC2, HIPAA, PCI)

---

## 2. Principles

| Principle | What It Means |
|---|---|
| **Least privilege** | People and AI can only touch files/services they own |
| **Machine-checkable ownership** | Ownership defined in code (CODEOWNERS, config), not just convention |
| **Defense in depth** | Multiple enforcement layers — local, CI, server-side, organizational |
| **Fail closed** | When in doubt, block the change and require explicit approval |
| **Auditability** | Every boundary crossing is logged with who, what, why, and who approved |
| **Explicit over implicit** | Boundaries are documented, not assumed |

---

## 3. Ownership & Boundary Definition

### 3.1 What Needs Boundaries

Not all code needs the same level of protection. Define boundaries based on risk:

| Risk Level | Examples | Protection |
|---|---|---|
| **Critical** | Auth, crypto, payments, infrastructure, secrets | Strict ownership, 2+ reviewers, security team |
| **High** | Database schema, API contracts, shared libraries | Ownership enforced, domain expert review |
| **Medium** | Service-specific business logic | Team ownership, standard review |
| **Low** | Tests, documentation, internal utilities | Ownership encouraged, lighter review |
| **Open** | Developer tooling, local scripts | Minimal restrictions |

### 3.2 Boundary Types

```
┌─────────────────────────────────────────────────────────────┐
│                    BOUNDARY TYPES                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PATH-BASED                                                  │
│  ├── /services/payments/    → Payments team                 │
│  ├── /infra/                → Platform team                 │
│  └── /auth/                 → Security team                 │
│                                                              │
│  FILE-BASED                                                  │
│  ├── docker-compose.yml     → DevOps team                   │
│  ├── alembic/versions/      → Backend lead + DBA            │
│  └── .github/workflows/     → Platform team                 │
│                                                              │
│  PATTERN-BASED                                               │
│  ├── *.proto                → API team                      │
│  ├── *_migration.py         → Backend lead                  │
│  └── *.tf                   → Infrastructure team           │
│                                                              │
│  SEMANTIC-BASED                                              │
│  ├── Any file importing crypto libs → Security review       │
│  ├── Any file with SQL queries      → DBA review            │
│  └── Any file touching env vars     → DevOps review         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 The Ownership Registry

Create a single source of truth for who owns what:

```yaml
# ownership-registry.yaml (or use CODEOWNERS + supplementary config)
teams:
  payments:
    paths: ["services/payments/", "lib/billing/"]
    owners: ["@payments-team"]
    ai_policy: "restricted"  # AI can draft, but team must review all changes

  security:
    paths: ["auth/", "crypto/", "core/auth/"]
    owners: ["@security-team"]
    ai_policy: "blocked"  # AI cannot modify; human-only changes

  platform:
    paths: ["infra/", ".github/", "Dockerfile", "docker-compose*"]
    owners: ["@platform-team"]
    ai_policy: "blocked"

  backend:
    paths: ["codeloom/core/", "codeloom/api/"]
    owners: ["@backend-team"]
    ai_policy: "standard"  # AI can modify with team review

  frontend:
    paths: ["frontend/"]
    owners: ["@frontend-team"]
    ai_policy: "standard"

  database:
    paths: ["alembic/", "codeloom/core/db/models.py"]
    owners: ["@backend-lead", "@dba"]
    ai_policy: "restricted"
```

---

## 4. Enforcement Layers

### Defense in Depth

Boundaries must be enforced at multiple layers. If one layer fails, the next catches it:

```
Layer 1: AI TOOL CONFIG           (prevent generation outside scope)
    │
    ▼
Layer 2: PRE-COMMIT HOOKS        (prevent local commits to protected paths)
    │
    ▼
Layer 3: CI PATH GUARDS          (prevent PRs that touch protected paths)
    │
    ▼
Layer 4: CODEOWNERS REVIEW       (require owner approval for their paths)
    │
    ▼
Layer 5: BRANCH PROTECTION       (require all checks + approvals before merge)
    │
    ▼
Layer 6: SERVER-SIDE HOOKS       (final enforcement before ref update)
    │
    ▼
Layer 7: POST-MERGE MONITORING   (detect + alert on unauthorized changes)
```

### Enforcement Matrix

| Layer | What It Catches | Bypassable? | Strength |
|---|---|---|---|
| AI tool config | AI generating code for wrong paths | Yes (dev can ignore) | Soft |
| Pre-commit hooks | Local commits to protected paths | Yes (--no-verify) | Soft |
| CI path guards | PRs touching protected paths | No (required check) | Strong |
| CODEOWNERS | Changes without owner approval | No (required review) | Strong |
| Branch protection | All enforcement combined | No (admin only) | Strongest |
| Server-side hooks | Push-time validation | No | Strongest |
| Post-merge monitoring | Everything else | N/A (detective, not preventive) | Alerting |

---

## 5. CODEOWNERS Deep Dive

### 5.1 Structure

```
# .github/CODEOWNERS
# Last matching pattern wins. Order from general to specific.

# Default: require team lead review for everything
*                                    @team-leads

# ─── CRITICAL: Security team required ───
codeloom/core/auth/                  @security-team @backend-lead
codeloom/api/routes/fastapi_auth.py  @security-team @backend-lead

# ─── CRITICAL: Infrastructure ───
Dockerfile                           @platform-team
docker-compose*.yml                  @platform-team
.github/workflows/                   @platform-team
dev.sh                               @platform-team

# ─── HIGH: Database ───
codeloom/core/db/models.py           @backend-lead @dba
alembic/                             @backend-lead @dba

# ─── HIGH: API contracts ───
codeloom/api/routes/                  @backend-team
codeloom/api/schemas/                 @backend-team

# ─── HIGH: Core pipeline ───
codeloom/pipeline.py                  @backend-lead
codeloom/core/engine/                 @backend-lead

# ─── MEDIUM: Core modules ───
codeloom/core/ast_parser/            @backend-team
codeloom/core/asg_builder/           @backend-team
codeloom/core/code_chunker/          @backend-team
codeloom/core/raptor/                @backend-team
codeloom/core/vector_store/          @backend-team

# ─── MEDIUM: Frontend ───
frontend/                            @frontend-team

# ─── LOW: Configuration ───
config/                              @backend-lead
requirements.txt                     @backend-lead
frontend/package.json                @frontend-lead

# ─── LOW: Documentation ───
docs/                                @team-leads
CLAUDE.md                            @team-leads
```

### 5.2 CODEOWNERS + AI Policy

CODEOWNERS enforces WHO must review. Layer AI policy on top to define WHAT AI can do:

| CODEOWNERS Path | AI Policy | Meaning |
|---|---|---|
| `codeloom/core/auth/` → @security-team | **Blocked** | AI cannot generate changes to these files |
| `alembic/` → @backend-lead @dba | **Restricted** | AI can draft; requires 2 owner reviews |
| `codeloom/core/engine/` → @backend-lead | **Restricted** | AI can draft; requires owner review |
| `codeloom/api/routes/` → @backend-team | **Standard** | AI can modify; standard review |
| `frontend/` → @frontend-team | **Standard** | AI can modify; standard review |
| `docs/` → @team-leads | **Open** | AI can modify; light review |

---

## 6. Pre-Commit Enforcement

### 6.1 Path Guard Hook

```bash
#!/usr/bin/env bash
# .git/hooks/pre-commit (or distribute via pre-commit framework)
# Prevents commits to protected paths by unauthorized developers

set -euo pipefail

# === CONFIGURATION ===
# Map protected paths to allowed developer emails
declare -A PATH_OWNERS
PATH_OWNERS["infra/"]="alice@example.com,platform-bot@example.com"
PATH_OWNERS["auth/"]="alice@example.com,bob@example.com"
PATH_OWNERS["codeloom/core/auth/"]="alice@example.com,bob@example.com"
PATH_OWNERS["services/payments/"]="carol@example.com"
PATH_OWNERS["alembic/"]="alice@example.com,dave@example.com"
PATH_OWNERS[".github/"]="alice@example.com"

# === GET CURRENT AUTHOR ===
AUTHOR=$(git config user.email)

# === CHECK STAGED FILES ===
BLOCKED=false
BLOCKED_FILES=()

for file in $(git diff --cached --name-only); do
  for protected_path in "${!PATH_OWNERS[@]}"; do
    if [[ "$file" == "$protected_path"* ]]; then
      # Check if author is in the allowed list
      IFS=',' read -ra ALLOWED <<< "${PATH_OWNERS[$protected_path]}"
      AUTHORIZED=false
      for allowed_user in "${ALLOWED[@]}"; do
        if [[ "$AUTHOR" == "$allowed_user" ]]; then
          AUTHORIZED=true
          break
        fi
      done
      if ! $AUTHORIZED; then
        BLOCKED=true
        BLOCKED_FILES+=("$file (owned by: ${PATH_OWNERS[$protected_path]})")
      fi
    fi
  done
done

if $BLOCKED; then
  echo ""
  echo "BLOCKED: You are not authorized to modify these files:"
  echo ""
  for bf in "${BLOCKED_FILES[@]}"; do
    echo "  - $bf"
  done
  echo ""
  echo "Your identity: $AUTHOR"
  echo "Contact the path owners to coordinate changes."
  echo "If this is an emergency, use --no-verify and document the exception."
  echo ""
  exit 1
fi

exit 0
```

### 6.2 Distributing Hooks

Pre-commit hooks in `.git/hooks/` are local and not version-controlled. Options for distribution:

| Method | How | Enforcement |
|---|---|---|
| `pre-commit` framework | `.pre-commit-config.yaml` in repo | Developers must run `pre-commit install` |
| `husky` (Node projects) | Configured in `package.json` | Auto-installs on `npm install` |
| Git template directory | `git config --global init.templateDir` | Applied to new clones automatically |
| Server-side hooks | GitLab/GitHub Enterprise | Cannot be bypassed (strongest) |
| CI duplicate | Same check in CI pipeline | Catches bypassed local hooks |

**Key rule**: Pre-commit hooks are a convenience. CI enforcement is the gate. Never rely solely on local hooks.

---

## 7. CI/CD Path Guards

### 7.1 GitHub Action: Protected Path Guard

```yaml
# .github/workflows/path-guard.yml
name: Guard Protected Paths

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  guard-paths:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed
        run: |
          FILES=$(git diff --name-only origin/${{ github.event.pull_request.base.ref }}...HEAD | tr '\n' ',')
          echo "files=$FILES" >> $GITHUB_OUTPUT

      - name: Check protected paths
        uses: actions/github-script@v7
        env:
          CHANGED_FILES: ${{ steps.changed.outputs.files }}
        with:
          script: |
            const files = process.env.CHANGED_FILES.split(",").filter(Boolean);

            // Define protected paths and their required reviewers
            const protectedPaths = {
              "infra/":                { team: "platform-team", level: "critical" },
              ".github/":              { team: "platform-team", level: "critical" },
              "codeloom/core/auth/":   { team: "security-team", level: "critical" },
              "alembic/":              { team: "backend-lead",  level: "high" },
              "codeloom/core/db/models.py": { team: "backend-lead", level: "high" },
              "codeloom/pipeline.py":  { team: "backend-lead",  level: "high" },
              "Dockerfile":            { team: "platform-team", level: "critical" },
            };

            const violations = [];

            for (const file of files) {
              for (const [path, config] of Object.entries(protectedPaths)) {
                if (file.startsWith(path) || file === path) {
                  violations.push({ file, ...config });
                }
              }
            }

            if (violations.length === 0) {
              console.log("No protected paths touched.");
              return;
            }

            // Check if required reviewers have approved
            const reviews = await github.rest.pulls.listReviews({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.payload.pull_request.number,
            });

            const approvers = reviews.data
              .filter(r => r.state === "APPROVED")
              .map(r => r.user.login);

            const critical = violations.filter(v => v.level === "critical");

            if (critical.length > 0 && approvers.length < 2) {
              const paths = [...new Set(critical.map(v => v.file))].join(", ");
              const teams = [...new Set(critical.map(v => v.team))].join(", ");
              core.setFailed(
                `CRITICAL paths modified: ${paths}\n` +
                `Required reviewers: ${teams}\n` +
                `Current approvals: ${approvers.length} (need 2 for critical paths)`
              );
            } else if (violations.length > 0 && approvers.length < 1) {
              const paths = [...new Set(violations.map(v => v.file))].join(", ");
              const teams = [...new Set(violations.map(v => v.team))].join(", ");
              core.setFailed(
                `Protected paths modified: ${paths}\n` +
                `Required reviewers: ${teams}\n` +
                `At least 1 owner approval required.`
              );
            } else {
              console.log(`Protected paths touched but properly approved by: ${approvers.join(", ")}`);
            }
```

### 7.2 Semantic Path Detection

Beyond static paths, detect semantically risky changes:

```yaml
      - name: Check for risky patterns
        run: |
          DIFF=$(git diff origin/${{ github.event.pull_request.base.ref }}...HEAD)

          # Check for new crypto imports
          if echo "$DIFF" | grep -q "+.*import.*\(cryptography\|hashlib\|hmac\|secrets\)"; then
            echo "::warning::PR adds cryptographic imports. Security review recommended."
          fi

          # Check for new SQL queries
          if echo "$DIFF" | grep -q "+.*\(execute\|raw_sql\|text(\)"; then
            echo "::warning::PR adds raw SQL. DBA review recommended."
          fi

          # Check for new environment variable access
          if echo "$DIFF" | grep -qP "+.*os\.environ|getenv|process\.env"; then
            echo "::warning::PR accesses environment variables. DevOps review recommended."
          fi

          # Check for new subprocess/shell calls
          if echo "$DIFF" | grep -qP "+.*subprocess|os\.system|shell=True"; then
            echo "::error::PR adds shell execution. Security review REQUIRED."
            exit 1
          fi
```

---

## 8. AI Tool Restrictions

### 8.1 Prompt-Level Scope Enforcement

When your AI tool receives a prompt, enforce scope BEFORE generating code:

```
Developer prompt: "Fix the login bug"
                      │
                      ▼
┌──────────────────────────────────────────┐
│         AI TOOL SCOPE CHECK              │
│                                          │
│  Developer's allowed paths:              │
│    ✅ frontend/src/pages/Login.tsx       │
│    ✅ frontend/src/services/api.ts       │
│    ❌ codeloom/core/auth/ (blocked)      │
│    ❌ alembic/ (blocked)                 │
│                                          │
│  If AI generates changes to blocked      │
│  paths → REJECT those changes            │
│  → Show: "These files require owner      │
│    approval from @security-team"         │
│                                          │
└──────────────────────────────────────────┘
```

### 8.2 CLAUDE.md Scope Directive

Add scope restrictions directly to the project context file:

```markdown
## AI Scope Restrictions

When generating code changes, respect these boundaries:

### Blocked Paths (never modify without explicit human instruction)
- `codeloom/core/auth/` — security team owns this
- `alembic/` — database changes require DBA review
- `infra/` — platform team owns infrastructure
- `.github/workflows/` — CI/CD changes require platform team
- `Dockerfile`, `docker-compose*` — platform team
- Any file containing `SECRET`, `TOKEN`, `PASSWORD`, `API_KEY`

### Restricted Paths (can draft, but flag for owner review)
- `codeloom/core/db/models.py` — schema changes need approval
- `codeloom/pipeline.py` — core orchestrator, backend lead review
- `requirements.txt`, `package.json` — dependency changes need approval

### Open Paths (standard review process)
- `codeloom/api/routes/` — backend team
- `codeloom/core/ast_parser/` — backend team
- `frontend/src/` — frontend team
- `docs/` — anyone

If a task requires modifying a blocked path, STOP and ask the developer
to coordinate with the owning team before proceeding.
```

### 8.3 AI CLI Wrapper with Path Validation

```python
# Pseudocode for ai-commit wrapper with path enforcement

def ai_commit(prompt, branch, allowed_paths=None):
    # 1. Get developer's allowed paths from config
    if allowed_paths is None:
        allowed_paths = load_developer_allowed_paths(get_current_user())

    # 2. Call AI model
    response = call_model(prompt)
    modified_files = extract_modified_files(response)

    # 3. Validate all modified files against allowed paths
    violations = []
    for file in modified_files:
        if not any(file.startswith(p) for p in allowed_paths):
            violations.append(file)

    # 4. If violations, abort and notify
    if violations:
        print("BLOCKED: AI generated changes to files outside your scope:")
        for v in violations:
            owner = lookup_owner(v)
            print(f"  - {v} (owned by: {owner})")
        print("\nOptions:")
        print("  1. Remove these files from the change")
        print("  2. Coordinate with the owning team")
        print("  3. Open a cross-team PR with owner review required")
        return None

    # 5. Proceed with commit
    exec_id = store_artifact(prompt, response)
    commit_changes(modified_files, exec_id)
    create_pr(branch, exec_id, "ai-assisted")
    return exec_id
```

---

## 9. Agent Sandboxing

### 9.1 Workspace Isolation

For autonomous AI agents (not just assisted coding), enforce filesystem-level isolation:

```
┌─────────────────────────────────────────────────────────────┐
│                   AGENT SANDBOXING                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Option A: Path-based sandbox                                │
│  ├── Agent receives a COPY of only its allowed paths        │
│  ├── Agent cannot see or modify paths outside its scope     │
│  ├── Changes are reviewed before merging back to full repo  │
│  └── Implementation: symlinks, sparse checkout, Docker      │
│                                                              │
│  Option B: Git sparse checkout                               │
│  ├── git sparse-checkout set "frontend/" "docs/"            │
│  ├── Agent literally cannot see other directories           │
│  └── Clean, native Git support                              │
│                                                              │
│  Option C: Container isolation                               │
│  ├── Agent runs in Docker with mounted volumes              │
│  ├── Only allowed directories are mounted                   │
│  ├── No network access to internal services                 │
│  └── Strongest isolation but more setup overhead            │
│                                                              │
│  Option D: Read-only + write allowlist                      │
│  ├── Agent can READ the entire codebase (for context)       │
│  ├── Agent can only WRITE to allowed paths                  │
│  ├── Enforced by the AI tool wrapper, not filesystem        │
│  └── Best balance of context and safety                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Sparse Checkout for Scoped AI Work

```bash
# Create a sparse checkout for a frontend developer's AI session
git clone --sparse --filter=blob:none <repo-url> frontend-workspace
cd frontend-workspace
git sparse-checkout set frontend/ docs/ CLAUDE.md package.json

# AI agent in this workspace literally cannot see or modify:
# - codeloom/core/auth/
# - infra/
# - alembic/
# - .github/
```

### 9.3 Docker-Based Agent Sandbox

```dockerfile
# Dockerfile.ai-agent
FROM python:3.11-slim

# Mount ONLY the allowed directories
# (done via docker run -v, not in Dockerfile)

WORKDIR /workspace

# No access to:
# - Host network (--network=none or restricted)
# - Host filesystem beyond mounted volumes
# - Environment secrets (not passed to container)
```

```bash
# Run AI agent with scoped filesystem access
docker run --rm \
  --network=none \
  -v $(pwd)/frontend:/workspace/frontend \
  -v $(pwd)/docs:/workspace/docs \
  -v $(pwd)/CLAUDE.md:/workspace/CLAUDE.md:ro \
  ai-agent:latest \
  --task "Fix the login page styling"
```

---

## 10. Branch & Permission Architecture

### 10.1 Team-Based Branch Namespaces

```
main (protected: all teams must review)
│
├── team/backend/*       ← Backend team's feature branches
├── team/frontend/*      ← Frontend team's feature branches
├── team/platform/*      ← Platform team's feature branches
├── team/security/*      ← Security team's branches
│
├── ai/backend/*         ← AI bot's backend PRs
├── ai/frontend/*        ← AI bot's frontend PRs
│
└── hotfix/*             ← Emergency fixes (any team, expedited review)
```

### 10.2 Permission Matrix

| Branch Pattern | Who Can Push | Who Reviews | Who Merges |
|---|---|---|---|
| `main` | Nobody directly | All CODEOWNERS | Team leads after all checks |
| `team/backend/*` | Backend team | Backend team + affected CODEOWNERS | Backend lead |
| `team/frontend/*` | Frontend team | Frontend team | Frontend lead |
| `team/platform/*` | Platform team | Platform team | Platform lead |
| `ai/*` | AI bot account only | Owning team + CODEOWNERS | Human team lead |
| `hotfix/*` | Any team (emergency) | 2 reviewers minimum | Team lead + on-call |

### 10.3 GitHub/GitLab Rulesets

```yaml
# GitHub Branch Ruleset (via API or UI)
rulesets:
  - name: "Protect main"
    target: "main"
    rules:
      required_pull_request:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_review: true
      required_status_checks:
        contexts: ["ci/tests", "ci/lint", "ci/security", "path-guard"]
      no_force_push: true
      no_deletion: true

  - name: "AI branches require human merge"
    target: "ai/**"
    rules:
      required_pull_request:
        required_approving_review_count: 1
        require_code_owner_review: true
      required_status_checks:
        contexts: ["ci/tests", "ci/lint", "ci/security", "path-guard", "execid-check"]
```

---

## 11. Exception Handling

### 11.1 When a Cross-Boundary Change Is Legitimate

Sometimes a feature genuinely requires changes across team boundaries. Handle this with a structured exception process:

```
Developer needs to modify a protected path
│
├── Step 1: DECLARE
│   └── Open an issue/ticket: "Cross-team change needed"
│       Include: what files, why, estimated scope
│
├── Step 2: COORDINATE
│   └── Tag owning team in the ticket
│       Schedule sync if complex
│       Agree on approach and review plan
│
├── Step 3: IMPLEMENT
│   └── Create PR with changes
│       Add both teams as reviewers
│       Label: cross-team-change + ai-assisted (if applicable)
│       Include ExecID if AI was used
│
├── Step 4: REVIEW
│   └── Owning team reviews THEIR paths
│       Requesting team reviews THEIR paths
│       Both must approve before merge
│
└── Step 5: DOCUMENT
    └── Record the exception in the PR description
        Note why cross-boundary change was necessary
        Update boundaries if they need adjusting
```

### 11.2 Emergency Exception (Production Down)

```
EMERGENCY: Production is down, fix requires cross-team change
│
├── 1. Page the owning team (don't bypass them)
├── 2. If owning team unavailable within SLA:
│      ├── Team lead or on-call can authorize
│      ├── Use hotfix/* branch
│      ├── Minimum 1 senior reviewer (any team)
│      └── Document: "Emergency bypass: [reason] [approver]"
├── 3. Fix is merged with expedited review
├── 4. Post-incident:
│      ├── Owning team reviews the change
│      ├── If needed, follow-up PR with proper implementation
│      └── Post-mortem includes boundary discussion
└── 5. Log the exception for compliance audit
```

### 11.3 Exception Tracking

Maintain a log of all boundary exceptions:

| Date | Requester | Protected Path | Owner | Reason | Approved By | PR |
|------|-----------|---------------|-------|--------|-------------|-----|
| 2026-02-15 | @alice | `codeloom/core/auth/` | @security-team | Login feature needed auth change | @bob (security) | #234 |
| 2026-02-18 | AI Bot | `alembic/` | @backend-lead | Migration for new table | @dave (DBA) | #241 |

---

## 12. Cross-Team Change Protocols

### 12.1 Shared Interface Changes

When a change affects multiple teams (API contracts, shared types, database schema):

```
RFC (Request for Change)
│
├── 1. Author writes RFC document
│      ├── What changes
│      ├── Who is affected
│      ├── Migration plan
│      └── Rollback plan
│
├── 2. Affected teams review RFC
│      └── 48-hour comment period (or team sync)
│
├── 3. Implement in stages
│      ├── Stage 1: Add new (backwards-compatible)
│      ├── Stage 2: Migrate consumers
│      └── Stage 3: Remove old (after all consumers migrated)
│
└── 4. Each stage is a separate PR with appropriate reviewers
```

### 12.2 Dependency Changes

When AI suggests adding a dependency that affects multiple teams:

```
New dependency proposed
│
├── Single team's area only?
│   └── Team lead approves → standard PR flow
│
├── Shared/root dependency?
│   ├── License check (automated)
│   ├── Security check (automated)
│   ├── Bundle/size impact assessment
│   ├── All affected team leads must approve
│   └── Document: why this dependency, alternatives considered
│
└── Infrastructure dependency?
    └── Platform team + security team must approve
```

---

## 13. Observability & Audit

### 13.1 What to Monitor

| Event | Detection | Alert |
|---|---|---|
| PR touches protected path without CODEOWNER approval | CI path guard | Block merge |
| AI commit modifies blocked path | CI + post-merge scan | Alert owning team |
| Merge to main without required reviews | Branch protection | Should be impossible; alert if detected |
| Exception/bypass used | Exception log | Weekly audit report |
| New CODEOWNERS entry added | PR diff | Require team leads review |

### 13.2 Audit Queries

```bash
# Find all AI commits that touched auth code
git log --all --grep="AI-EXE" -- codeloom/core/auth/

# Find all commits to protected paths in last 30 days
git log --since="30 days ago" -- infra/ codeloom/core/auth/ alembic/

# Find all cross-team PRs
gh pr list --state merged --label "cross-team-change" --limit 50

# Find all exception bypasses
gh pr list --state merged --label "emergency-bypass" --limit 50
```

### 13.3 Weekly Audit Report

```
WEEKLY BOUNDARY AUDIT (auto-generated)
=======================================
Period: 2026-02-12 to 2026-02-19

Protected path changes:  12
  - With proper CODEOWNER approval: 11
  - Emergency bypasses: 1 (PR #241, auth hotfix)
  - Unauthorized: 0

AI-assisted changes to protected paths: 3
  - All had ExecID: Yes
  - All had owner approval: Yes

Cross-team PRs: 2
  - Both properly coordinated: Yes

Exceptions logged: 1
  - Emergency auth hotfix by @alice, approved by @bob
  - Post-incident review: completed

Status: COMPLIANT
```

---

## 14. Organizational Controls

### 14.1 Team Training

Every developer and AI tool user should understand:

| Topic | Content | Frequency |
|---|---|---|
| Boundary awareness | Which paths they own, which are off-limits | Onboarding + quarterly |
| AI scope limits | How to configure AI tools to respect boundaries | Onboarding |
| Exception process | How to request cross-team changes | Onboarding |
| Review responsibility | What to check when reviewing AI code near boundaries | Quarterly |
| Incident response | What to do if boundaries are accidentally violated | Annual |

### 14.2 CONTRIBUTING.md Additions

```markdown
## Code Ownership & Boundaries

### Before Making Changes
1. Check `.github/CODEOWNERS` to identify who owns the files you're modifying
2. If you're modifying files outside your team's ownership, follow the
   cross-team change protocol (see docs/ai-boundary-enforcement.md)
3. If using AI tools, ensure your AI context includes scope restrictions

### AI-Specific Rules
- AI tools must respect the blocked/restricted/standard path classifications
- AI-generated changes to blocked paths will be rejected by CI
- AI-generated changes to restricted paths require additional owner review
- Always include ExecID when AI modified code near boundary areas

### When In Doubt
- Ask in the team channel before modifying unfamiliar code
- Tag the CODEOWNERS when opening a PR that touches their area
- Never use --no-verify to bypass pre-commit boundary checks in production code
```

### 14.3 Onboarding Checklist

```
NEW DEVELOPER AI BOUNDARY ONBOARDING:
  [ ] Read CODEOWNERS file — understand who owns what
  [ ] Read this document — understand enforcement layers
  [ ] Configure pre-commit hooks locally
  [ ] Test: try committing to a path you don't own (should be blocked)
  [ ] Configure AI tool with scope restrictions (CLAUDE.md or tool config)
  [ ] Test: have AI generate code for a blocked path (should be caught)
  [ ] Know the exception process for cross-team changes
  [ ] Know who to contact for each protected area
```

---

## 15. Implementation Playbook

### Day 1-2: Foundation

```
[ ] Create or update CODEOWNERS file
[ ] Enable branch protection on main
    [ ] Require PR reviews
    [ ] Require CODEOWNER approval
    [ ] Require CI status checks
[ ] Define protected path list with risk levels
[ ] Communicate boundaries to all teams
```

### Day 3-4: Local Enforcement

```
[ ] Create pre-commit path guard hook
[ ] Distribute to team (pre-commit install or husky)
[ ] Add AI scope restrictions to CLAUDE.md (or equivalent)
[ ] Test: verify hooks block unauthorized changes
```

### Day 5-7: CI Enforcement

```
[ ] Add path-guard GitHub Action
[ ] Add semantic pattern detection (crypto, SQL, shell)
[ ] Make path-guard a required status check
[ ] Test: submit PR touching protected path, verify it's blocked
[ ] Test: submit PR with owner approval, verify it passes
```

### Week 2: Process & Training

```
[ ] Document exception handling process
[ ] Update CONTRIBUTING.md
[ ] Run onboarding session for team
[ ] Set up weekly audit report
[ ] Create exception tracking log
```

### Ongoing

```
[ ] Monthly: review CODEOWNERS accuracy
[ ] Monthly: review exception log for patterns
[ ] Quarterly: boundary training refresh
[ ] As needed: update path classifications
```

---

## 16. Quick Reference

### The Rule in One Sentence

AI and developers can only modify files they own; everything else requires explicit coordination with the owning team and approval through CI-enforced gates.

### Enforcement Layers (Defense in Depth)

```
AI Tool Config → Pre-Commit Hooks → CI Path Guards → CODEOWNERS → Branch Protection → Monitoring
```

### Path Classification

| Level | Meaning | AI Can... | Review Required |
|---|---|---|---|
| **Blocked** | AI cannot modify | Read only | N/A (changes rejected) |
| **Restricted** | AI can draft | Draft changes | 2 owners |
| **Standard** | AI can modify | Full changes | 1 owner |
| **Open** | AI can modify freely | Full changes | 1 reviewer |

### When Boundaries Are Crossed

```
Accidental → Caught by CI → Fix and re-submit
Legitimate → Exception process → Coordinate → Both teams approve
Emergency → Hotfix branch → Senior approval → Post-incident review
```

### Do

- Define ownership in CODEOWNERS (machine-checkable)
- Enforce at multiple layers (local + CI + server)
- Use AI scope restrictions in project context files
- Follow exception process for cross-team changes
- Audit boundary crossings weekly

### Don't

- Rely on verbal agreements ("we agreed the backend team owns auth")
- Skip CI enforcement ("it's just a small change")
- Use `--no-verify` to bypass boundary hooks
- Let AI modify blocked paths even if the output looks correct
- Merge cross-team changes without both teams approving

---

## See Also

- [Module 16: HTC AI-Assisted Development POV](/modules/htc-ai-dev-pov) — Strategic overview of the boundary model that this module details at the implementation level.
- [Module 11: AI-Assisted Dev Best Practices & Governance](/modules/ai-dev-best-practices) — Governance practices that complement boundary enforcement.

---

*Boundaries are not bureaucracy. They're how teams move fast without breaking each other's work. Enforce them in code, not just in meetings.*

*Last updated: 2026-02-19*
