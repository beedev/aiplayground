# GitHub Copilot Essentials

> **Official Documentation:** [GitHub Copilot Docs](https://docs.github.com/en/copilot) -- GitHub's official documentation contains the most up-to-date information on features, pricing, and configuration. Refer to it for the latest changes.

## Learning Objectives

By the end of this module, you will be able to:

- Explain how GitHub Copilot works and what models power it
- Install and configure Copilot in VS Code with optimal settings
- Use tab completion effectively to accelerate your coding flow
- Write comments and code patterns that produce better Copilot suggestions
- Leverage Copilot Chat for explanations, test generation, and debugging
- Use Agent Mode for autonomous multi-file editing and task execution
- Assign issues to Copilot's Coding Agent for asynchronous pull request generation
- Use Copilot CLI as a terminal-native AI coding assistant
- Apply best practices that maximize Copilot's usefulness while avoiding common traps

---

## What Is GitHub Copilot?

GitHub Copilot is an AI-powered code completion tool developed by GitHub in partnership with OpenAI. It integrates directly into your IDE and provides real-time code suggestions as you type.

### How It Works Under the Hood

```
You Type Code/Comments
        |
        v
  Copilot Extension captures context:
  - Current file content
  - Open tabs (neighboring files)
  - File name and language
  - Cursor position
        |
        v
  Context sent to GitHub's servers
        |
        v
  AI model (GPT-4o, Claude, or Gemini based on user choice) generates completions
        |
        v
  Suggestions displayed as ghost text in your editor
```

Key architectural details:
- **Model:** Copilot supports multiple models that users can choose in settings, including GPT-4o, Claude Sonnet, Gemini, and others. The default is "Auto" mode, which picks the best model for each prompt. Originally powered exclusively by OpenAI Codex, Copilot is now a multi-model platform. Premium models consume "premium requests" from your plan's monthly allowance at varying multiplier rates
- **Context:** Copilot sends the content of your current file plus snippets from open tabs to generate suggestions
- **Latency:** Suggestions typically appear within 100-500ms of pausing your typing
- **Privacy:** Your code is sent to GitHub's servers for processing. Enterprise plans offer additional data controls.

### Copilot Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Copilot Free** | Free | Limited completions and chat per month |
| **Copilot Pro** | Paid (check current pricing) | Unlimited completions, chat, coding agent access, premium request allowance |
| **Copilot Pro+** | Paid (check current pricing) | Higher premium request allowance, full access to all models |
| **Copilot Business** | Paid per user (check current pricing) | Organization management, policy controls |
| **Copilot Enterprise** | Paid per user (check current pricing) | Enterprise-grade features, knowledge bases (requires GitHub Enterprise Cloud) |

---

## Setup: VS Code Extension

### Installation

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows/Linux)
3. Search for "GitHub Copilot"
4. Install the **GitHub Copilot** extension (GitHub is consolidating Copilot and Copilot Chat into a single unified extension -- install whichever is currently listed)

### Authentication

```
1. After installing, you will see a GitHub sign-in prompt
2. Click "Sign in to GitHub"
3. Authorize the Copilot extension in your browser
4. Return to VS Code -- you should see the Copilot icon in the status bar
```

### Recommended Settings

Open VS Code settings (Cmd+, or Ctrl+,) and search for "copilot":

```json
{
  // Enable Copilot for all languages (or specify individual ones)
  "github.copilot.enable": {
    "*": true,
    "markdown": true,
    "yaml": true,
    "plaintext": false
  },

  // Show inline suggestions automatically
  "editor.inlineSuggest.enabled": true,

  // Number of alternative suggestions to generate
  "github.copilot.advanced": {
    "listCount": 3
  }
}
```

### Verifying It Works

Create a new file called `test.js` and type:

```javascript
// A function that calculates the fibonacci sequence
function fib
```

After a brief pause, you should see ghost text appearing with a complete implementation. If you see it, Copilot is working.

---

## Tab Completion: The Core Workflow

Tab completion is Copilot's primary interaction mode. You type, Copilot suggests, and you accept or reject.

