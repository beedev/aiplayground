# AI-Assisted Development Foundations

## Learning Objectives

By the end of this module, you will be able to:

- Define AI-assisted development and explain how it differs from traditional coding
- Describe how Large Language Models work at a conceptual level
- Identify the major AI coding tools and their positioning in the landscape
- Apply the correct mental model for working with AI as a development partner
- Recognize when AI assistance adds value versus when manual coding is more appropriate
- Avoid the most common pitfalls that trip up developers new to AI tools

---

## What Is AI-Assisted Development?

AI-assisted development is the practice of using machine learning models -- primarily Large Language Models (LLMs) -- to augment your software development workflow. This includes code generation, code completion, debugging, documentation, testing, refactoring, and architectural reasoning.

The key word is **assisted**. You remain the engineer. The AI is a force multiplier that can dramatically accelerate your work, but it operates under your direction, judgment, and review.

### What It Is Not

- **Not a replacement for understanding code.** If you cannot read and evaluate what the AI produces, you cannot use it effectively.
- **Not an autopilot.** AI tools produce suggestions. You decide what to accept, modify, or reject.
- **Not magic.** LLMs are statistical models. They are sophisticated pattern matchers trained on vast corpora of text and code, not sentient beings that "understand" your codebase.

---

## How LLMs Work (Developer's Perspective)

You do not need a PhD in machine learning to use AI coding tools, but understanding the basics helps you predict AI behavior, craft better prompts, and debug unexpected outputs.

### Transformers: The Architecture

Modern LLMs are built on the **Transformer** architecture (introduced in the 2017 paper "Attention Is All You Need"). The core innovation is the **attention mechanism**, which allows the model to weigh the relevance of every part of its input when generating each token of output.

```
Input Text --> Tokenizer --> Embedding --> Transformer Layers --> Output Probabilities --> Next Token
                                              ^
                                              |
                                     Self-Attention Mechanism
                                     (weighs relevance of all
                                      input tokens to each other)
```

For developers, the practical implication is: **the model considers the entire context window when generating each token**. The more relevant context you provide, the better the output.

### Tokens: The Unit of AI Communication

LLMs do not process text character by character or word by word. They process **tokens** -- sub-word units that typically represent 3-4 characters in English.

```python
# Approximate token counts (varies by model/tokenizer)
"hello"           # 1 token
"function"        # 1 token
"getUserById"     # 3-4 tokens (get, User, By, Id)
"const x = 42;"   # ~5 tokens

# A typical source file of 200 lines might be 1,500-3,000 tokens
```

**Why this matters:**
- Every model has a **context window** -- the maximum number of tokens it can process at once (input + output combined)
- Claude models support 200K tokens of context, GPT-4 supports 128K
- Longer context means the model can "see" more of your codebase at once
- Token usage directly affects cost and latency

### Context Windows: Your Working Memory Budget

Think of the context window as a shared whiteboard between you and the AI. Everything on the whiteboard -- your instructions, code snippets, conversation history, the AI's responses -- counts toward the limit.

| Model | Context Window | Approximate Lines of Code |
|-------|---------------|--------------------------|
| GPT-4o | 128K tokens | ~30,000 lines |
| Claude Sonnet 4.6 / Opus 4.6 | 200K tokens (1M in beta) | ~50,000 lines |
| Gemini 2.5 Pro | 1M+ tokens | ~250,000 lines |

**Practical tip:** Just because a model *can* accept 200K tokens does not mean you should dump your entire codebase into it. Focused, relevant context produces better results than raw volume.

### How Code Generation Actually Works

When an LLM generates code, it is performing **next-token prediction**. Given all the tokens it has seen so far (your prompt, the conversation, any context), it predicts the most likely next token, appends it, and repeats.

This has important implications:

1. **The model does not "plan" ahead.** It generates left to right, token by token. Complex logic can drift if the model loses track of the overall structure.
2. **The model is probabilistic.** The same prompt can produce different outputs on different runs (controlled by a "temperature" parameter).
3. **The model can be confidently wrong.** It has no mechanism for "I don't know." It will always produce *something*, even if it is fabricated.

---

## The AI Coding Tools Landscape

### Inline Completion Tools

These tools integrate into your IDE and provide real-time code suggestions as you type.

| Tool | Model | Integration | Key Feature |
|------|-------|-------------|-------------|
| **GitHub Copilot** | Multi-model (GPT-4o, Claude Sonnet, Gemini) | VS Code, JetBrains, Neovim, Xcode | Tab completion, chat, Agent Mode |
| **Amazon Q Developer** | Amazon internal | VS Code, JetBrains | AWS-aware suggestions, agentic capabilities |
| **Tabnine** | Various / self-hosted | Most IDEs | On-premise option for enterprises |
| **Supermaven** | Custom model | VS Code, JetBrains | Speed-optimized completions (note: sunsetting after Cursor acquisition; check current status) |

