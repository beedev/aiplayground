# Claude Code Essentials

## Learning Objectives

By the end of this module, you will be able to:

- Explain what Claude Code is and how it differs from IDE-based AI tools
- Install, configure, and authenticate Claude Code
- Use Claude Code's core tools (Read, Write, Edit, Bash, Grep, Glob) effectively
- Manage project context using CLAUDE.md files
- Understand the permissions and safety model
- Connect and use MCP servers for extended capabilities
- Apply best practices for iterative, agentic development workflows

---

## What Is Claude Code?

Claude Code is Anthropic's official **agentic coding tool** for software development. It works both as a **CLI tool** in your terminal and as a **VS Code extension** (IDE integration). Unlike simple inline completion tools, Claude Code operates as an **agentic tool** that can:

- Read and understand your entire project structure
- Create, edit, and delete files across your codebase
- Execute shell commands and interpret their output
- Perform multi-step tasks autonomously
- Search your codebase with grep and glob patterns
- Coordinate complex workflows involving many files

Think of it as having a senior developer sitting in your terminal who can read your code, make changes, run tests, and iterate until the task is done.

### Key Differentiators

| Feature | IDE Copilots | Claude Code |
|---------|-------------|-------------|
| Interface | IDE sidebar/inline | Terminal/CLI and VS Code extension |
| Scope | Current file + open tabs | Entire project directory |
| Autonomy | Suggests, you accept | Can plan and execute multi-step tasks |
| File operations | Edits current file | Creates, edits, deletes any file |
| Shell access | Limited/none | Full shell command execution |
| Context | IDE-managed | You control via conversation and CLAUDE.md |

---

## Installation and Setup

### Prerequisites

- A terminal (zsh, bash, or similar)
- A Claude Pro, Max, Teams, Enterprise, or Console (API) account
- macOS, Linux, or Windows (via WSL)

Note: Node.js is **not** required when installing via Homebrew or direct download. Node.js 18+ is only needed if you choose the npm installation method.

### Install

There are several ways to install Claude Code:

```bash
# Recommended method on macOS/Linux: Native installer (auto-updates, no Node.js needed)
curl -fsSL https://claude.ai/install.sh | bash

# Alternative: Homebrew (macOS/Linux, does NOT auto-update)
brew install --cask claude-code

# Alternative: npm (requires Node.js 18+)
npm install -g @anthropic-ai/claude-code

# Windows:
# irm https://claude.ai/install.ps1 | iex
```

