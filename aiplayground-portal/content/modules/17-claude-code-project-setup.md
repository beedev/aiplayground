# Setting Up Claude Code for Your Project

> **Official Documentation:** Features, commands, and configuration options evolve rapidly. Always refer to the [Claude Code official documentation](https://code.claude.com/docs) for the most up-to-date information.

## Learning Objectives

By the end of this module, you will be able to:

- Design and structure CLAUDE.md files that give Claude Code deep project understanding
- Configure project-level, folder-level, and user-level instructions effectively
- Write coding standards, patterns, and contracts that Claude Code follows consistently
- Set up hooks, permissions, and MCP servers for team-wide workflows
- Apply dos and don'ts that prevent common AI-assisted development pitfalls
- Create a reusable project configuration template for new repositories

---

## Why Project-Level Configuration Matters

Claude Code is powerful out of the box, but without project context it operates like a skilled developer on their first day — technically capable but unfamiliar with your conventions, patterns, and decisions.

**Without configuration**, Claude Code will:
- Use generic patterns that may not match your codebase
- Miss project-specific conventions (naming, file organization, import styles)
- Not know about your tech stack decisions, preferred libraries, or architecture
- Potentially introduce inconsistencies across sessions and team members

**With proper configuration**, Claude Code will:
- Follow your exact coding standards and patterns
- Understand your architecture and make consistent decisions
- Respect boundaries you've defined (files not to touch, patterns to avoid)
- Behave consistently across all team members and sessions

The difference is dramatic. A well-configured project turns Claude Code from a generic assistant into a team member who deeply understands your codebase.

---

## The CLAUDE.md System

CLAUDE.md files are the primary mechanism for giving Claude Code project-specific instructions. They are plain Markdown files that Claude Code reads automatically at the start of every session.

### How CLAUDE.md Files Are Loaded

Claude Code reads CLAUDE.md files from multiple locations, in a specific priority order:

```
Priority (highest to lowest):
1. ~/.claude/CLAUDE.md          → User-level (your personal preferences)
2. ./CLAUDE.md                  → Project root (team-wide standards)
3. ./src/CLAUDE.md              → Directory-level (module-specific rules)
4. ./src/api/CLAUDE.md          → Deeper directory-level (sub-module rules)
```

**Key rules:**
- All matching CLAUDE.md files are loaded and combined
- More specific (deeper) files add to, rather than replace, parent files
- User-level instructions in `~/.claude/CLAUDE.md` apply across all projects
- Project-level instructions in `./CLAUDE.md` are committed to git and shared with the team

### Where to Put What

| Location | Purpose | Committed to Git? |
|----------|---------|-------------------|
| `~/.claude/CLAUDE.md` | Personal preferences (editor style, verbosity, shortcuts) | No |
| `./CLAUDE.md` | Project-wide standards, tech stack, architecture | Yes |
| `./src/CLAUDE.md` | Source code conventions, import patterns | Yes |
| `./src/api/CLAUDE.md` | API-specific patterns, endpoint conventions | Yes |
| `./tests/CLAUDE.md` | Testing conventions, fixture patterns | Yes |

---

## Anatomy of a Great Project CLAUDE.md

A well-structured project CLAUDE.md covers these sections. Here is a complete template with explanations:

### 1. Project Overview

Start with the essential context Claude Code needs to understand what this project is.

````markdown
# Project: [Name]

## Overview
[One-paragraph description of what this project does, who it serves, and its core purpose.]

## Tech Stack
- **Runtime**: Node.js 20 / Python 3.12 / Go 1.22
- **Framework**: Next.js 14 (App Router) / FastAPI / Gin
- **Database**: PostgreSQL + Prisma ORM / SQLite / MongoDB
- **Auth**: NextAuth.js v5 / Clerk / Custom JWT
- **UI**: Tailwind CSS + shadcn/ui / Material UI
- **Testing**: Vitest + Playwright / pytest / Go test
- **Package Manager**: pnpm / bun / pip

## Project Structure
```
src/
  app/           → Next.js App Router pages and layouts
  components/    → React components (organized by feature)
  lib/           → Shared utilities, database client, auth config
  hooks/         → Custom React hooks
  types/         → TypeScript type definitions
content/         → Markdown content files
prisma/          → Database schema and migrations
```
````

**Why this matters:** Without this section, Claude Code may guess your framework version wrong, use the wrong package manager, or misunderstand your directory structure.

### 2. Coding Standards and Patterns

This is the most impactful section. Be specific and prescriptive.

````markdown
## Coding Standards

### TypeScript
- Strict mode enabled — no `any` types unless explicitly justified
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer named exports over default exports
- Use absolute imports with `@/` prefix (e.g., `import { Button } from "@/components/ui/button"`)

### React Components
- Functional components only — no class components
- Use named function declarations, not arrow functions, for components:
  ```tsx
  // Correct
  export function UserCard({ user }: UserCardProps) { ... }

  // Wrong
  export const UserCard = ({ user }: UserCardProps) => { ... }
  ```
- Props interfaces named `[ComponentName]Props`
- Co-locate component-specific types in the same file
- Place "use client" directive only on components that need client-side interactivity

### File Naming
- Components: PascalCase (e.g., `UserCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Pages/routes: kebab-case directories (Next.js App Router convention)
- Test files: `[name].test.ts` or `[name].spec.ts`

### Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal absolute imports (@/)
4. Relative imports
5. Type imports (using `import type`)
````

### 3. Architecture Decisions and Contracts

Document the decisions that should not be revisited without discussion.

```markdown
## Architecture Decisions

### Data Fetching
- Server Components fetch data directly using Prisma
- Client Components use fetch() to API routes — never import Prisma client-side
- API routes handle auth checks, validation, and return JSON
- Use Zod for all API request validation

### State Management
- Server state: React Server Components + server actions
- Client state: React useState/useReducer for local state
- No global state library — keep state close to where it's used
- Form state: React Hook Form for complex forms, native for simple ones

### Error Handling
- API routes: try/catch with structured error responses `{ error: string }`
- Use HTTP status codes correctly (400 validation, 401 auth, 403 forbidden, 404 not found)
- Client: toast notifications for user-facing errors
- Never swallow errors silently — always log or surface them

### Database Patterns
- All database access goes through Prisma client in `src/lib/prisma.ts`
- Use transactions for multi-table operations
- Always use `select` or `include` — never fetch entire records unnecessarily
- Soft-delete pattern: use `isActive` boolean, never hard delete user data
```

### 4. Dos and Don'ts

This is where you prevent common mistakes. Be direct and specific.

```markdown
## Rules

### Do
- Read existing code before modifying — understand the pattern first
- Follow the existing patterns in the codebase, even if you prefer a different approach
- Use the project's existing UI components from `src/components/ui/` — don't create new ones
- Write meaningful error messages that help users understand what went wrong
- Add loading states for all async operations
- Use semantic HTML elements (main, nav, section, article)

### Don't
- Don't install new dependencies without asking — check if existing tools can solve the problem
- Don't use `console.log` for debugging in committed code — use the project's logger
- Don't modify the database schema without explicit approval
- Don't use inline styles — use Tailwind CSS classes
- Don't create new API routes for data that can be fetched in Server Components
- Don't add `// TODO` comments — either implement it or create an issue
- Don't modify files in `src/components/ui/` — these are shadcn/ui primitives
- Don't use `any` type — if you genuinely can't type something, use `unknown` and narrow
- Don't auto-commit — wait for explicit commit instruction
```

### 5. Testing Requirements

```markdown
## Testing

### Unit Tests
- Use Vitest for unit and integration tests
- Test files live next to the code they test: `utils.ts` → `utils.test.ts`
- Focus on behavior, not implementation details
- Mock external services, never mock internal utilities

### E2E Tests
- Use Playwright for end-to-end tests
- Tests live in `tests/e2e/`
- Test critical user journeys, not every click
- Use data-testid attributes for reliable selectors

### Before Marking Done
- Run `pnpm typecheck` — zero TypeScript errors
- Run `pnpm lint` — zero lint warnings
- Run `pnpm test` — all tests pass
- Manually verify the change works in the browser
```

### 6. Git and Workflow

```markdown
## Git Conventions

### Commit Messages
- Format: `type(scope): description`
- Types: feat, fix, refactor, docs, test, chore
- Examples:
  - `feat(auth): add password reset flow`
  - `fix(api): handle null user in session check`
- Keep the first line under 72 characters

### Branches
- Feature: `feature/short-description`
- Bug fix: `fix/issue-description`
- Never push directly to main

### Before Committing
- Run the full type check and lint
- Don't commit `.env`, `node_modules`, or generated files
- Stage specific files — avoid `git add .`
```

---

## Directory-Level CLAUDE.md Files

For larger projects, add CLAUDE.md files in subdirectories to provide context-specific instructions.

### Example: `src/components/CLAUDE.md`

```markdown
# Component Guidelines

## Structure
Every component follows this pattern:
1. Imports
2. Types/interfaces
3. Component function (named export)
4. Sub-components (if any, unexported)

## Shared Components
- Check `./ui/` for shadcn primitives before creating new components
- Check `./common/` for shared project components (ConfirmDialog, LoadingSpinner, etc.)
- Feature-specific components go in `./[feature]/` directories

## Styling
- Use Tailwind utility classes exclusively
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Responsive: mobile-first (base → sm → md → lg)
```

### Example: `src/app/api/CLAUDE.md`

````markdown
# API Route Conventions

## Every route handler must:
1. Check authentication via `auth()` from `@/lib/auth`
2. Check authorization (role-based) if admin-only
3. Validate request body with Zod schema from `@/lib/validations/`
4. Return structured JSON responses
5. Use try/catch with meaningful error messages

## Response Format
Success: `NextResponse.json(data)` or `NextResponse.json(data, { status: 201 })`
Error: `NextResponse.json({ error: "message" }, { status: 4xx })`

## File Pattern
```typescript
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { mySchema } from "@/lib/validations/my-schema"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = mySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 })
  }

  // ... business logic with prisma
}
```
````

---

## User-Level Configuration (~/.claude/CLAUDE.md)

Your personal `~/.claude/CLAUDE.md` applies across all projects. Use it for preferences that are about **how you work**, not about any specific project.

### Good things to put in user-level config:

```markdown
# Personal Preferences

