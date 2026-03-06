# Prompt Engineering for Developers

## Learning Objectives

By the end of this module, you will be able to:

- Explain why prompt engineering matters specifically for developer tools
- Construct effective prompts using the Context-Instruction-Constraints-Examples (CICE) framework
- Apply advanced techniques like few-shot examples, chain-of-thought, and role assignment
- Manage context loading to maximize AI output quality
- Iteratively refine AI output through targeted follow-up prompts
- Avoid the most common prompt anti-patterns
- Write tool-specific prompts optimized for Copilot and Claude Code

---

## Why Prompt Engineering Matters for Developers

Every interaction with an AI coding tool is a prompt. Whether you are writing a comment for Copilot to complete, typing a request in Copilot Chat, or describing a task to Claude Code, the quality of your input directly determines the quality of the output.

The difference between a vague prompt and a well-crafted one is often the difference between:
- Code that works vs. code that almost works
- 1 iteration vs. 5 iterations to get the right result
- AI-generated code you can trust vs. code you need to rewrite

**The 10x multiplier:** A developer who writes good prompts gets 10x more value from AI tools than one who does not. This is the single highest-leverage skill you can develop for AI-assisted development.

---

## Anatomy of a Good Prompt: The CICE Framework

Every effective prompt contains four elements, in varying proportions depending on the task:

### Context

What does the AI need to know about the situation?

```
CONTEXT: I am working on a Node.js Express API that uses Prisma ORM
with PostgreSQL. The project follows a service-repository pattern.
Authentication uses JWT tokens stored in HTTP-only cookies.
```

### Instruction

What exactly do you want the AI to do?

```
INSTRUCTION: Create a middleware function that validates the JWT token
from the cookie, extracts the user ID, and attaches the user object
to the request.
```

### Constraints

What rules, limitations, or requirements must the output follow?

```
CONSTRAINTS:
- Use the existing JwtService from src/services/jwt.service.ts
- Follow the project's error handling pattern (throw AppError)
- The middleware must handle expired tokens by returning 401
- Do not use any additional npm packages
- TypeScript with strict types
```

### Examples

What does good output look like?

```
EXAMPLE: The existing rateLimiter middleware in src/middleware/rateLimiter.ts
is a good reference for the pattern and style to follow.
```

### Putting It Together

```
I am working on a Node.js Express API with Prisma and PostgreSQL.
Authentication uses JWT tokens stored in HTTP-only cookies.

Create a middleware function that validates the JWT token from the cookie,
extracts the user ID, and attaches the user object to the request.

Requirements:
- Use the existing JwtService from src/services/jwt.service.ts
- Follow the project's error handling pattern (throw AppError)
- Handle expired tokens by returning 401 with { error: "Token expired" }
- Handle missing tokens by returning 401 with { error: "Authentication required" }
- TypeScript with strict types
- Follow the pattern in src/middleware/rateLimiter.ts for style reference
```

---

## Core Techniques

### Technique 1: Few-Shot Examples

Providing examples of desired input/output pairs dramatically improves AI accuracy. This works because LLMs learn patterns from examples even within a single prompt.

**Without examples (ambiguous):**
```
Write a function that formats a phone number.
```

**With few-shot examples (unambiguous):**
```
Write a function that formats a US phone number.

Input/Output examples:
  "1234567890"     -> "(123) 456-7890"
  "123-456-7890"   -> "(123) 456-7890"
  "11234567890"    -> "+1 (123) 456-7890"
  "(123) 456-7890" -> "(123) 456-7890"
  "123456"         -> throw InvalidPhoneNumberError

Handle all of these input formats and normalize to the standard format shown.
```

### Technique 2: Step-by-Step Instructions

For complex tasks, breaking the instruction into numbered steps prevents the AI from skipping logic or taking shortcuts.

```
Implement a user registration flow with these steps:

1. Validate the input (email format, password strength, name not empty)
2. Check if the email is already registered (query the database)
3. Hash the password using bcrypt with 12 rounds
4. Create the user record in the database
5. Generate an email verification token (random 32-byte hex string)
6. Store the token in the verification_tokens table with 24h expiry
7. Send the verification email using the EmailService
8. Return the user object (without password hash) and a 201 status
9. If any step fails, ensure no partial data is left in the database (use a transaction)
```

### Technique 3: Role Assignment