### Key Shortcuts

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Accept suggestion | `Tab` | `Tab` |
| Reject suggestion | `Esc` | `Esc` |
| Accept next word only | `Cmd+Right Arrow` | `Ctrl+Right Arrow` |
| See alternative suggestions | `Alt+]` (next) / `Alt+[` (prev) | `Alt+]` / `Alt+[` |
| Open Copilot completions panel | `Ctrl+Enter` | `Ctrl+Enter` |

### Triggering Better Suggestions

Copilot responds to **signals** in your code. The more signals you provide, the better the suggestions.

**Signal 1: Function signatures**

```typescript
// Poor signal -- Copilot has little to work with
function process(data) {

// Strong signal -- types, naming, and parameter names guide the suggestion
function calculateMonthlyRevenue(transactions: Transaction[], month: number, year: number): number {
```

**Signal 2: Comments as intent declarations**

```python
# Calculate the average rating, excluding reviews with fewer than 3 words
def calculate_average_rating(reviews: list[Review]) -> float:
    # Copilot will now generate code that filters short reviews
```

**Signal 3: Preceding code patterns**

```javascript
// If Copilot sees this pattern...
const firstName = user.first_name || '';
const lastName = user.last_name || '';

// ...it will likely suggest this for the next line:
const email = user.email || '';
```

**Signal 4: File context and imports**

```python
# These imports tell Copilot what libraries you are using
from datetime import datetime, timedelta
from collections import defaultdict
import pandas as pd

# Copilot will now suggest pandas-based solutions
def aggregate_daily_sales(df: pd.DataFrame) -> pd.DataFrame:
```

### The Accept-Partial Technique

You do not have to accept an entire suggestion. Use `Cmd+Right Arrow` (Mac) to accept one word at a time. This is useful when the first part of a suggestion is correct but the rest diverges from what you want.

```javascript
// Copilot suggests: const result = data.filter(item => item.active).map(item => item.name);
// You only want the filter part
// Press Cmd+Right Arrow repeatedly to accept: const result = data.filter(item => item.active)
// Then type your own .map() or other continuation
```

---

## Inline Suggestions: Patterns That Work

### Pattern 1: The Comment-First Pattern

Write a descriptive comment, then let Copilot generate the implementation.

```typescript
// Validate that the email address has a valid format,
// contains exactly one @ symbol, and has a domain with at least one dot
function validateEmail(email: string): boolean {
  // Copilot generates a complete regex-based validation
}
```

### Pattern 2: The Example-Driven Pattern

Provide one or two examples, and Copilot will infer the pattern.

```python
def format_currency(amount: float, currency: str) -> str:
    """
    Examples:
        format_currency(1234.5, "USD") -> "$1,234.50"
        format_currency(1234.5, "EUR") -> "EUR 1,234.50"
        format_currency(1234.5, "GBP") -> "GBP 1,234.50"
    """
    # Copilot now has clear examples to match
```

### Pattern 3: The Type-Signature Pattern

In typed languages, detailed type signatures are some of the strongest signals.

```typescript
interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// With this interface defined, Copilot can generate pagination logic accurately
function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResponse<T> {
```

### Pattern 4: The Test-First Pattern

Write a test, then switch to the implementation file. Copilot uses open tabs as context.

```javascript
// In your test file (keep this tab open):
describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
  it('removes special characters', () => {
    expect(slugify('hello! @world#')).toBe('hello-world');
  });
});

// Now in your implementation file, Copilot has seen your expected behavior
function slugify(text) {
  // Copilot generates code matching the test expectations
}
```

---

## Copilot Chat: Interactive AI Assistance

Copilot Chat provides a conversational interface within your IDE. Open it with `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I`.

### Chat Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/explain` | Explain selected code | Select a function, type `/explain` |
| `/tests` | Generate tests for selected code | Select a class, type `/tests` |
| `/fix` | Fix a problem in selected code | Select buggy code, type `/fix` |
| `/doc` | Generate documentation | Select a function, type `/doc` |
| `@workspace` | Ask about the entire workspace | `@workspace where is the auth middleware?` |
| `@terminal` | Ask about terminal output | `@terminal explain this error` |

### Effective Chat Prompts

**Vague prompt (poor results):**
```
How do I fix this?
```

**Specific prompt (good results):**
```
This Express middleware is supposed to validate JWT tokens but returns 401
for valid tokens. The token is passed in the Authorization header as
"Bearer <token>". Can you identify why the validation fails and suggest a fix?
```