## Workflow
- Always ask before committing to git
- Show me the plan before making changes to more than 3 files
- When fixing bugs, show root cause analysis before implementing the fix

## Communication Style
- Be concise — lead with the answer, not the reasoning
- Use code blocks for file paths and commands
- Don't repeat back what I said — just do it

## Development Preferences
- I use pnpm as my package manager
- I prefer functional programming patterns
- Run typecheck after every significant change
```

### Bad things to put in user-level config:
- Project-specific patterns (belongs in project CLAUDE.md)
- Framework-specific rules (belongs in project CLAUDE.md)
- Team conventions (belongs in project CLAUDE.md — committed to git)

---

## Hooks: Automating Quality Gates

Hooks are shell commands that execute automatically in response to Claude Code events. They enforce standards without relying on Claude to remember them.

### Configuration

Hooks are configured in `.claude/settings.json` (project-level) or `~/.claude/settings.json` (user-level):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "echo 'Remember: follow existing patterns'"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx eslint --fix \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
      }
    ],
    "PreCommit": [
      {
        "command": "npx tsc --noEmit && npx eslint ."
      }
    ]
  }
}
```

### Available Hook Events

| Event | When It Fires | Use Case |
|-------|---------------|----------|
| `PreToolUse` | Before a tool executes | Validate file paths, inject reminders |
| `PostToolUse` | After a tool executes | Auto-format, auto-lint, run checks |
| `PreCommit` | Before git commit | Type check, lint, test gate |
| `Notification` | When Claude sends a notification | Custom alert routing |