Telling the AI to adopt a specific role primes it to think from that perspective.

```
You are a senior security engineer reviewing this authentication module.
Analyze the code in src/auth/ for:
1. OWASP Top 10 vulnerabilities
2. Token handling weaknesses
3. Session management issues
4. Input validation gaps

For each finding, provide:
- Severity (Critical/High/Medium/Low)
- The specific code location
- Why it is a vulnerability
- The recommended fix with a code example
```

### Technique 4: Chain-of-Thought Prompting

Ask the AI to think through the problem before generating code. This produces better solutions for complex logic.

```
I need to implement a rate limiter using the sliding window algorithm.

Before writing code:
1. Explain how the sliding window algorithm works
2. Identify the data structure needed to track requests
3. Describe the logic for checking if a request should be allowed
4. Consider edge cases (concurrent requests, clock skew, memory limits)

Then implement the rate limiter as an Express middleware with
Redis as the backing store.
```

### Technique 5: Negative Examples (What NOT to Do)

Sometimes telling the AI what to avoid is as important as telling it what to do.

```
Implement a SQL query builder for the search endpoint.

Do NOT:
- Use string concatenation to build SQL (SQL injection risk)
- Use SELECT * (explicitly list columns)
- Ignore pagination (always include LIMIT/OFFSET)
- Return raw database errors to the client

DO:
- Use parameterized queries
- Add input validation for all search parameters
- Log the generated SQL at debug level
- Include total count for pagination metadata
```

### Technique 6: Prompt Caching Awareness

When working with API-based tools (or tools that use APIs under the hood), structuring your prompts with **static content first** (system instructions, tool definitions, few-shot examples) and **variable content last** (the specific user query) can take advantage of prompt caching. This can dramatically reduce latency and cost -- up to 90% cost reduction and 85% latency reduction with Anthropic's prompt caching, for example. Even when using tools like Claude Code or Copilot (which handle caching internally), understanding this principle helps you structure CLAUDE.md files and custom instructions effectively.

### Technique 7: Output Format Specification

When you need structured output, specify the exact format.

```
Analyze the performance characteristics of this database query.

Return your analysis in this format:

## Query Analysis
- **Estimated Complexity**: O(?) with explanation
- **Index Usage**: Which indexes are/should be used
- **Bottlenecks**: Specific operations that are slow and why

## Recommendations
1. [Change] - [Expected improvement] - [Trade-off]
2. ...

## Optimized Query
```sql
-- The improved query here
```​
```

---

## Context Loading: What to Include

The context you provide is the foundation of AI output quality. Here is a framework for deciding what to include.

### Always Include

| Context Type | Why | Example |
|-------------|-----|---------|
| Tech stack | So the AI generates compatible code | "TypeScript 5.x, Express 4, Prisma 5" |
| File paths | So the AI knows where things are | "The handler is in src/routes/users.ts" |
| Relevant types | So the AI produces type-correct code | "Use the User type from src/types/models.ts" |
| Error patterns | So the AI follows your conventions | "Throw AppError with status code and message" |
| Existing patterns | So the AI matches your style | "Follow the pattern in src/services/auth.ts" |

### Include When Relevant

| Context Type | When | Example |
|-------------|------|---------|
| Database schema | Working with data layer | "Users table has columns: id, email, name, role" |
| API contracts | Working with endpoints | "Response format: { data, error, meta }" |
| Business rules | Logic-heavy tasks | "Users with role 'admin' bypass rate limits" |
| Performance requirements | Optimization tasks | "Endpoint must respond in <200ms at p99" |
| Security requirements | Auth/security work | "All PII must be encrypted at rest" |

### Omit (Usually)

| Context Type | Why | Alternative |
|-------------|-----|------------|
| Unrelated code | Wastes context window, confuses AI | Reference specific files instead |
| Full git history | Too much noise | Mention relevant recent changes |
| Build configuration | Rarely relevant to code logic | Include only if directly related |
| Personal preferences | Unless they affect the code | Put in CLAUDE.md for persistence |

---

## Iterative Refinement

The best prompting workflow is iterative. Think of it as a conversation, not a one-shot request.

### The Refinement Loop

