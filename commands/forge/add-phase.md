---
name: forge:add-phase
description: Add a new phase to the end of the project roadmap under a milestone
argument-hint: <milestone-id> <description>
allowed-tools: Bash, AskUserQuestion
---

<objective>
Add a new phase to the end of the current project's phase list under the specified milestone.
Creates a phase epic bead with proper parent-child link to the milestone and ordering dependencies.
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>

## 1. Parse Arguments

The first argument is the milestone-id, the rest is the phase description.
Example: `/forge:add-phase forgeflow-m1 Add authentication system`

If no arguments or missing milestone-id provided:
```
ERROR: milestone-id and phase description required
Usage: /forge:add-phase <milestone-id> <description>
Example: /forge:add-phase forgeflow-m1 Add authentication system
```
Exit.

## 2. Find the Project

```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project
```

If no project found:
```
ERROR: No Forge project found.
Run /forge:new to initialize a project first.
```
Exit.

## 3. Add the Phase

```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" add-phase <project-id> <milestone-id> <description>
```

This handles:
- Validating the milestone exists and is not closed
- Determining the next phase number (max existing + 1)
- Creating the phase epic bead with `forge:phase` label
- Wiring `parent-child` dependency to the milestone
- Wiring `blocks` dependency to the last existing phase under the milestone (ordering)

## 4. Show Result

Display a summary:
```
Phase N added to milestone <milestone-id>:
- Title: Phase N: <description>
- Bead: <phase-id>
- Total phases: <count>

Next steps:
- /forge:plan N — plan this phase
- /forge:add-phase <milestone-id> <description> — add another phase
- /forge:progress — see full roadmap
```

</execution_context>