### Practical Hook Examples

**Auto-format on save:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
      }
    ]
  }
}
```

**Prevent edits to protected files:**
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "echo \"$CLAUDE_FILE_PATH\" | grep -qE '(schema\\.prisma|\\.env|package\\.json)' && echo 'BLOCKED: This file requires manual editing' && exit 1 || true"
      }
    ]
  }
}
```

---

## Permission Modes

Claude Code has three permission modes that control how much autonomy it has:

| Mode | Behavior | Best For |
|------|----------|----------|
| **Default** | Asks permission for file writes and shell commands | Learning, careful work |
| **Auto-accept edits** | Auto-approves file edits, asks for shell commands | Experienced users |
| **YOLO mode** | Auto-approves everything (with optional allowlists) | Trusted workflows, CI/CD |

### Configuring Allowed Tools

In `.claude/settings.json`, you can pre-approve specific tools:

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Edit",
      "Write",
      "Bash(npm run lint)",
      "Bash(npm run typecheck)",
      "Bash(npm test)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force)"
    ]
  }
}
```

This lets you auto-approve safe operations while still requiring confirmation for dangerous ones.

---

## MCP Servers (Plugins): Extending Capabilities

MCP (Model Context Protocol) servers are **plugins** that extend Claude Code with new capabilities — library documentation lookup, Figma design reading, browser automation, database access, and more. They are the difference between Claude Code guessing how a library works and Claude Code *knowing* how it works — by reading the actual documentation in real-time.

### Installing Plugins

#### Method 1: From the Settings UI (Easiest)

The simplest way to install plugins is through Claude Code's built-in settings interface:

```bash
# Open Claude Code
claude