```
Attempt 1: Initial prompt
  -> Review output
  -> Identify what is wrong or missing

Attempt 2: Targeted correction
  "Good, but the error handling is missing. Add try-catch blocks
   around the database calls and return 500 for unexpected errors."
  -> Review output
  -> Identify remaining issues

Attempt 3: Fine-tuning
  "The logic is correct but the function is too long.
   Extract the validation logic into a separate validateInput function."
  -> Review and accept
```

### Effective Follow-Up Prompts

**Be specific about what to change:**
```
# Bad: "Make it better"
# Good: "The validateEmail function should also reject emails with
#        plus-addressing (e.g., user+tag@example.com)"
```

**Reference the previous output:**
```
"In the createUser function you just generated, the password hashing
 is synchronous. Change it to use bcrypt.hash (async) instead of
 bcrypt.hashSync."
```

**Ask for alternatives:**
```
"This works, but the nested if-else is hard to read.
 Can you rewrite it using early returns?"
```

**Expand on a specific section:**
```
"The error handling looks good. Now add logging for each error case
 using the project's Winston logger with appropriate log levels."
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: The Vague Request

```
# Bad
Write a function to process data.

# Why it fails: "Process" means nothing. "Data" means nothing.
# The AI will guess, and it will guess wrong.

# Good
Write a TypeScript function that takes an array of Transaction objects
and returns the total amount grouped by currency code. Handle empty
arrays by returning an empty Record.
```

### Anti-Pattern 2: Over-Constraining

```
# Bad (too many constraints, conflicting requirements)
Write a function that is fast, uses no external libraries, handles
every possible edge case, is fewer than 10 lines, has full JSDoc,
supports both sync and async modes, works in Node and the browser,
and is fully type-safe with generics.

# Why it fails: Contradictory constraints make it impossible.
# Some of these trade off against each other.

# Good: Prioritize your constraints
Write a TypeScript function that groups array items by a key.
Must be type-safe with generics. Prioritize readability over brevity.
```

### Anti-Pattern 3: No Context

```
# Bad
Fix the bug.

# Why it fails: What bug? In what file? What are the symptoms?

# Good
The /api/users endpoint returns an empty array even when there are
users in the database. The handler is in src/routes/users.ts and
the service is in src/services/user.service.ts. The database query
in the service looks correct. Help me trace the issue.
```

### Anti-Pattern 4: Prompt Dumping

```
# Bad: Pasting 500 lines of code with "fix this"

# Why it fails: The AI does not know what is wrong or what you expect.

# Good: Paste the relevant 20 lines with context
Here is the authentication middleware (lines 45-65 of src/middleware/auth.ts):
[paste specific code]

This middleware should extract the JWT from the Authorization header
and validate it. But it is always returning 401 even for valid tokens.
The JWT secret is in process.env.JWT_SECRET.
```

### Anti-Pattern 5: Not Iterating

```
# Bad workflow:
1. Write a prompt
2. Accept whatever comes back
3. Move on (even if it is not quite right)

# Good workflow:
1. Write a prompt
2. Review the output critically
3. Identify gaps or errors
4. Refine with specific follow-up instructions
5. Repeat until the code meets your standards
```

### Anti-Pattern 6: Asking the AI to Guess Your Preferences

```
# Bad
Write this in the way I would write it.

# Good
Write this following these conventions:
- 2-space indentation
- Single quotes for strings
- Arrow functions over function declarations
- Explicit return types on all exported functions
- No abbreviations in variable names
```

---

## IDE-Specific Prompting Tips

### For GitHub Copilot

**Tab Completion:**
- Write detailed function signatures before the body
- Use JSDoc/docstring comments above functions
- Keep related files open in tabs for broader context
- Type the first line of the implementation to guide direction

```typescript
/**
 * Validates a credit card number using the Luhn algorithm.
 *
 * @param cardNumber - The card number as a string (digits only, no spaces)
 * @returns true if the card number passes the Luhn check
 * @throws InvalidCardError if the input contains non-digit characters
 *
 * @example
 * isValidCard("4532015112830366") // true
 * isValidCard("1234567890123456") // false
 */