**Prompt with constraints:**
```
Generate unit tests for the UserService class using Jest.
Cover these scenarios:
1. Creating a user with valid data
2. Creating a user with duplicate email (should throw)
3. Fetching a user that does not exist (should return null)
Use the existing TestDatabase helper from __tests__/helpers.ts
```

### Chat Context: What Copilot Chat Can See

Copilot Chat has access to:
- The file you currently have open
- Code you have selected/highlighted
- Your workspace file structure (with `@workspace`)
- Terminal output (with `@terminal`)
- Open editor tabs

It does **not** have:
- Your full git history
- Runtime state or environment variables
- External documentation unless you paste it in
- Files you have not opened

---

## Copilot in the IDE: Quick Actions

### Explain Code

1. Select a block of code
2. Right-click and choose "Copilot > Explain This"
3. Copilot Chat opens with an explanation

This is especially useful for:
- Understanding legacy code you inherited
- Decoding complex regex patterns
- Reading unfamiliar framework patterns

### Generate Tests

1. Select a function or class
2. Right-click and choose "Copilot > Generate Tests"
3. Copilot generates a test file with multiple test cases

**Tip:** Review generated tests carefully. Copilot tends to test the happy path well but may miss edge cases like:
- Null/undefined inputs
- Empty arrays or strings
- Concurrent access
- Boundary values (0, -1, MAX_INT)

### Fix Errors

1. When you see a red squiggly (error), hover over it
2. Click "Quick Fix" and look for the Copilot suggestion
3. Copilot proposes a fix with an explanation

### Inline Chat (Cmd+I)

Press `Cmd+I` (Mac) or `Ctrl+I` (Windows/Linux) to open inline chat at your cursor position. This is useful for:

```typescript
// Place cursor here, press Cmd+I, and type:
// "Add error handling for network failures with retry logic"

async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Copilot will transform the function in place with try/catch and retry
```

---

## Copilot Agent Mode: Deep Dive

Agent Mode is Copilot's most powerful IDE capability. It transforms Copilot from a suggestion tool into an autonomous coding agent that can plan, execute, and iterate on complex tasks -- all within VS Code.

### What Agent Mode Can Do

- **Autonomously edit multiple files** across your project in a single operation
- **Run terminal commands** -- install dependencies, run tests, execute build scripts, start servers
- **Iterate on failures** -- if a test fails, Agent Mode reads the error, fixes the code, and re-runs the test automatically
- **Plan and execute multi-step workflows** with reasoning about dependencies between changes
- **Use MCP tools** -- connect to external services via Model Context Protocol servers (databases, APIs, design tools)
- **Install extensions** -- Agent Mode can suggest and use VS Code extensions as tools during execution

### Activating Agent Mode

1. Open Copilot Chat panel in VS Code
2. At the top of the chat view, find the mode dropdown
3. Select **"Agent"** (instead of "Ask" or "Edit")
4. Type your task description and press Enter

Agent Mode is also available when you use `Cmd+I` (inline chat) -- look for the Agent toggle.

### How Agent Mode Thinks

Agent Mode follows a structured approach:

```
1. UNDERSTAND -- Parses your request and identifies what needs to change
2. PLAN -- Creates an internal plan of files to modify and commands to run
3. EXECUTE -- Makes changes across files, runs commands
4. VALIDATE -- Checks results (test output, build errors, linter warnings)
5. ITERATE -- If something fails, analyzes the error and tries again
```

This loop continues until the task succeeds or Agent Mode determines it needs your input.

### Example Workflows

**Adding a feature across multiple files:**
```
"Add a rate limiter middleware to the Express app. Use express-rate-limit,
configure it to allow 100 requests per 15 minutes per IP, and apply it
to all API routes. Add tests for the rate limiting behavior."

Agent Mode will:
1. Install express-rate-limit via npm
2. Create the middleware file
3. Import and apply it in the Express app
4. Write integration tests
5. Run tests to verify
```

**Debugging a complex issue:**
```
"The /api/users endpoint returns 500 when the database has users with
null email addresses. Find the root cause and fix it. Run the tests
to make sure nothing else breaks."

Agent Mode will:
1. Read the route handler and related service code
2. Identify the null check issue
3. Fix the code with proper null handling
4. Run the test suite
5. Fix any cascading test failures
```