# Open the settings/setup interface
> /settings
```

From the settings UI, you can browse available plugins, toggle them on/off, and configure them — no command-line flags needed. Popular plugins like Context7, Figma, Playwright, and GitHub are listed and can be installed with a single click.

#### Method 2: From the CLI

You can also install plugins directly from the command line:

```bash
# Install a plugin
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
claude mcp add playwright -- npx @anthropic-ai/playwright-mcp-server
claude mcp add figma -- npx -y @anthropic-ai/figma-mcp-server

# List installed plugins
claude mcp list

# Remove a plugin
claude mcp remove context7
```

#### Scope: Project vs User

Plugins can be scoped to a single project (shared with your team via git) or installed globally for all your projects:

```bash
# Install for this project only (stored in .claude/settings.json, committed to git)
claude mcp add --scope project context7 -- npx -y @upstash/context7-mcp@latest

# Install globally for all projects (stored in ~/.claude/settings.json, personal)
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp@latest
```

**Project-scoped plugins** are stored in `.claude/settings.json` and shared with your team via git. **User-scoped plugins** are personal and apply across all your projects.

### Popular Plugins at a Glance

| Plugin | What It Does | Needs API Token? |
|--------|--------------|-----------------|
| **Context7** | Live library documentation lookup | No |
| **Figma** | Read designs from Figma files | Yes — Figma personal access token |
| **Playwright** | Browser automation and E2E testing | No |
| **Paper** | Live UI design canvas | No |
| **GitHub** | PR/issue management | Yes — GitHub personal access token |
| **Postgres** | Direct database access | Yes — connection string |

All of these can be installed from the settings UI or via `claude mcp add`.

### Plugins That Need Environment Variables

Some plugins require API tokens or credentials. You can set these in the settings UI, or pass them via CLI with `--env`:

```bash
# Figma — generate token at: Figma → Settings → Personal access tokens
claude mcp add --scope project figma \
  --env FIGMA_ACCESS_TOKEN=figd_your-token-here \
  -- npx -y @anthropic-ai/figma-mcp-server

# GitHub — generate token at: GitHub → Settings → Developer settings → Personal access tokens
claude mcp add --scope project github \
  --env GITHUB_TOKEN=ghp_your-token-here \
  -- npx -y @anthropic-ai/github-mcp-server
```

### Manual Configuration (settings.json)

For full control or when sharing plugin config with your team, you can also configure MCP servers directly in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/playwright-mcp-server"]
    },
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-token"
      }
    }
  }
}
```

### Installed Plugins Overview

Once installed, these plugins are available automatically in every Claude Code session:

| Plugin | Purpose | Best For |
|--------|---------|----------|
| **Context7** | Live library documentation lookup | Ensuring code follows official API patterns |
| **Figma** | Design-to-code from Figma files | Implementing UI with pixel-perfect fidelity |
| **Playwright** | Browser automation and E2E testing | Testing user flows, visual regression |
| **Paper** | Live UI design canvas | Designing interfaces before coding |
| **GitHub** | PR/issue management | Code review, issue tracking, PR creation |
| **Postgres/SQLite** | Direct database access | Schema exploration, data verification |

---

### Context7 — Write Code That Actually Follows the Docs

**Why it matters:** Claude Code has training knowledge of libraries, but that knowledge has a cutoff date. Libraries release new versions, deprecate APIs, and change patterns. Context7 solves this by looking up **live, current documentation** for any library before writing code.

**Without Context7**, Claude might:
- Use a deprecated API that was removed in the latest version
- Miss a new, simpler way to accomplish something
- Generate code based on v2 patterns when your project uses v3
- Hallucinate function signatures or options that don't exist

**With Context7**, Claude will:
- Look up the exact API signature before using it
- Follow the official recommended patterns for your library version
- Use the correct imports, options, and configuration
- Reference actual code examples from the documentation

**How it works — the two-step workflow:**

1. **Resolve the library ID** — Context7 needs to identify which library you mean:

```
resolve-library-id("prisma") → "/prisma/prisma"
resolve-library-id("next.js app router") → "/vercel/next.js"
resolve-library-id("shadcn ui") → "/shadcn-ui/ui"
```

2. **Fetch the documentation** — Pull the relevant docs for your specific question:

```
get-library-docs("/prisma/prisma", topic: "transactions")
get-library-docs("/vercel/next.js", topic: "server actions")
get-library-docs("/shadcn-ui/ui", topic: "dialog component")
```

**When to tell Claude to use Context7:**

Add this to your CLAUDE.md to make it automatic:

````markdown
## Library Usage Rules
- Before using any external library API for the first time in a session,
  look up its documentation via Context7
- When upgrading a dependency, check Context7 for breaking changes
- If you're unsure about a function signature or option, verify with Context7
  before guessing
- Libraries to always verify: Next.js, Prisma, NextAuth, Zod, Tailwind,
  Recharts, React Hook Form
````

**Practical examples of Context7 preventing mistakes:**

| Scenario | Without Context7 | With Context7 |
|----------|-----------------|---------------|
| Prisma nested writes | Might use deprecated `connectOrCreate` syntax | Uses current `create` with nested `connect` |
| Next.js 14 data fetching | Might use `getServerSideProps` (Pages Router) | Uses Server Components with `async` functions |
| NextAuth v5 | Might import from `next-auth/react` for server | Correctly uses `auth()` from `@/lib/auth` |
| Zod validation | Might miss `z.coerce.date()` for date strings | Uses the correct coercion API |
| shadcn/ui Dialog | Might create a custom modal from scratch | Uses the existing `Dialog` primitive correctly |

**Pro tip:** You can instruct Claude to proactively check Context7 by adding this to your CLAUDE.md:

```
When implementing features that use Prisma, NextAuth, or Zod, always check
Context7 for the latest patterns before writing the code. Don't rely on
memory — verify.
```

---

### Figma — Design-to-Code with Pixel-Perfect Fidelity

**Why it matters:** The gap between design and implementation is where most UI inconsistencies creep in. The Figma MCP server lets Claude Code read your actual Figma designs — colors, spacing, typography, component structure — and implement them directly, rather than you describing what the design looks like in words.

**Without Figma MCP**, the workflow is:
1. Designer creates design in Figma
2. Developer eyeballs the design, takes screenshots
3. Developer describes the design to Claude in words: "make a card with rounded corners, a blue header..."
4. Claude guesses at spacing, colors, and layout
5. Multiple rounds of "make it more like the design"

**With Figma MCP**, the workflow is:
1. Designer creates design in Figma
2. Developer pastes the Figma URL into Claude
3. Claude reads the actual design — exact colors, spacing, typography, layout
4. Claude implements with 1:1 fidelity
5. One round, done

**Setup:**

1. Generate a Figma Personal Access Token:
   - Figma → Settings → Account → Personal access tokens
   - Create a token with read access

2. Add to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your-token-here"
      }
    }
  }
}
```

**How to use it:**

Share a Figma URL with Claude and ask it to implement:

```
Implement this component from our Figma design:
https://figma.com/design/abc123/MyProject?node-id=42:1234

Use our existing shadcn/ui primitives and Tailwind classes.
Match the design exactly — colors, spacing, typography.
```

Claude will:
1. Call `get_design_context` to read the Figma node's structure, styles, and component hierarchy
2. Call `get_screenshot` to see the visual result
3. Generate code that matches the design using your project's component library
4. Adapt Figma-specific values to your project's design tokens

**What Claude reads from Figma:**
- Exact hex colors, gradients, and opacity values
- Padding, margin, and gap values in pixels
- Font family, size, weight, and line height
- Border radius, shadows, and effects
- Component hierarchy and auto-layout structure
- Design tokens and variable definitions
- Code Connect mappings (if configured)

**Add this to your CLAUDE.md for design-to-code projects:**

```markdown
## Design Implementation
- When given a Figma URL, use the Figma MCP to read the design context
- Match the design exactly — don't approximate colors or spacing
- Map Figma values to our Tailwind classes (e.g., 16px padding → p-4)
- Use existing components from src/components/ui/ wherever possible
- If a Figma component maps to a shadcn/ui primitive, use the primitive
- Take a screenshot after implementation to verify visual match
```

---

### Playwright — Test What Users Actually Experience

**Why it matters:** Unit tests verify functions work. Playwright tests verify that *users can actually use your application*. The Playwright MCP server lets Claude Code launch a real browser, interact with your app, and verify everything works end-to-end.

**Key capabilities:**

| Capability | What It Does | Example |
|------------|-------------|---------|
| **Navigate** | Open pages and follow links | Verify login flow works end-to-end |
| **Click & Fill** | Interact with buttons and forms | Test form submission with validation |
| **Screenshot** | Capture visual state | Verify UI matches design after changes |
| **Assert** | Check page content and state | Confirm data appears after API calls |
| **Network** | Monitor API requests | Verify correct API calls are made |
| **Multi-browser** | Test across Chrome, Firefox, Safari | Catch browser-specific bugs |

**Setup:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/playwright-mcp-server"]
    }
  }
}
```

