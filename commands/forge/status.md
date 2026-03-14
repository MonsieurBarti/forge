---
name: forge:status
description: Show a session orientation dashboard with project, phase, cost, and context status
argument-hint: "[project-id]"
allowed-tools: Read, Bash
---

<objective>
Display a rich session orientation dashboard showing the current project, milestone, phase,
task summary, context window usage, session cost, accumulated phase cost, estimated remaining
cost, and a suggested next action. This is the quickest way to understand where you are and
what to do next.
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
1. Run the status command (pass project-id argument if provided, otherwise auto-detect):
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" status $ARGUMENTS
```

2. Parse the JSON output and format it as a human-readable dashboard with these sections:

**Project & Milestone**
- Project: {project.title} ({project.id})
- Milestone: {milestone.title} ({milestone.id}) -- or "None" if null

**Current Phase**
- Phase: {phase.title} ({phase.id}) [{phase.status}]
- Tasks: {tasks.total} total -- {tasks.done} done, {tasks.ready} ready, {tasks.in_progress} in progress, {tasks.blocked} blocked

**Context & Cost**
- Context window: {context_percent}% used -- or "unavailable" if null (show _notes.bridge if present)
- Session cost: ${session_cost_usd} -- or "unavailable" if null
- Phase cost (accumulated): ${phase_cost_usd} -- or "not tracked" if null
- Estimated remaining: ${estimated_remaining_usd} -- or "unknown" if null

**Next Action**
- {suggested_action}

3. If the command returns an error with code NO_PROJECT, tell the user:
   "No project found. Run `/forge:new` to create one."
</execution_context>