**Refactoring with confidence:**
```
"Migrate all class components in src/components/ to functional components
with hooks. Preserve all existing behavior and make sure tests still pass."

Agent Mode will:
1. Scan all class components
2. Convert each one to functional equivalent
3. Replace lifecycle methods with useEffect
4. Replace this.state with useState
5. Run tests after each conversion
```

### MCP (Model Context Protocol) in Agent Mode

Agent Mode supports MCP servers, which let it connect to external tools and services:

```json
// .vscode/mcp.json -- configure MCP servers for your project
{
  "servers": {
    "database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```

With MCP servers configured, Agent Mode can:
- Query your database schema to generate accurate models
- Read design files to implement pixel-perfect UI
- Access external APIs for real-time data during development

### Agent Mode vs. Traditional Copilot

| Aspect | Traditional Copilot | Agent Mode |
|--------|-------------------|------------|
| **Scope** | Current file, line-by-line | Multi-file, project-wide |
| **Autonomy** | Suggests completions you accept/reject | Plans, executes, and iterates autonomously |
| **Terminal** | Read-only (via @terminal) | Full execution -- installs packages, runs tests |
| **Iteration** | Manual -- you fix errors yourself | Automatic fix-and-retry loops |
| **MCP Tools** | Not available | Connects to databases, APIs, external services |
| **Planning** | No planning capability | Creates and follows multi-step execution plans |
| **Best for** | Writing code line by line | Medium-to-complex multi-file tasks |
| **Model choice** | Single completion model | Can leverage different models per task |

### When to Use Agent Mode vs. Tab Completion

**Use Tab Completion when:**
- Writing code in a single file
- You know what you want and just need speed
- The task is straightforward (implementing a function, writing a test)
- You want fine-grained control over every line

**Use Agent Mode when:**
- The task spans multiple files
- You need terminal commands (install, build, test) as part of the workflow
- You want Copilot to iterate on failures automatically
- The task has clear success criteria (tests pass, builds succeed)
- You are onboarding to a codebase and want AI-guided exploration

### Tips for Effective Agent Mode Usage

1. **Be specific about success criteria** -- "Run the test suite and make sure all tests pass" gives Agent Mode a clear validation target
2. **Start with smaller tasks** -- Build trust by giving Agent Mode manageable tasks before complex refactors
3. **Review the plan** -- Agent Mode shows you what it intends to do. Review before approving execution
4. **Use @workspace context** -- Reference specific files or patterns: "Follow the pattern in src/middleware/auth.ts"
5. **Set boundaries** -- "Only modify files in src/components/, don't touch tests" prevents unintended changes

---

## Copilot Coding Agent: Asynchronous AI Development

The Copilot Coding Agent is a fundamentally different capability from Agent Mode. While Agent Mode works synchronously in your IDE, the Coding Agent operates asynchronously on GitHub's infrastructure -- you assign it work and come back to review a pull request.

### How It Works

```
1. You assign a GitHub Issue to Copilot (or @mention it)
        |
        v
2. Copilot spins up a secure cloud environment (via GitHub Actions)
        |
        v
3. It reads the issue, explores the codebase, creates a plan
        |
        v
4. It writes code, runs tests, fixes errors -- autonomously
        |
        v
5. It opens a draft Pull Request with all changes
        |
        v
6. You review the PR like any other -- approve, request changes, or close
```

### Triggering the Coding Agent

**From GitHub Issues:**
- Open an issue and assign `@copilot` as the assignee
- Or comment `@copilot` on an existing issue with instructions

**From VS Code:**
- Use `copilot /delegate "task description"` to offload work to the cloud agent
- Continue working locally while the agent works in the background

**From Jira / Azure Boards / Linear:**
- Copilot integrates with external project management tools
- Assign tasks to Copilot directly from your issue tracker

**From Slack / Microsoft Teams:**
- Assign tasks to Copilot from chat conversations
- Context from conversation links and decisions flows into the task

### What the Coding Agent Can Do