**When to use Playwright MCP:**

Add these instructions to your CLAUDE.md:

```markdown
## Testing with Playwright
- After implementing a new feature, use Playwright to verify it works:
  1. Navigate to the page
  2. Perform the user action (click, fill form, submit)
  3. Take a screenshot to verify the result
  4. Check that the correct data appears
- For bug fixes, use Playwright to reproduce the bug before fixing,
  then verify the fix works
- Use Playwright to take before/after screenshots for UI changes
```

**Practical workflow example:**

```
1. "Implement the new team creation form"
   → Claude writes the code

2. "Now test it with Playwright"
   → Claude navigates to /admin/leaderboard
   → Clicks "Add Team"
   → Fills in team name, description, color
   → Clicks "Create Team"
   → Takes a screenshot showing the new team in the list
   → Verifies the toast notification appeared
```

---

### Paper — Design Before You Code

**Why it matters:** Paper is a live design canvas where Claude Code can create and iterate on UI designs *before* writing any application code. This is valuable when you're exploring visual directions, building new features from scratch, or need to get stakeholder approval on a design before investing in implementation.

**When to use Paper vs. Figma:**

| Scenario | Use Paper | Use Figma |
|----------|-----------|-----------|
| Exploring new design directions | Yes — iterate fast on canvas | No — design doesn't exist yet |
| Implementing from existing designs | No — design already exists | Yes — read and implement |
| Prototyping before coding | Yes — visual first, code second | Only if prototype is in Figma |
| Stakeholder review | Yes — quick visual mockups | Yes — if designs are there |

**Workflow with Paper:**

1. Ask Claude to design the UI in Paper first
2. Review the design on the canvas
3. Iterate ("make the header bigger", "try a different color palette")
4. Once approved, implement the design in code

**Add this to your CLAUDE.md for design-heavy projects:**

```markdown
## Design Workflow
- For new features with significant UI, design in Paper first before coding
- Get design approval before implementing
- Use Paper for rapid visual prototyping and iteration
- Once the design is finalized, implement using the project's component library
```

---

### Choosing the Right MCP Server

Use this decision tree to pick the right server for your task:

```
Need to implement UI from a design?
  ├── Design exists in Figma → Use Figma MCP
  ├── Need to create new design → Use Paper MCP
  └── Simple UI, no design needed → Code directly

Need to write code using a library?
  ├── Unsure about API, new version, or complex usage → Use Context7
  └── Simple, well-known pattern → Code directly

Need to test the result?
  ├── User-facing flow or visual change → Use Playwright
  └── Internal logic → Write unit tests

Need to manage code/PRs?
  └── Use GitHub MCP
```

### CLAUDE.md Instructions for MCP Usage

Here is a complete MCP section you can add to your project's CLAUDE.md:

````markdown
## MCP Server Usage

### Context7 (Library Documentation)
- Use Context7 before implementing any non-trivial library usage
- Always verify: Prisma queries, NextAuth configuration, Zod schemas,
  React hook patterns, Tailwind plugins
- Workflow: resolve-library-id → get-library-docs with specific topic
- Don't guess at API signatures — look them up

### Figma (Design Implementation)
- When given a Figma URL, always use get_design_context first
- Match designs exactly — don't approximate colors, spacing, or typography
- Map Figma values to our Tailwind scale
- Use existing shadcn/ui components; don't recreate primitives
- Take a screenshot after implementation to verify

### Playwright (Testing)
- Use Playwright to verify new features work end-to-end
- Take before/after screenshots for UI changes
- Test the happy path and one error path minimum
- Use for visual regression checks after refactoring

