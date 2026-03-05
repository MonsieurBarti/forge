---
name: forge:quick
description: Execute a quick task with Forge guarantees (atomic commits, state tracking) but skip optional agents
argument-hint: "[--full] [--discuss] <task description>"
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, Agent, AskUserQuestion
---

<objective>
Execute small, ad-hoc tasks with Forge guarantees (atomic commits, bead-backed state tracking).

Quick mode is the same system with a shorter path:
- Creates a quick task bead labeled `forge:quick` under the project
- Spawns forge-planner (quick mode) + forge-executor(s)
- Skips research and roadmap ceremony

**Default:** Skips research, discussion, plan-checker, verifier. Use when you know exactly what to do.

**`--discuss` flag:** Lightweight discussion phase before planning. Surfaces assumptions, clarifies gray areas, captures decisions in the task bead notes. Use when the task has ambiguity worth resolving upfront.

**`--full` flag:** Enables plan-checking (max 2 iterations) and post-execution verification. Use when you want quality guarantees without full milestone ceremony.

Flags are composable: `--discuss --full` gives discussion + plan-checking + verification.
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the quick workflow from @~/.claude/forge/workflows/quick.md end-to-end.

When spawning the planner (step 4), use the Agent tool to spawn **forge-planner** with quick mode constraints (1-3 tasks, no research phase).

When spawning executors (step 6), use the Agent tool to spawn **forge-executor** agents. For single-task plans, execute inline without spawning an agent.

When verifying (step 7, --full only), spawn a **forge-verifier** agent.
</execution_context>