- **Implement features** -- from well-described issues to working code with tests
- **Fix bugs** -- reads error reports, traces root causes, applies fixes
- **Write tests** -- generates comprehensive test suites for existing code
- **Refactor code** -- applies patterns, removes duplication, modernizes syntax
- **Update documentation** -- syncs docs with code changes
- **Prototype solutions** -- rapidly explore approaches for complex problems
- **Triage issues** -- analyze bug reports and provide initial assessment

### What It Cannot Do (Yet)

- Access external services or APIs not in the repository
- Run long-lived servers or interactive processes
- Make deployment decisions or push to production
- Access private packages that require special authentication
- Handle tasks requiring visual inspection (UI testing)

### Security and Oversight

Every action the Coding Agent takes is auditable:

- **Secure environment** -- runs in an isolated GitHub Actions container
- **Code scanning** -- generated code is analyzed by GitHub's security tools (secret detection, code scanning, supply chain security)
- **Full transparency** -- every command run and file changed is visible in the PR
- **Human review required** -- the agent creates draft PRs, never merges directly
- **Firewall rules** -- enterprise admins can restrict which repositories and actions the agent can access

### Centralized Dashboard

GitHub provides a mission-control dashboard for Coding Agent activity:

- View all active and completed agent tasks across repositories
- Monitor progress in real-time
- Steer or cancel agent tasks mid-execution
- Track premium request consumption and Actions minutes usage
- Set budget thresholds and spending alerts

### Writing Good Issues for the Coding Agent

The Coding Agent's output quality depends heavily on issue quality:

**Poor issue (vague, no context):**
```
Fix the login bug
```

**Good issue (specific, with context):**
```markdown
## Bug: Login fails for users with special characters in password

**Steps to reproduce:**
1. Create account with password containing `&` or `<`
2. Try to log in
3. Get 500 error

**Expected:** Login succeeds
**Actual:** Server returns 500 Internal Server Error

**Relevant files:**
- src/auth/login.ts (password handling)
- src/utils/sanitize.ts (input sanitization)

**Root cause hypothesis:**
The password is being HTML-escaped before hashing, causing the hash
comparison to fail. The sanitization in sanitize.ts should not apply
to password fields.

**Acceptance criteria:**
- [ ] Users can log in with special characters in passwords
- [ ] Existing tests still pass
- [ ] Add new test cases for special character passwords
```

### Coding Agent vs. Agent Mode

| Aspect | Agent Mode (VS Code) | Coding Agent (GitHub) |
|--------|---------------------|----------------------|
| **Where it runs** | Your local machine, in VS Code | GitHub's cloud (Actions runner) |
| **Interaction** | Synchronous -- you watch and guide | Asynchronous -- assign and review later |
| **Trigger** | Chat prompt in VS Code | Issue assignment, @mention, /delegate |
| **Output** | Direct file changes in your editor | Draft Pull Request |
| **Duration** | Minutes (interactive session) | Minutes to hours (background) |
| **Best for** | Interactive development, exploration | Well-defined tasks, parallel work |
| **Review** | Live in editor | Standard PR review workflow |
| **Billing** | Premium requests only | Premium requests + Actions minutes |

### When to Use the Coding Agent

- **Parallel productivity** -- assign routine tasks while you focus on complex work
- **Issue triage** -- let Copilot analyze and prototype fixes for bug reports
- **Documentation updates** -- assign doc sync tasks after feature changes
- **Test coverage** -- generate comprehensive tests for untested modules
- **Onboarding PRs** -- let new team members see AI-generated PRs as learning examples

---

## Copilot CLI: Terminal-Native AI Assistant

Copilot CLI brings the full power of AI-assisted development directly to your terminal. It functions as both a chatbot and an autonomous coding partner, capable of planning, editing files, running commands, and even delegating work to cloud agents.

### Installation and Setup

Copilot CLI is available to all paid Copilot subscribers. Install it via GitHub's official distribution:

```bash
# Check available commands after installation
copilot -h

# Get help on specific topics
copilot help config
copilot help commands
copilot help permissions
```

### Core Commands

#### Planning and Exploration

| Command | Purpose |
|---------|---------|
| `/plan [task]` | Create a structured implementation plan with checkboxes |
| `Shift+Tab` | Toggle between normal and plan mode |
| `Ctrl+y` | View/edit the current plan in your default Markdown editor |
| `/context` | Visualize token usage breakdown |
| `/clear` or `/new` | Start a fresh session (use between unrelated tasks) |
| `/compact` | Manually trigger context compaction |
| `/help` | Display CLI help |
| `/usage` | View usage statistics |