### When NOT to use MCP
- Simple code changes that don't involve external libraries → skip Context7
- Text-only changes (copy, labels) → skip Playwright
- Backend-only changes → skip Figma
- Quick fixes where you're confident in the API → skip Context7
````

---

## The .claudeignore File

Like `.gitignore`, the `.claudeignore` file tells Claude Code which files and directories to skip when exploring your project. This improves performance and prevents Claude from reading irrelevant files.

```bash
# .claudeignore

# Dependencies
node_modules/
.pnpm-store/

# Build output
.next/
dist/
build/

# Large generated files
*.min.js
*.min.css
*.map
package-lock.json

# Sensitive files
.env*
*.pem
*.key
credentials/

# Binary files Claude can't meaningfully read
*.png
*.jpg
*.gif
*.ico
*.woff
*.woff2
```

---

## Team Setup: Getting Everyone Aligned

### Step 1: Create the Project CLAUDE.md

Start with the template from the "Anatomy" section above. Commit it to your repository root.

### Step 2: Add Directory-Level Files

Add CLAUDE.md files in key directories where conventions differ from the project root (API routes, components, tests).

### Step 3: Configure Project Settings

Create `.claude/settings.json` with:
- Permitted tools (auto-approve safe operations)
- MCP servers the team should use
- Hooks for quality gates

### Step 4: Add .claudeignore

Exclude build artifacts, dependencies, and sensitive files.

### Step 5: Document in Your README

Add a section to your README:

```markdown
## AI-Assisted Development

This project is configured for Claude Code. To get started:

1. Install Claude Code: `curl -fsSL https://claude.ai/install.sh | bash`
2. Navigate to the project root and run `claude`
3. Claude Code will automatically read the project's CLAUDE.md files

Key files:
- `CLAUDE.md` — Project-wide coding standards and patterns
- `src/components/CLAUDE.md` — Component conventions
- `src/app/api/CLAUDE.md` — API route patterns
- `.claude/settings.json` — Tool permissions and MCP servers
- `.claudeignore` — Files excluded from AI context
```

### Step 6: Review and Iterate

After the team uses Claude Code for a week:
- Collect patterns where Claude made wrong assumptions → add rules
- Identify repeated mistakes → add to the Don'ts section
- Note where Claude asked unnecessary questions → add context
- Remove rules that are too restrictive or no longer relevant

---

## Real-World Example: Complete Project Configuration

Here is a complete, production-ready CLAUDE.md for a Next.js project:

```markdown
# Project: TeamPortal

## Overview
Internal team training portal. Next.js 14 App Router, TypeScript, Tailwind CSS,
shadcn/ui components, PostgreSQL with Prisma ORM, NextAuth.js v5 authentication.

## Tech Stack
- Next.js 14 (App Router) — NOT Pages Router
- TypeScript in strict mode
- Tailwind CSS + shadcn/ui for UI
- Prisma ORM with PostgreSQL
- NextAuth.js v5 (beta) with credentials provider
- Zod for validation
- pnpm as package manager

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm typecheck` — TypeScript type checking (tsc --noEmit)
- `pnpm lint` — ESLint
- `pnpm test` — run tests
- `npx prisma studio` — database GUI
- `npx prisma db push` — sync schema to database

## Architecture Rules
- Server Components are the default. Only add "use client" when you need
  interactivity (onClick, useState, useEffect, browser APIs).
- Data fetching: Server Components call Prisma directly. Client Components
  call API routes via fetch().
- API routes: always check auth, validate with Zod, return JSON.
- All database access through `src/lib/prisma.ts` singleton.

## Coding Standards
- Named function exports for components (not arrow function const)
- Props interfaces: `[ComponentName]Props`
- Absolute imports with `@/` prefix
- No `any` types. Use `unknown` and narrow if needed.
- No default exports except for Next.js pages/layouts (required by framework)
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes

## File Organization
- `src/app/(main)/` — authenticated user pages
- `src/app/(admin)/admin/` — admin-only pages
- `src/app/api/` — API routes
- `src/components/ui/` — shadcn/ui primitives (DO NOT MODIFY)
- `src/components/common/` — shared project components
- `src/components/[feature]/` — feature-specific components
- `src/lib/` — utilities, auth, database, markdown
- `src/lib/validations/` — Zod schemas

## Don'ts
- Don't modify files in `src/components/ui/` (shadcn primitives)
- Don't install new packages without asking
- Don't modify prisma/schema.prisma without approval
- Don't commit .env files
- Don't use inline styles — Tailwind only
- Don't auto-commit — wait for explicit instruction
- Don't add TODO comments — implement or skip

## Patterns to Follow
When creating a new API route, follow the pattern in:
  `src/app/api/admin/teams/route.ts`

When creating a new admin page, follow the pattern in:
  `src/app/(admin)/admin/leaderboard/page.tsx`

When creating a new component, follow the pattern in:
  `src/components/leaderboard/team-ranking-card.tsx`
```

