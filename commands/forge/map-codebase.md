---
name: forge:map-codebase
description: Analyze codebase with parallel mapper agents to produce .forge/codebase/ documents
argument-hint: "[optional: specific area to map, e.g., 'api' or 'auth']"
allowed-tools: Read, Bash, Glob, Grep, Write, Agent
---

<objective>
Analyze existing codebase using parallel forge-codebase-mapper agents to produce structured analysis documents.

Each mapper agent explores a focus area and writes documents directly to `.forge/codebase/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: .forge/codebase/ folder with 7 structured documents about the codebase state.
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the map-codebase workflow from @~/.claude/forge/workflows/map-codebase.md end-to-end.

Resolve the model for mapper agents:
```bash
MODEL=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" resolve-model forge-codebase-mapper --raw)
```

When spawning mapper agents (step 3), use the Agent tool with `subagent_type="forge-codebase-mapper"` and `run_in_background=true` for parallel execution. Pass `model` if non-empty.

Spawn 4 parallel forge-codebase-mapper agents:
- Agent 1: tech focus -> writes STACK.md, INTEGRATIONS.md
- Agent 2: arch focus -> writes ARCHITECTURE.md, STRUCTURE.md
- Agent 3: quality focus -> writes CONVENTIONS.md, TESTING.md
- Agent 4: concerns focus -> writes CONCERNS.md

Pass the focus area argument (if any) to each agent so they can prioritize a specific subsystem.

After all agents complete, verify documents exist with line counts. Do NOT read document contents back -- the agents wrote them directly.
</execution_context>
</output>