Claude Code can also be launched directly from [claude.ai](https://claude.ai) with a Claude Pro or Max subscription, and it is available as a **VS Code extension** -- search for "Claude Code" in the VS Code Extensions marketplace to use it as an IDE-integrated agent alongside the CLI.

### Verify Installation

```bash
claude --version
```

### First Run and Authentication

```bash
# Navigate to your project directory
cd /path/to/your/project

# Start Claude Code
claude

# On first run, you will be prompted to authenticate
# Follow the browser-based auth flow or provide an API key
```

### Configuration

Claude Code stores configuration in `~/.claude/` for global settings and reads project-specific settings from your working directory.

```bash
# View current configuration
claude config list

# Set a preference
claude config set --global preferredNotifChannel terminal

# Set the model to use (check available model IDs -- they change with new releases)
claude config set --global model claude-sonnet-4-20250514
```

### Models

Claude Code uses **Claude Sonnet 4** by default (currently at version 4.6), which provides a strong balance of speed and capability for everyday coding tasks. For complex tasks requiring deeper reasoning (architectural analysis, difficult debugging, large refactors), you can switch to **Claude Opus 4** (currently at version 4.6) using the `--model` flag or the `/model` slash command within a session:

```bash
# Start Claude Code with Opus for a complex task
claude --model claude-opus-4-20250514

# Or switch models during a session using the /model command
# Check current available model IDs with: claude model list
```

Note: Model version IDs change as Anthropic releases updates. The IDs shown above are examples -- use `/model` within a session to see currently available models.

---

## Core Workflow: How Claude Code Operates

Claude Code follows a **conversation-driven workflow**. You describe what you want, and Claude Code uses its tools to accomplish the task.

### The Interaction Loop

```
You: Describe a task or ask a question
  |
  v
Claude Code: Analyzes the request
  |
  v
Claude Code: Uses tools (Read, Grep, Bash, etc.) to understand context
  |
  v
Claude Code: Proposes a plan or asks clarifying questions
  |
  v
Claude Code: Executes changes (Write, Edit, Bash)
  |
  v
Claude Code: Verifies the result
  |
  v
You: Review, approve, or request changes
```

### A Typical Session

```
$ cd ~/projects/my-app
$ claude

> Add input validation to the createUser endpoint. Reject requests
  where email is missing or malformed, and where password is shorter
  than 8 characters. Return appropriate 400 responses with error messages.

# Claude Code will:
# 1. Read the existing route file to understand the current implementation
# 2. Read the test file to understand existing test patterns
# 3. Edit the route handler to add validation
# 4. Edit or create tests for the new validation
# 5. Run the tests to verify everything passes
```

---

## Key Tools

Claude Code has access to a set of tools it uses to interact with your codebase. Understanding these tools helps you predict Claude Code's behavior and guide it effectively.

### Read

Reads file contents. Claude Code uses this to understand your existing code before making changes.

```
# Claude Code calls this automatically, but you can prompt it:
> Read the src/routes/users.ts file and explain the createUser handler
```

**Best practice:** Claude Code should always read a file before editing it. If you notice it trying to edit a file it has not read, ask it to read first.

### Write

Creates new files or completely rewrites existing ones.

```
> Create a new file src/middleware/validate.ts with a generic
  validation middleware that accepts a Zod schema
```

### Edit

Makes targeted edits to existing files. This is more precise than Write because it only modifies specific sections rather than rewriting the entire file.

```
> In src/routes/users.ts, add a try-catch block around the
  database call in the createUser handler
```

### Bash

Executes shell commands. This is one of Claude Code's most powerful tools -- it can run tests, install packages, check git status, and more.

```
> Run the test suite and show me any failures

# Claude Code executes: npm test
# Then analyzes the output and reports results
```

### Grep

Searches for patterns across your codebase. Faster and more targeted than reading every file.

```
> Find all files that import from the deprecated 'utils/legacy' module

# Claude Code uses grep to search across all files
```

### Glob

Finds files matching a pattern. Useful for understanding project structure.

```
> Show me all TypeScript files in the src/services directory

# Claude Code uses glob: src/services/**/*.ts
```

### How Tools Work Together

A typical multi-step task uses several tools in sequence:

```
Task: "Rename the UserService class to AccountService across the entire codebase"

Step 1: Glob -- find all .ts files in the project
Step 2: Grep -- find all files containing "UserService"
Step 3: Read -- read each file to understand the context of each reference
Step 4: Edit -- update each file, renaming the class and all references
Step 5: Bash -- run TypeScript compiler to check for errors
Step 6: Bash -- run tests to verify nothing broke
```

---

## Context Management: CLAUDE.md Files

CLAUDE.md files are the primary mechanism for giving Claude Code persistent context about your project. They act as standing instructions that Claude Code reads at the start of every session.

### CLAUDE.md Hierarchy

```
~/.claude/CLAUDE.md          # Global: applies to ALL projects
  |
  v
/project/CLAUDE.md           # Project root: applies to this project
  |
  v
/project/src/CLAUDE.md       # Directory: applies within src/
```

### What to Put in CLAUDE.md

```markdown
# Project: My App

## Tech Stack
- TypeScript 5.x, Node.js 22, Express 4
- PostgreSQL 15 with Prisma ORM
- Jest for testing, Zod for validation

## Coding Conventions
- Use functional style, avoid classes where possible
- All functions must have JSDoc comments
- Use named exports, not default exports
- Error handling: throw AppError instances, never raw strings

## Project Structure
- src/routes/ -- Express route handlers
- src/services/ -- Business logic
- src/models/ -- Prisma model extensions
- src/middleware/ -- Express middleware
- src/__tests__/ -- Test files mirror src/ structure

## Commands
- `npm run dev` -- start dev server
- `npm test` -- run all tests
- `npm run typecheck` -- TypeScript type checking
- `npm run lint` -- ESLint

## Important Rules
- Never modify migration files after they have been applied
- Always add database indexes for foreign key columns
- API responses must follow the { data, error, meta } envelope format
```

### CLAUDE.md Tips

1. **Be specific about conventions.** "Use camelCase" is better than "follow good naming."
2. **Include commands.** Claude Code can run your build/test/lint commands if it knows them.
3. **Document gotchas.** If there are known quirks ("the test database must be running on port 5433"), document them.
4. **Keep it updated.** CLAUDE.md is a living document. Update it as your project evolves.

---

## Permissions and Safety Model

Claude Code operates with a permission system to prevent unintended changes.

### Permission Levels

| Operation | Permission | Notes |
|-----------|-----------|-------|
| Read files | Always allowed | Claude Code can read any file in your project |
| Write/Edit files | Requires approval | You see the proposed changes and approve or reject |
| Bash commands (safe) | Allowed by default | `ls`, `cat`, `git status`, `npm test` |
| Bash commands (risky) | Requires approval | `rm`, `git push`, `npm publish`, database operations |
| Create files | Requires approval | New file creation shows the proposed content |

### Controlling Permissions

```bash
# Allow all file edits without prompting (trust mode)
claude config set --global autoApproveEdits true

# Allow specific bash commands without prompting
claude config set --global allowedBashCommands "npm test,npm run lint,npm run typecheck"
```

### Safety Best Practices

1. **Start with default permissions** until you trust your CLAUDE.md and workflow
2. **Review file edits** before approving, especially for unfamiliar codebases
3. **Use git** as your safety net -- commit before asking Claude Code to make large changes
4. **Be cautious with Bash** -- review commands that modify data or push to remote

---

## Working with MCP Servers

MCP (Model Context Protocol) servers extend Claude Code's capabilities by connecting it to external tools and services.

### What Are MCP Servers?

MCP servers are plugins that give Claude Code access to external services:

- **Context7** -- Library documentation lookup
- **Playwright** -- Browser automation and testing
- **Custom servers** -- Connect to your own APIs, databases, or tools

### Configuration

MCP servers are configured in your Claude Code settings:

```json
// ~/.claude/config.json or project .mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/playwright-mcp"]
    }
  }
}
```

### Using MCP Servers in Conversation

Once configured, you can reference MCP capabilities naturally:

```
> Look up the latest Express.js documentation for middleware patterns
  and then implement a rate limiter middleware following their recommended approach

# Claude Code uses Context7 to fetch Express docs, then implements based on them
```

---

## Slash Commands and Custom Skills

### Built-in Slash Commands

| Command | Purpose |
|---------|---------|
| `/help` | Show available commands and usage |
| `/clear` | Clear the conversation history |
| `/compact` | Summarize the conversation to save context |
| `/cost` | Show token usage and estimated cost |
| `/init` | Generate a CLAUDE.md for your project |
| `/model` | Switch the AI model during a session |

### Hooks

Claude Code supports **hooks** -- scripts that run automatically before or after specific events (e.g., before a file edit, after a bash command). Hooks allow you to enforce project-specific policies, run linters automatically, or log AI actions. Configure hooks in your project's `.claude/` settings.

### Custom Slash Commands

You can create custom commands by adding markdown files to `.claude/commands/`:

```markdown
<!-- .claude/commands/review.md -->
Review the code in $ARGUMENTS for:
1. Security vulnerabilities
2. Performance issues
3. Missing error handling
4. Test coverage gaps

Provide a summary with severity ratings (Critical/High/Medium/Low)
and specific line references for each finding.
```

Usage:

```
> /review src/routes/auth.ts
```

### Skills

Skills are reusable prompts stored as markdown files that Claude Code can reference:

```markdown
<!-- .claude/skills/api-endpoint.md -->
When creating a new API endpoint:
1. Create the route handler in src/routes/
2. Create the service function in src/services/
3. Add input validation using Zod schemas in src/validators/
4. Add tests in src/__tests__/ covering happy path and error cases
5. Update the OpenAPI spec in docs/api.yaml
6. Run the full test suite to verify
```

---

## Best Practices for Claude Code

### 1. Be Specific About What You Want

```
# Vague (poor results)
> Fix the bug

# Specific (good results)
> The /api/users/:id endpoint returns 500 when the user ID does not exist
  in the database. It should return 404 with { error: "User not found" }.
  The handler is in src/routes/users.ts.
```

### 2. Provide Context Before Asking for Changes

```
> I am building a REST API for a task management app. The tech stack is
  Express + TypeScript + Prisma + PostgreSQL. I need to add a new endpoint
  for creating tasks. Tasks belong to a user and have a title, description,
  status (todo/in_progress/done), and due date.
>
> Create the route handler, service, Prisma schema update, and tests.
```

### 3. Iterate Rather Than Over-Specifying

Start with a high-level request, review the output, then refine:

```
> Create a caching middleware for Express

# Review output, then refine:
> Good start. Now add TTL support and a max-size limit with LRU eviction.
  Also, add a cache-control header to the response.

# Further refinement:
> The LRU implementation looks correct but let us use a Map instead of
  an object for better performance with frequent deletions.
```

### 4. Use Claude Code for Multi-File Operations

Claude Code excels at tasks that span many files:

```
> Rename the "status" field to "state" in the Task model.
  Update the Prisma schema, all route handlers, services, tests,
  and the OpenAPI documentation.
```

### 5. Let Claude Code Run Tests

```
> After making the changes, run the full test suite and fix any failures.
```

### 6. Use /compact to Manage Long Sessions

If your session gets long, use `/compact` to summarize the conversation and free up context window space for new instructions.

### 7. Commit Before Big Changes

```bash
git commit -am "checkpoint before Claude Code refactoring"
```

Then if something goes wrong, you can `git diff` to see exactly what changed and `git checkout .` to revert.

---

## Common Workflows

### Debugging Workflow

```
> The tests in src/__tests__/auth.test.ts are failing with:
  "TypeError: Cannot read property 'token' of undefined"
>
> Read the test file, the auth service, and the token utility
  to identify the root cause and fix it.
```

### Refactoring Workflow

```
> The UserService class in src/services/user.ts has grown to 500 lines.
  Split it into focused modules:
  - UserAuthService (login, register, password reset)
  - UserProfileService (get, update, delete profile)
  - UserPreferencesService (get, update preferences)
>
> Keep the existing API contract intact and update all imports.
```

### Feature Implementation Workflow

```
> I need to add webhook support to the application.
>
> Requirements:
> - Users can register webhook URLs for specific events
> - When events occur, POST the event payload to registered URLs
> - Retry failed deliveries 3 times with exponential backoff
> - Log all delivery attempts
>
> Start by reading the existing codebase to understand patterns,
> then implement the feature following existing conventions.
```

---

## Exercise

### Scaffold a Project with Claude Code

**Goal:** Use Claude Code to create a small but complete project from scratch, exercising its agentic capabilities.

**Task:** Build a CLI tool called `quicknote` that manages text notes from the terminal.

**Requirements:**
- TypeScript project with proper tsconfig.json and package.json
- Commands: `add <note>`, `list`, `search <query>`, `delete <id>`, `export --format json|csv`
- Notes stored in a local JSON file (~/.quicknotes.json)
- Each note has: id (uuid), content, created_at, tags (extracted from #hashtags)
- Colorized terminal output using chalk
- Unit tests for core functions

**Steps:**

1. Start Claude Code in an empty directory:
   ```bash
   mkdir quicknote && cd quicknote
   claude
   ```

2. Give Claude Code the full requirements above and ask it to scaffold the project.

3. Review the generated code. Pay attention to:
   - Does the project structure make sense?
   - Are the TypeScript types well-defined?
   - Is the file I/O handled safely (concurrent access, missing file)?
   - Are the tests meaningful or superficial?

4. Ask Claude Code to run the tests and fix any failures.

5. Try using the tool:
   ```bash
   npx ts-node src/index.ts add "Learn Claude Code #training #ai"
   npx ts-node src/index.ts list
   npx ts-node src/index.ts search "training"
   ```

6. Ask Claude Code to add a new feature: `stats` command that shows total notes, notes per tag, and notes created in the last 7 days.

**Reflect:**
- How many iterations did it take to get a working project?
- What did Claude Code get right on the first try? What needed correction?
- How did the CLAUDE.md file (if you created one) affect the output quality?