---

## Troubleshooting Common Issues

### Claude Code ignores my CLAUDE.md
- Verify the file is named exactly `CLAUDE.md` (case-sensitive)
- Check it's in the right directory (project root for project-wide rules)
- CLAUDE.md is loaded at session start — restart the session after changes

### Claude Code still makes mistakes despite rules
- Be more specific. Instead of "follow best practices," write the exact pattern
- Add concrete examples of correct and incorrect code
- Reference specific files as patterns: "follow the pattern in `src/app/api/admin/teams/route.ts`"

### Instructions are too long / context overflow
- Keep project CLAUDE.md under 200 lines — move details to directory-level files
- Use bullet points instead of paragraphs
- Link to pattern files instead of inlining large code examples
- Move personal preferences to `~/.claude/CLAUDE.md`

### Team members getting different behavior
- Ensure CLAUDE.md and `.claude/settings.json` are committed to git
- Check that no one has conflicting user-level instructions in `~/.claude/CLAUDE.md`
- Standardize the Claude Code version across the team

---

## Hands-on Exercise

### Exercise 1: Configure a Project from Scratch

1. Create a new directory and initialize a project:
   ```bash
   mkdir my-configured-project && cd my-configured-project
   git init
   npm init -y
   ```

2. Create a `CLAUDE.md` file with:
   - Project overview (describe it as a REST API for a todo app)
   - Tech stack (Node.js, Express, TypeScript, SQLite)
   - At least 5 coding standards
   - At least 5 don'ts
   - A testing section

3. Create a `.claudeignore` file excluding `node_modules`, `dist`, and `.env`

4. Start Claude Code and ask it to scaffold the project. Observe whether it follows your rules.

### Exercise 2: Add Directory-Level Configuration

1. In the project from Exercise 1, create `src/routes/CLAUDE.md` with API route conventions
2. Create `src/middleware/CLAUDE.md` with middleware patterns
3. Ask Claude Code to add a new endpoint — verify it follows the directory-level conventions

### Exercise 3: Configure Hooks and Permissions

1. Create `.claude/settings.json` with:
   - Auto-approved tools: Read, Glob, Grep, Edit
   - A PostToolUse hook that runs the linter after file edits
2. Test that the hook fires when Claude edits a file
3. Try to make Claude edit a file that should be protected — verify the hook blocks it

### Exercise 4: Team Onboarding Document

Write a 1-page guide for onboarding a new team member to your Claude Code-configured project. Include:
- How to install and authenticate
- What the CLAUDE.md files do
- How to verify the configuration is working
- Where to add new rules when patterns emerge

---

## Key Takeaways

1. **CLAUDE.md is your most powerful tool** — invest time in writing clear, specific instructions
2. **Be prescriptive, not descriptive** — "Use named function exports" beats "follow best practices"
3. **Layer your configuration** — project root for team standards, directories for local conventions, user-level for personal preferences
4. **Include concrete examples** — reference actual files in your codebase as patterns to follow
5. **Iterate on your rules** — the best CLAUDE.md files evolve based on real mistakes and team feedback
6. **Commit your configuration** — CLAUDE.md and `.claude/settings.json` belong in version control
7. **Use hooks for enforcement** — don't rely on instructions alone; automate quality gates
8. **Keep it concise** — a 100-line CLAUDE.md that's read and followed beats a 500-line one that's ignored

---

## See Also

- [Module 3: Claude Code Essentials](/modules/03-claude-code-essentials) — Installation, core tools, and basic workflows
- [Module 5: Prompt Engineering for Developers](/modules/05-prompt-engineering-for-developers) — Writing effective prompts and instructions
- [Module 11: AI-Assisted Development Best Practices](/modules/11-ai-dev-best-practices) — Team-level trust policies and CI/CD integration
- [Module 12: AI Boundary Enforcement](/modules/12-ai-boundary-enforcement) — The 7-layer enforcement model for multi-team environments