function isValidCard(cardNumber: string): boolean {
  // Copilot now has excellent context to generate the implementation
```

**Copilot Chat:**
- Use `/explain`, `/fix`, `/tests` commands for structured interactions
- Select specific code before asking questions about it
- Use `@workspace` for project-level questions
- Keep prompts under 500 words for best results in chat

### For Claude Code

**Conversational prompts:**
- Start with the big picture, then narrow down
- Reference file paths explicitly
- Ask Claude Code to read relevant files before making changes
- Use iterative refinement across multiple messages

```
> I am adding rate limiting to the API. The project uses Express with
  TypeScript and Redis for caching.
>
> First, read the existing middleware in src/middleware/ to understand
  the patterns. Then read the Redis configuration in src/config/redis.ts.
>
> After you understand the patterns, create a rate limiter middleware that:
> - Limits requests per IP address using a sliding window
> - Uses Redis for distributed state
> - Supports configurable limits per route
> - Returns 429 with a Retry-After header when limit is exceeded
> - Follows the same patterns as the existing middleware
```

**Multi-step task prompts:**
```
> Let us implement this in phases:
>
> Phase 1: Create the rate limiter middleware and its tests
> Phase 2: Add rate limiting to the auth routes (stricter limits)
> Phase 3: Add rate limiting to the API routes (standard limits)
> Phase 4: Run all tests and fix any failures
>
> Start with Phase 1.
```

---

## Advanced: Prompt Templates for Common Tasks

### Bug Fix Template

```
## Bug Report
**File:** [path to file]
**Symptom:** [what happens]
**Expected:** [what should happen]
**Reproduction:** [steps or conditions]
**Relevant context:** [related files, recent changes, error messages]

Please:
1. Read the relevant files
2. Identify the root cause
3. Explain why the bug occurs
4. Provide a fix
5. Suggest a test case that would catch this bug
```

### Feature Implementation Template

```
## Feature: [name]
**User story:** As a [role], I want to [action], so that [benefit].

**Requirements:**
1. [Specific requirement]
2. [Another requirement]

**Technical constraints:**
- [Technology/pattern requirements]
- [Performance requirements]
- [Security requirements]

**Files to create/modify:**
- [file path] - [what changes]

**Reference:** [existing patterns or files to follow]

**Tests:** [specific scenarios to test]
```

### Code Review Template

```
Review the following code for:
1. **Correctness:** Does it do what it claims?
2. **Security:** Any vulnerabilities?
3. **Performance:** Any obvious bottlenecks?
4. **Maintainability:** Is it readable and well-structured?
5. **Edge cases:** What inputs could break it?

For each finding:
- Severity: Critical / High / Medium / Low
- Location: Specific line or block
- Issue: What is wrong
- Fix: How to resolve it
```

---

## Exercise

### Prompt Engineering Workshop

**Goal:** Write prompts for 5 different scenarios, execute them with your AI tool of choice, and compare output quality across prompt iterations.

**Setup:** Have both Copilot (in VS Code) and Claude Code (in terminal) available.

**Scenario 1: Data Transformation Function**
Write a prompt to generate a function that converts a flat array of objects with `parentId` fields into a nested tree structure.
- First attempt: Write a minimal prompt
- Second attempt: Apply the CICE framework
- Compare the outputs

**Scenario 2: Error Handling Middleware**
Write a prompt to generate Express error handling middleware that:
- Catches all errors
- Logs them with stack traces
- Returns appropriate HTTP status codes
- Hides internal details in production
- Uses few-shot examples in your prompt

**Scenario 3: Database Query Optimization**
Write a prompt providing a slow SQL query and asking for optimization.
- Include the table schema
- Include sample data characteristics (1M rows, etc.)
- Include current execution time
- Use the chain-of-thought technique

**Scenario 4: API Client Generation**
Write a prompt to generate a typed API client from an OpenAPI spec.
- Include the spec (or a portion)
- Specify the output format
- Use the role assignment technique ("You are a TypeScript API tooling expert")

**Scenario 5: Migration Script**
Write a prompt to generate a database migration that adds a new feature.
- Include the current schema
- Specify the desired end state
- Include data migration requirements
- Use step-by-step instructions

**For each scenario, record:**
1. Your initial prompt (before CICE)
2. Your improved prompt (after CICE)
3. AI output for each version
4. Time spent on prompt vs. time spent fixing output
5. Which technique (few-shot, chain-of-thought, etc.) helped most

**Reflection:**
- Which technique had the biggest impact on output quality?
- How did prompt length correlate with output quality?
- Was there a point of diminishing returns for prompt detail?
- Which scenarios benefited most from iterative refinement?
