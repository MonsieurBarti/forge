---
name: forge:add-tests
description: Generate tests for completed phases based on acceptance criteria and implementation
argument-hint: "[phase-number-or-id] [additional instructions]"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, AskUserQuestion
---

<objective>
Generate unit and E2E tests for a completed phase. Reads task beads and their acceptance criteria,
analyzes implementation files, classifies them for testing, and generates tests with atomic commits.

Output: Test files committed with message `test(phase-N): add tests from forge:add-tests`
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the add-tests workflow from @~/.claude/forge/workflows/add-tests.md end-to-end.

When resolving the phase (step 1), use forge-tools:
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project
node "$HOME/.claude/forge/bin/forge-tools.cjs" phase-context <phase-id>
```

When loading task acceptance criteria (step 2), query phase children:
```bash
bd children <phase-id> --json
```

Each task bead has `acceptance_criteria` and optionally `notes` with implementation details.
Use the dependency graph (`bd dep list <task-id> --type validates`) to trace which
requirements each task covers.

When spawning verification agents for parallel test generation (step 5), use
**forge-tester** agents. For single-task phases, generate tests inline.

Resolve the model for tester agents:
```bash
MODEL=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" resolve-model forge-tester --raw)
```

After test generation, update task beads with test file references:
```bash
bd update <task-id> --notes="Tests: <test-file-paths>"
```
</execution_context>