#### Model Selection

```bash
# Switch models during a session
/model

# Available models:
# - Claude Opus 4.5 (default) -- most capable, complex architecture and debugging
# - Claude Sonnet 4.5 -- fast and cost-effective for daily coding
# - GPT-5.2 Codex -- strong code generation, good for straightforward tasks
```

| Model | Best For | Trade-off |
|-------|----------|-----------|
| **Claude Opus 4.5** | Complex architecture, difficult debugging, nuanced refactoring | Uses more premium requests |
| **Claude Sonnet 4.5** | Day-to-day coding, routine tasks, quick iterations | Fast, cost-effective |
| **GPT-5.2 Codex** | Code generation, code review, straightforward work | Good second opinion |

#### Session Management

```bash
# View current session info
/session

# List context compaction checkpoints
/session checkpoints

# View a specific checkpoint
/session checkpoints 3

# View temporary artifacts
/session files

# Display the current implementation plan
/session plan
```

Sessions persist automatically with intelligent context compaction. Session data is stored at `~/.copilot/session-state/{session-id}/` and includes:
- `events.jsonl` -- full conversation history
- `workspace.yaml` -- session metadata
- `plan.md` -- current implementation plan
- `checkpoints/` -- context compaction snapshots
- `files/` -- persistent artifacts

#### Delegation and Parallel Execution

```bash
# Offload a task to the cloud Coding Agent
/delegate "Write comprehensive tests for the auth module"

# Break a task into parallel subtasks
/fleet "Update all API endpoints to use the new error format"

# Conduct a code review
/review
```

**When to use `/delegate`:**
- Tangential tasks that would break your flow
- Documentation updates
- Test generation for separate modules
- Refactoring that does not depend on your current work

**Keep working locally for:**
- Core feature development
- Interactive debugging
- Tasks requiring your real-time judgment

#### Multi-Repository Work

```bash
# Add access to additional repositories
/add-dir /path/to/another-repo

# View and manage allowed directories
/list-dirs

# Or start from a parent directory containing multiple repos
cd ~/projects && copilot
```

#### Tool and Permission Management

```bash
# Clear all previously approved tools
/reset-allowed-tools

# Pre-configure permissions via CLI flags
copilot --allow-tool 'shell(git:*)' --deny-tool 'shell(git push)'

# Common permission patterns:
# shell(git:*)           -- All Git commands
# shell(npm run:*)       -- All npm scripts
# shell(npm run test:*)  -- npm test commands only
# write                  -- File write access
```

### Configuration: Custom Instructions

Copilot CLI automatically reads custom instructions from these locations (highest to lowest priority):

| Location | Scope |
|----------|-------|
| `.github/copilot-instructions.md` | Repository-specific |
| `.github/instructions/**/*.instructions.md` | Modular repository instructions |
| `AGENTS.md` | Repository agent behavior |
| `Copilot.md`, `GEMINI.md`, `CODEX.md` | Repository (alternative names) |
| `~/.copilot/copilot-instructions.md` | Global (all sessions) |

**Example `.github/copilot-instructions.md`:**

```markdown
## Build Commands
- `npm run build` - Build the project
- `npm run test` - Run all tests
- `npm run lint:fix` - Fix linting issues

## Code Style
- Use TypeScript strict mode
- Prefer functional components over class components
- Always add JSDoc comments for public APIs

## Workflow
- Run `npm run lint:fix && npm test` after changes
- Commit messages follow conventional commits format
- Create feature branches from `main`
```

### Practical CLI Workflows

**Codebase onboarding:**
```
> How is logging configured in this project?
> What's the pattern for adding a new API endpoint?
> Explain the authentication flow
```

**Plan-first development (recommended for complex tasks):**
```
> /plan Add a WebSocket notification system to the Express app

# Review the generated plan (opens in your editor)
Ctrl+y

# Approve and execute
> Looks good, implement this plan

# Copilot executes step by step, running tests along the way
```

**Test-driven development:**
```
> Write failing tests for a new calculateTax function that handles
  US state tax rates, exemptions, and rounding to nearest cent.
  Do NOT write the implementation yet.

# Review the tests, then:
> Now implement calculateTax to make all tests pass
```