### AI-Powered Editors

These are full IDE replacements or IDE forks with AI deeply integrated into the editing experience.

| Tool | Base | Key Feature |
|------|------|-------------|
| **Cursor** | VS Code fork | Cmd+K editing, codebase-aware chat, multi-file edits |
| **Windsurf** | VS Code fork | Cascade agent for multi-step tasks (now owned by Cognition AI) |
| **Zed** | Custom editor | Built-in AI assistant, collaborative editing |

### CLI / Agentic Tools

These tools operate from the terminal (or as IDE-integrated agents) and can autonomously read, write, and execute code. Note that some tools in the categories above have also gained agentic capabilities -- notably **GitHub Copilot's Agent Mode** in VS Code, which can edit multiple files, run terminal commands, and support MCP servers. GitHub also offers the **Copilot Coding Agent**, an asynchronous agent that works from GitHub Issues to produce pull requests.

| Tool | Vendor | Key Feature |
|------|--------|-------------|
| **Claude Code** | Anthropic | Agentic CLI + VS Code extension, multi-file operations, MCP servers, subagents |
| **Aider** | Open source | Git-aware, diff-based editing |
| **OpenAI Codex CLI** | OpenAI | Terminal-based agentic coding agent (Rust-based, supports cloud environments) |
| **Cline** | Open source | VS Code extension with agentic capabilities |

### How to Think About This Landscape

No single tool does everything well. The most productive developers use a **combination**:

```
Layer 1: Inline completions (Copilot/Supermaven) -- always on, low friction
Layer 2: IDE chat/edit (Cursor Cmd+K, Copilot Chat) -- targeted edits
Layer 3: IDE agentic (Copilot Agent Mode, Cursor Composer) -- multi-file tasks in IDE
Layer 4: Full agentic (Claude Code, Aider) -- complex orchestration, deep reasoning
```

---

## Mental Models for Working with AI

### Mental Model 1: AI as Pair Programmer

The most productive mental model is to treat AI as a **pair programmer** -- a collaborator who is extremely fast at writing code, has read a staggering amount of documentation, but has no judgment, no project context beyond what you provide, and no accountability for the result.

Like any pair partner:
- **Give it context.** Explain what you are building and why.
- **Be specific about constraints.** "Use TypeScript, no external dependencies, must handle null inputs."
- **Review its work.** Never merge AI-generated code you have not read and understood.
- **Course-correct early.** If the first attempt is going in the wrong direction, redirect rather than letting it continue.

### Mental Model 2: The Intern with a Photographic Memory

AI tools have ingested billions of lines of code. They "remember" patterns, APIs, frameworks, and idioms extremely well. But they lack:
- Understanding of your business domain
- Awareness of your team's conventions (unless you tell them)
- The ability to question requirements
- Common sense about what should not be done

### Mental Model 3: Context Is Everything

The single most important factor in AI output quality is the **context** you provide. This includes:

```
1. The prompt itself (your instructions)
2. Surrounding code (what the AI can "see")
3. File names and directory structure
4. Comments and documentation in the codebase
5. Explicit examples of desired output
6. CLAUDE.md or .cursorrules files (persistent instructions)
```

**Poor context:** "Write a function to process data."

**Rich context:** "Write a TypeScript function that takes an array of Transaction objects (see types.ts) and returns the total amount grouped by currency code. Handle empty arrays by returning an empty object. Follow the existing pattern in src/utils/aggregation.ts."

---

## When to Use AI vs. When to Code Manually

### Use AI When

| Scenario | Why AI Helps |
|----------|-------------|
| **Boilerplate code** | Repetitive patterns (CRUD, forms, config) are AI's sweet spot |
| **Exploring unfamiliar APIs** | AI can generate working examples faster than reading docs |
| **Writing tests** | AI excels at generating test cases, especially edge cases |
| **Refactoring** | Renaming, restructuring, converting patterns across files |
| **Documentation** | Generating docstrings, README sections, code comments |
| **Regex and complex syntax** | AI is remarkably good at regex, SQL, and other terse languages |
| **Prototyping** | Quickly generating a working version to validate an approach |

### Code Manually When

