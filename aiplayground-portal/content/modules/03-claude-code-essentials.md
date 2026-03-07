# Claude Code Essentials

> **Official Documentation:** Features, commands, and configuration options evolve rapidly. Always refer to the [Claude Code official documentation](https://code.claude.com/docs) for the most up-to-date information.

## Learning Objectives

By the end of this module, you will be able to:

- Explain what Claude Code is and how it differs from IDE-based AI tools
- Install, configure, and authenticate Claude Code
- Use Claude Code's core tools (Read, Write, Edit, Bash, Grep, Glob) effectively
- Master slash commands, custom commands, and skills
- Use agents, memory, session resume, and headless mode
- Understand the status bar, permission modes, and CLI flags
- Set up Claude Code in VS Code and configure it for CI/CD pipelines

---

## What Is Claude Code?

Claude Code is Anthropic's official **agentic coding tool** for software development. It works both as a **CLI tool** in your terminal and as a **VS Code extension** (IDE integration). Unlike simple inline completion tools, Claude Code operates as an **agentic tool** that can:

- Read and understand your entire project structure
- Create, edit, and delete files across your codebase
- Execute shell commands and interpret their output
- Perform multi-step tasks autonomously
- Search your codebase with grep and glob patterns
- Coordinate complex workflows involving many files
- Spawn sub-agents for parallel work
- Persist memory across sessions

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
| Memory | Per-session only | Persistent across sessions |
| Parallelism | Single thread | Can spawn sub-agents for parallel work |

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

Claude Code can also be launched directly from [claude.ai](https://claude.ai) with a Claude Pro or Max subscription, and it is available as a **VS Code extension** — search for "Claude Code" in the VS Code Extensions marketplace to use it as an IDE-integrated agent alongside the CLI.

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

Note: Model version IDs change as Anthropic releases updates. The IDs shown above are examples — use `/model` within a session to see currently available models.

---

## The Status Bar

The bottom of the Claude Code terminal shows a status bar with real-time session information:

```
Opus 4.6   in:66.8k  out:358.6k   ctx:60% used / 40% left   120756 tokens
```

| Element | What It Shows |
|---------|---------------|
| **Model name** | The active model (e.g., `Opus 4.6`, `Sonnet 4.6`) |
| **in/out** | Tokens sent to and received from the model this session |
| **ctx** | Context window usage — how much of the model's memory is filled |
| **tokens** | Total token count for the conversation |

### Customizing the Status Bar

You can configure what appears in the status bar and how notifications work:

```bash
# Set notification channel (terminal, iterm2, or system notifications)
claude config set --global preferredNotifChannel terminal

# Toggle verbose mode to see detailed tool call info above the status bar
claude --verbose

# Switch the model shown in the status bar mid-session
> /model claude-opus-4-20250514

# Toggle between fast mode (faster output, same model) and normal mode
> /fast
```

The status bar updates in real-time. Key keyboard shortcuts while in a session:

| Shortcut | Action |
|----------|--------|
| `Esc` | Interrupt Claude's current response |
| `Ctrl+C` | Cancel current operation |
| `Ctrl+D` | Exit the session |
| `Up/Down` | Navigate input history |

### Why the Status Bar Matters

- **Context window (ctx)** is your most important resource. When it reaches ~95%, Claude Code will auto-compact the conversation, potentially losing earlier context. Watch this number.
- **in/out tokens** help you understand cost. More input = more context being sent; more output = Claude is generating more code.
- When context gets high, use `/compact` proactively to summarize the conversation before auto-compaction kicks in.

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

Executes shell commands. This is one of Claude Code's most powerful tools — it can run tests, install packages, check git status, and more.

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

## Slash Commands

Slash commands are built-in actions you can trigger during a session. Type `/` to see the full list.

### Essential Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/help` | Show available commands and usage | When you're unsure what's available |
| `/compact` | Summarize conversation to save context | When `ctx` is above 60% |
| `/clear` | Clear conversation history completely | Starting fresh on a new task |
| `/cost` | Show token usage and estimated cost | Monitoring spend |
| `/model` | Switch the AI model during a session | Switch to Opus for complex tasks |
| `/init` | Generate a CLAUDE.md for your project | First-time project setup |
| `/permissions` | View and modify tool permissions | Adjusting what Claude can do |
| `/doctor` | Diagnose installation and config issues | When something isn't working |
| `/memory` | View and manage persistent memory | Checking what Claude remembers |
| `/resume` | Resume a previous conversation | Continuing interrupted work |

### The /init Command

When you start using Claude Code in a new project, `/init` analyzes your codebase and generates a CLAUDE.md file with:
- Detected tech stack and framework
- Project structure overview
- Build and test commands
- Suggested coding conventions

```
$ claude
> /init

# Claude Code will scan your project and generate a CLAUDE.md
# Review it, edit it, and commit it to your repo
```

This gives you a starting point — see [Module 17: Setting Up Claude Code for Your Project](/modules/claude-code-project-setup) for how to craft a comprehensive CLAUDE.md.

### The /compact Command

Context management is critical. When your context window fills up, Claude Code auto-compacts by summarizing earlier conversation, which can lose important details.

**Proactive compaction** gives you control:

```
> /compact

# Claude summarizes the conversation so far, preserving key decisions
# and file changes, then frees up context for new work
```

**When to compact:**
- Context usage (`ctx` in status bar) is above 60%
- You're switching to a different task in the same session
- After completing a major implementation step

---

## Custom Commands and Skills

### Custom Slash Commands

Create reusable prompts by adding markdown files to `.claude/commands/`:

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

The `$ARGUMENTS` placeholder is replaced with whatever you type after the command name.

### Project Commands vs User Commands

| Location | Scope | Shared? |
|----------|-------|---------|
| `.claude/commands/` | This project only | Yes — committed to git |
| `~/.claude/commands/` | All your projects | No — personal only |

**Team tip:** Create project-level commands for your team's common workflows (deploy checklist, PR template, API endpoint scaffold) and commit them to git.

### Skills

Skills are more detailed instruction templates stored as markdown files:

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

Skills are automatically available to Claude Code as context. When you ask it to create an API endpoint, it will follow the skill instructions.

---

## Agents and Parallel Work

Claude Code can operate as a single agent, or it can spawn multiple agents that work in parallel. This is one of its most powerful capabilities for complex tasks.

### Sub-Agents

Sub-agents are separate Claude instances that work on tasks in parallel while the main session continues. They have their own context window and return results when done.

**How to use them:**

```
# Ask Claude to delegate work to a sub-agent
> Research how the auth module works in a sub-agent while I continue here.

# Claude will spawn a background agent, and you can keep working
> While that's running, let's work on the API documentation.

# The sub-agent results appear when it finishes
```

**Best for:**
- Researching a question without polluting your main context
- Running multiple independent investigations simultaneously
- Delegating file exploration while you focus on implementation

### Multi-Agent Mode (claude --multi)

For larger tasks, you can run multiple Claude Code sessions in parallel terminals:

```bash
# Terminal 1: Work on the frontend
claude

# Terminal 2: Work on the backend API in parallel
claude

# Terminal 3: Work on tests
claude
```

Each session is independent with its own context, but they all share the same CLAUDE.md and project configuration.

### Background Tasks

Long-running operations can execute in the background:

```
# Run tests without blocking your conversation
> Run the full test suite in the background and notify me when it's done

# Run a build while continuing to code
> Build the project in the background and let me know if there are errors
```

Claude will execute the command and alert you when it completes, leaving the conversation free for other work.

### Worktrees for Isolated Work

For tasks that need file-system isolation (so changes don't conflict), Claude Code supports git worktrees:

```bash
# Claude can create a worktree for isolated work
> Create a git worktree to prototype the new auth flow without
  affecting the main working directory
```

---

## Memory: Persistence Across Sessions

Claude Code has **auto-memory** — it can remember important information across sessions without you having to repeat it. Memory is enabled by default and requires no setup.

### How Memory Works

- Claude Code stores memories in `~/.claude/projects/<project-path>/memory/`
- Memories are organized by topic (not chronologically)
- The main `MEMORY.md` file is loaded into every conversation
- Additional topic files are created for detailed notes

### What Gets Remembered

- Patterns and conventions confirmed across multiple interactions
- Key architectural decisions and important file paths
- Your preferences for workflow, tools, and communication style
- Solutions to recurring problems

### Managing Memory — Commands

```bash
# View what Claude remembers (inside a session)
> /memory

# Ask Claude to remember something specific
> Remember: always use pnpm, never npm, in this project

# Ask Claude to forget something
> Forget the memory about using yarn

# Disable memory for a single session
claude --no-memory

# Clear all memory for the current project
rm -rf ~/.claude/projects/-path-to-project/memory/
```

### Manual Memory Editing

You can directly view and edit memory files — they're just Markdown:

```bash
# Find your project's memory directory
ls ~/.claude/projects/

# The path replaces / with - (e.g., /Users/bharath/myproject → -Users-bharath-myproject)
ls ~/.claude/projects/-Users-bharath-myproject/memory/

# Edit the main memory file
nano ~/.claude/projects/-Users-bharath-myproject/memory/MEMORY.md

# Memory files you might see:
# MEMORY.md          — Main memory (always loaded, keep under 200 lines)
# debugging.md       — Topic-specific notes
# patterns.md        — Codebase patterns and conventions
# preferences.md     — Your workflow preferences
```

### Memory vs CLAUDE.md

| | Memory | CLAUDE.md |
|--|--------|-----------|
| **Who writes it** | Claude (auto) or you | You (manual) |
| **Shared with team** | No — personal | Yes — committed to git |
| **Content** | Learned preferences, patterns | Coding standards, rules |
| **Location** | `~/.claude/projects/` | Project root or subdirectories |
| **Persistence** | Across sessions | Across sessions and team members |

Use CLAUDE.md for team standards. Use memory for personal preferences and things Claude learns about your workflow.

---

## Session Management

### Resume a Previous Session

Claude Code saves session history. You can resume where you left off:

```bash
# Resume the most recent session
claude --resume

# Continue the last session (alias)
claude --continue

# List recent sessions to choose from
claude --resume --list
```

This is invaluable when:
- Your terminal crashed mid-task
- You closed the terminal and want to continue tomorrow
- You need to pick up context from a previous conversation

### One-Shot Mode (-p flag)

For quick, non-interactive tasks:

```bash
# Ask a question without entering interactive mode
claude -p "What does the createUser function in src/routes/users.ts do?"

# Generate code and pipe it to a file
claude -p "Generate a TypeScript interface for a User with name, email, role" > src/types/user.ts

# Use in shell scripts
RESULT=$(claude -p "What port does this Express app listen on?")
echo "App runs on port: $RESULT"
```

### Headless Mode for CI/CD

Claude Code can run without interactive prompts — perfect for CI/CD pipelines:

```bash
# Run with no interactive prompts, auto-accept all changes
claude -p "Run the linter and fix all auto-fixable issues" \
  --dangerously-skip-permissions \
  --output-format json

# Use in a GitHub Action
claude -p "Generate a changelog from the last 10 commits" \
  --dangerously-skip-permissions \
  --output-format text > CHANGELOG.md
```

---

## Permission Modes

Claude Code has a layered permission system that controls how much autonomy it has. Understanding the modes helps you work efficiently while staying safe.

### The Three Modes

| Mode | How to Activate | Behavior |
|------|----------------|----------|
| **Default** | Just run `claude` | Asks permission for file writes and risky shell commands |
| **Auto-accept edits** | Toggle in session | Auto-approves file edits, still asks for shell commands |
| **Dangerously skip permissions** | `--dangerously-skip-permissions` | Auto-approves everything — no prompts at all |

### Default Mode (Recommended for Learning)

In default mode, Claude Code asks before:
- Writing or editing any file
- Running shell commands that could modify state
- Creating new files

Safe operations (reading files, searching, listing) are always allowed without prompting.

### Auto-Accept Edits

Once you trust your CLAUDE.md and workflow, you can auto-accept file edits to move faster. Claude will still ask before running shell commands.

```bash
# Toggle auto-accept edits in a session
> /permissions

# Or set it via config
claude config set --global autoApproveEdits true

# Allow specific bash commands without prompting
claude config set --global allowedBashCommands "npm test,npm run lint,npm run typecheck"
```

### Dangerously Skip Permissions

The `--dangerously-skip-permissions` flag removes **all** safety prompts. Claude Code will read, write, delete, and execute without asking.

```bash
claude --dangerously-skip-permissions
```

**When to use it:**
- CI/CD pipelines where no human is present to approve
- Automated scripts that run Claude Code
- Batch operations where you've tested the workflow

**When NOT to use it:**
- Interactive development sessions (you lose the ability to review)
- Working on unfamiliar codebases
- Any situation involving production data or infrastructure

**Important:** This flag exists for automation, not convenience. In interactive sessions, the approval prompts are a feature, not a burden — they catch mistakes before they happen.

See [Module 17: Setting Up Claude Code for Your Project](/modules/claude-code-project-setup) for configuring granular permissions per tool.

---

## VS Code Extension

Claude Code is available as a VS Code extension, giving you the full agentic experience inside your IDE.

### Setup

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Search for "Claude Code"
4. Install the extension
5. Authenticate (same flow as CLI)

### Key Features in VS Code

| Feature | Description |
|---------|-------------|
| **Inline chat** | Talk to Claude in a panel inside VS Code |
| **File context** | Claude automatically sees your open files and workspace |
| **Terminal integration** | Claude can run commands in the VS Code terminal |
| **Diff view** | See proposed changes in VS Code's native diff viewer |
| **Multi-file edits** | Edit multiple files with VS Code's undo/redo support |

### CLI vs VS Code: When to Use Which

| Scenario | Use CLI | Use VS Code Extension |
|----------|---------|----------------------|
| Complex multi-file refactoring | Yes — full terminal power | Works too, but CLI is faster |
| Quick edits while coding | No — context switch | Yes — stays in your editor |
| CI/CD and automation | Yes — scriptable | No — interactive only |
| Visual diff review | Basic terminal diff | Yes — native VS Code diff |
| Pair programming with Claude | Yes — full autonomy | Yes — more visual |

---

## Claude Teams and Enterprise

### Claude Teams

For team environments, Claude Code supports shared configurations that ensure consistency across all team members.

**Setup for teams:**

```bash
# 1. Create project-level CLAUDE.md (shared coding standards)
claude
> /init
# Review and commit the generated CLAUDE.md

# 2. Create shared custom commands
mkdir -p .claude/commands
# Add team commands (e.g., deploy-checklist.md, review.md)

# 3. Configure shared settings (plugins, permissions)
# Edit .claude/settings.json — see Module 17 for details

# 4. Commit everything to git
git add CLAUDE.md .claude/
git commit -m "feat: add Claude Code team configuration"
```

**What's shared via git:**

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Coding standards, architecture rules, dos/don'ts |
| `.claude/commands/` | Custom slash commands for the team |
| `.claude/settings.json` | Plugin config, permissions, hooks |
| `.claudeignore` | Files excluded from AI context |

**What stays personal (not committed):**

| File | Purpose |
|------|---------|
| `~/.claude/CLAUDE.md` | Personal preferences |
| `~/.claude/settings.json` | Personal plugin config |
| `~/.claude/commands/` | Personal custom commands |
| `~/.claude/projects/*/memory/` | Auto-memory |

### Enterprise Features

Claude Enterprise adds organization-wide controls:

```bash
# Enterprise SSO authentication
claude auth login --sso

# Check organization policies
claude config list --org
```

- **Admin controls** — Organization-wide policies for Claude Code usage
- **Usage analytics** — Track token usage, common tasks, and productivity metrics
- **SSO integration** — Single sign-on for authentication
- **Data privacy** — Enterprise data handling and retention policies
- **Audit logs** — Track all Claude Code actions across the organization

---

## CLI Flags Reference

### Common Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `--model` | Choose a specific model | `claude --model claude-opus-4-20250514` |
| `--resume` | Resume the last session | `claude --resume` |
| `--continue` | Continue the last conversation | `claude --continue` |
| `-p` | One-shot prompt (non-interactive) | `claude -p "explain this function"` |
| `--output-format` | Output format for `-p` mode | `claude -p "..." --output-format json` |
| `--dangerously-skip-permissions` | Skip all permission prompts | For CI/CD only |
| `--verbose` | Show detailed tool call information | Debugging Claude's behavior |
| `--no-memory` | Disable auto-memory for this session | When testing fresh behavior |
| `--version` | Show Claude Code version | `claude --version` |

### Config Commands

```bash
# List all configuration
claude config list

# Set global preference
claude config set --global preferredNotifChannel terminal

# Set project-level preference
claude config set model claude-opus-4-20250514

# View current model
claude config get model
```

### Maintenance Commands

```bash
# Check Claude Code health and diagnose issues
claude doctor

# Update Claude Code to the latest version
claude update

# View version info
claude --version

# Clear all cached data
claude cache clear
```

### MCP Plugin Commands

```bash
# List installed plugins
claude mcp list

# Add a plugin (project-scoped by default)
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Add a plugin globally
claude mcp add --scope user playwright -- npx @anthropic-ai/playwright-mcp-server

# Remove a plugin
claude mcp remove context7

# Plugins can also be installed from claude settings UI
# Run: claude → /permissions or check .claude/settings.json
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

### Part 1: Scaffold a Project with Claude Code

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

### Part 2: Explore Advanced Features

1. **Session resume:** Close your terminal mid-task. Reopen and run `claude --resume`. Verify that context is restored.

2. **Memory:** Tell Claude "Remember: this project uses tabs, not spaces." Close the session, start a new one, and ask Claude to create a file. Does it use tabs?

3. **Custom command:** Create `.claude/commands/scaffold-endpoint.md` that takes an endpoint name as `$ARGUMENTS` and generates a route handler, service, and test file. Test it with `/scaffold-endpoint users`.

4. **One-shot mode:** Use `claude -p` to generate a TypeScript interface from the command line without entering interactive mode.

5. **Status bar monitoring:** During a long task, watch the `ctx` percentage in the status bar. When it passes 50%, use `/compact` and notice how it drops.

**Reflect:**
- How many iterations did it take to get a working project?
- What did Claude Code get right on the first try? What needed correction?
- How did session resume and memory affect your workflow?
- Which advanced features would you use daily?

---

## See Also

- [Module 17: Setting Up Claude Code for Your Project](/modules/claude-code-project-setup) — CLAUDE.md configuration, hooks, permissions setup, and MCP server configuration
- [Module 5: Prompt Engineering for Developers](/modules/05-prompt-engineering-for-developers) — Writing effective prompts for AI tools
- [Module 6: Agentic Workflows and Orchestration](/modules/06-agentic-workflows-and-orchestration) — Advanced agentic patterns and multi-step workflows