**Bug investigation:**
```
> The API returns 500 on /api/orders when the cart is empty.
  Search the codebase and logs to identify the root cause.
```

**Git operations:**
```
> What changes went into version 2.3.0?
> Create a PR for this branch with detailed description
> Rebase this branch against main and resolve conflicts
```

**Migration checklists:**
```
> Run the linter and write all errors to migration-checklist.md
  as a checklist. Then fix each issue one by one, checking them
  off as you go.
```

### Copilot CLI vs. Claude Code

Both are terminal-native AI coding assistants with agentic capabilities. Here is how they compare:

| Aspect | Copilot CLI | Claude Code |
|--------|-------------|-------------|
| **Provider** | GitHub / Microsoft | Anthropic |
| **Default model** | Claude Opus 4.5 (multi-model) | Claude Opus 4 (Anthropic models) |
| **Config file** | `.github/copilot-instructions.md` | `CLAUDE.md` (hierarchical) |
| **Cloud delegation** | `/delegate` (Coding Agent) | Not available |
| **Parallel tasks** | `/fleet` command | Sub-agents / worktrees |
| **MCP support** | Via VS Code MCP config | Native CLI MCP support |
| **Session management** | Automatic with checkpoints | Resume, headless, one-shot modes |
| **Billing** | Premium requests + Actions minutes | API usage or subscription |
| **Best integration** | GitHub ecosystem (Issues, PRs, Actions) | Any codebase, any platform |
| **Plan mode** | `/plan` with Shift+Tab toggle | `/plan` in CLI |

**When to use which:**
- Use **Copilot CLI** when your workflow is GitHub-centric (Issues, PRs, Actions) and you want cloud delegation
- Use **Claude Code** when you want deep codebase understanding, hierarchical project config, and platform independence
- Use **both** -- they complement each other well for different tasks

---

## Best Practices

### 1. Use Meaningful Variable and Function Names

Copilot reads your code. Descriptive names produce dramatically better suggestions.

```javascript
// Bad -- Copilot has no idea what this does
function fn(a, b) {

// Good -- Copilot understands the intent
function mergeUserPreferences(defaults, overrides) {
```

### 2. Write Comments Before Complex Logic

```python
# Sort transactions by date descending, then group by merchant,
# and calculate the running total for each merchant
def analyze_spending(transactions):
```

### 3. Keep Related Files Open in Tabs

Copilot uses open tabs as context. If you are working on a service, keep the model, interface, and test files open.

### 4. Start with the Interface

Define types, interfaces, or function signatures first. Then let Copilot fill in the implementation.

```typescript
// Define the contract first
interface CacheOptions {
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'fifo' | 'lfu';
}

interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V, options?: Partial<CacheOptions>): void;
  delete(key: K): boolean;
  clear(): void;
  size(): number;
}

// Now Copilot can generate an implementation that matches the interface
class InMemoryCache<K, V> implements Cache<K, V> {
```

### 5. Use the Copilot Completions Panel

Press `Ctrl+Enter` to see up to 10 alternative suggestions. The first suggestion is not always the best one.

### 6. Reject and Redirect

If Copilot starts going in the wrong direction, press `Esc`, type a few characters to redirect, and let it try again. A small nudge often produces dramatically different results.

### 7. Do Not Fight Copilot

If Copilot repeatedly suggests something different from what you want, it may be picking up a pattern from your codebase. Consider:
- Is the existing pattern actually better than what you had in mind?
- Are there conflicting signals in your code?
- Should you add a comment to clarify your intent?

### 8. Review Security-Sensitive Code Extra Carefully

Copilot can suggest code with security vulnerabilities:
- Hardcoded secrets or API keys
- SQL injection vulnerabilities
- Missing input validation
- Insecure cryptographic patterns

Always review security-sensitive code with the same rigor you would apply to a PR from an external contributor.

### 9. Use Custom Instructions for Team Consistency

Set up `.github/copilot-instructions.md` in your repository with:
- Build and test commands
- Code style conventions
- Architecture decisions and patterns
- Required checks before committing

This ensures every team member gets suggestions aligned with your project's standards.