| Scenario | Why Manual Is Better |
|----------|---------------------|
| **Critical business logic** | You need to reason through every branch yourself |
| **Security-sensitive code** | Auth, encryption, access control deserve full human attention |
| **Novel algorithms** | AI works from patterns; truly novel problems need human creativity |
| **Performance-critical hot paths** | AI often produces correct but suboptimal code |
| **When you need to learn** | If the goal is understanding, writing it yourself is essential |
| **Small, quick edits** | Typing 2 lines is faster than writing a prompt |

### The 30-Second Rule

If you can write the code faster than you can describe what you want to the AI, just write it. AI tools have overhead -- context switching, prompt crafting, output review. For trivial changes, that overhead is not worth it.

---

## Common Pitfalls and Misconceptions

### Pitfall 1: Accepting Code Without Understanding It

```python
# AI generates this. Do you know what it does?
def process(data):
    return reduce(lambda a, b: {**a, b[0]: a.get(b[0], 0) + b[1]},
                  map(lambda x: (x['category'], x['amount']), data), {})

# If you cannot explain this to a colleague, do not commit it.
# Ask the AI to rewrite it more readably, or write it yourself.
```

### Pitfall 2: Over-Relying on AI for Architecture

AI is excellent at implementing patterns it has seen before. It is poor at evaluating trade-offs for *your specific situation*. Use AI to explore options, but make architectural decisions yourself.

### Pitfall 3: Not Providing Enough Context

The number one reason for poor AI output is insufficient context. If the AI produces something wrong, your first question should be: "Did I give it enough information to succeed?"

### Pitfall 4: Prompt-and-Pray

Some developers write a prompt, accept whatever comes back, and move on. This is the AI equivalent of copy-pasting from Stack Overflow without reading the answer. **Iterative refinement** is how you get good results.

### Pitfall 5: Assuming AI-Generated Code Is Tested

AI-generated code compiles and looks reasonable. It is **not tested** unless you test it. The AI may produce code that handles the happy path perfectly but fails on edge cases, null inputs, or concurrent access.

### Pitfall 6: Ignoring Licensing Concerns

AI models are trained on open-source code. Some organizations have policies about AI-generated code and licensing. Know your organization's stance.

### Pitfall 7: Fighting the Tool Instead of Switching Approaches

If you have spent 10 minutes trying to get the AI to do something and it keeps getting it wrong, stop. Either:
- Rethink your prompt (is the task clearly described?)
- Break the task into smaller pieces
- Write it manually

---

## Best Practices Summary

1. **Start with context.** Describe the goal, constraints, and environment before asking for code.
2. **Be specific.** "Write a function" is worse than "Write a TypeScript function that validates email addresses using a regex, returns a boolean, and handles null input."
3. **Review everything.** Read AI-generated code with the same scrutiny you would apply to a pull request from a junior developer.
4. **Iterate.** The first output is a draft. Refine it through follow-up instructions.
5. **Use the right tool for the job.** Inline completion for flow, chat for questions, agentic tools for complex tasks.
6. **Maintain your skills.** Use AI to go faster, not as a crutch that atrophies your abilities.
7. **Document AI decisions.** When AI makes significant architectural suggestions you adopt, note it for your team.

---

## Exercise

### Hands-On: Your First AI-Assisted Coding Session

**Goal:** Complete the same task with and without AI, then compare the experience.

**Task:** Build a JavaScript utility module called `stringUtils.js` that exports these functions:
- `capitalize(str)` -- capitalizes the first letter of a string
- `slugify(str)` -- converts a string to a URL-friendly slug ("Hello World" -> "hello-world")
- `truncate(str, maxLength, suffix)` -- truncates a string with a suffix (default "...")
- `countWords(str)` -- counts words in a string
- `isPalindrome(str)` -- checks if a string is a palindrome (ignoring case and spaces)

**Part 1: Without AI (15 minutes)**
1. Open your editor with AI tools disabled
2. Implement all five functions from scratch
3. Note how long it takes and any points where you had to look up documentation

**Part 2: With AI (15 minutes)**
1. Enable your AI tools (Copilot, Claude Code, or whichever you have)
2. Implement the same five functions using AI assistance
3. Note which functions the AI helped with most and where it struggled

**Part 3: Compare and Reflect**
Answer these questions in your notes:
- Which approach was faster for each function?
- Did the AI produce any code you would not have written yourself? Was it better or worse?
- Were there any edge cases the AI handled that you missed (or vice versa)?
- Did you fully understand all the AI-generated code before accepting it?
- For which functions was AI most valuable? Least valuable?

**Bonus:** Write unit tests for all five functions using AI assistance. Compare the test cases the AI generates against what you would have written manually.
