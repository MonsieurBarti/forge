---
name: forge:research-phase
description: Research how to implement a phase (standalone - usually use /forge:plan instead)
argument-hint: "[phase-number-or-id]"
allowed-tools: Read, Bash, Grep, Glob, Agent, AskUserQuestion, WebFetch, WebSearch
---

<objective>
Research how to implement a phase. Spawns forge-researcher agent with phase context to investigate
libraries, architecture patterns, pitfalls, and standard approaches for the phase's domain.

**Note:** This is a standalone research command. For most workflows, use `/forge:plan` which
integrates research automatically (step 3).

**Use this command when:**
- You want to research without planning yet
- You want to re-research after planning is complete
- You need to investigate before deciding if a phase is feasible
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the research-phase workflow from @~/.claude/forge/workflows/research-phase.md end-to-end.

When spawning the researcher (step 4), use the Agent tool to spawn the **forge-researcher** agent.
Pass it the phase title, goal, project context, and any relevant codebase pointers.
The researcher writes findings as a comment on the phase bead.

After the researcher returns (step 5), create or update a research bead under the phase
with label `forge:research`, storing the findings in the bead's notes field.
</execution_context>