### 10. Choose the Right Copilot Mode for the Task

| Task Type | Recommended Mode |
|-----------|-----------------|
| Writing a single function | Tab completion |
| Understanding unfamiliar code | Copilot Chat (`/explain`) |
| Quick fix for a type error | Inline Chat (`Cmd+I`) |
| Multi-file feature implementation | Agent Mode |
| Well-defined issue, want to work on something else | Coding Agent |
| Terminal-native development, planning | Copilot CLI |

---

## Copilot Limitations

Understanding limitations helps you use the tool more effectively.

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| Limited context window | Cannot see your entire codebase | Keep relevant files open in tabs |
| No runtime awareness | Does not know your data shapes at runtime | Provide type annotations |
| Training data cutoff | May not know newest APIs/libraries | Verify suggestions against current docs |
| No project-level understanding | Treats each file somewhat independently | Use `@workspace` in chat for project questions |
| Repetitive patterns | May repeat the same incorrect suggestion | Redirect with a few characters or a comment |
| Language bias | Better at popular languages (JS/TS/Python) | More careful review needed for niche languages |
| Agent Mode scope | Can over-reach on large refactors | Set clear boundaries in your prompt |
| Coding Agent latency | Minutes to complete, not instant | Use for background tasks, not urgent fixes |

---

## Keyboard Shortcut Reference

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| Accept suggestion | `Tab` | `Tab` |
| Dismiss suggestion | `Esc` | `Esc` |
| Next suggestion | `Alt+]` | `Alt+]` |
| Previous suggestion | `Alt+[` | `Alt+[` |
| Accept word | `Cmd+Right` | `Ctrl+Right` |
| Open completions panel | `Ctrl+Enter` | `Ctrl+Enter` |
| Open Copilot Chat | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Inline Chat | `Cmd+I` | `Ctrl+I` |

---

## Exercise

### Build a Utility Module with Copilot

**Goal:** Use Copilot's different modes (tab completion, chat, Agent Mode, CLI) to build a complete utility module with tests.

**Task:** Create a `dateUtils.ts` module with these functions:

```typescript
// 1. Format a date as "January 5, 2025"
formatDate(date: Date): string

// 2. Get relative time string ("2 hours ago", "in 3 days")
relativeTime(date: Date): string

// 3. Check if a date is a business day (Mon-Fri, not a US federal holiday)
isBusinessDay(date: Date): boolean

// 4. Get the next N business days from a start date
getNextBusinessDays(startDate: Date, count: number): Date[]

// 5. Calculate business days between two dates
businessDaysBetween(start: Date, end: Date): number
```

**Steps:**

1. **Create the type signatures first** (type them manually). Notice how Copilot starts suggesting implementations as soon as you define the function signature.

2. **Use tab completion** to generate the implementation for `formatDate` and `relativeTime`. Accept or modify Copilot's suggestions.

3. **Use Copilot Chat** (`/tests`) to generate a test file. Review the generated tests -- are there missing edge cases?

4. **Use inline chat** (`Cmd+I`) on the `isBusinessDay` function to add holiday support. Type something like: "Add support for US federal holidays (New Year's, MLK Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas)."

5. **Try Agent Mode:** Switch to Agent Mode and ask it to "Add timezone support to all date utility functions using the Intl API. Update the tests accordingly." Watch how it edits multiple files and runs tests.

6. **Try Copilot CLI:** Open your terminal and run `copilot`. Ask it to review your dateUtils module: "Review dateUtils.ts for edge cases I might have missed. Check for DST handling, leap year issues, and timezone problems."

7. **Compare approaches:**
   - Which mode was most efficient for which task?
   - Did Agent Mode handle the multi-file change cleanly?
   - Were the generated tests comprehensive, or did you need to add edge cases?

**Bonus:** Assign a GitHub Issue to `@copilot`: "Add a `parseNaturalDate` function to dateUtils.ts that handles inputs like 'next Tuesday', 'last Friday', '3 days from now'." Review the PR it creates.

---

## See Also

- **Module 3: Claude Code Essentials** -- for a deep dive into Claude Code's features and capabilities
- **Module 4: Copilot vs Claude Code** -- for detailed comparison and when to use which
- **Module 17: Claude Code Project Setup** -- for configuring AI-assisted development in your projects
