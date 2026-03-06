---
name: forge:discuss-phase
description: Gather phase context through adaptive questioning before planning
argument-hint: "<phase-number-or-id>"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
  - Agent
  - mcp__plugin_context7_context7__resolve-library-id
  - mcp__plugin_context7_context7__query-docs
---

<objective>
Extract implementation decisions that downstream agents need -- researcher and planner will use phase context to know what to investigate and what choices are locked.

**How it works:**
1. Load project context and prior phase decisions from beads
2. Scout codebase for reusable assets and patterns
3. Analyze phase -- skip gray areas already decided in prior phases
4. Present remaining gray areas -- user selects which to discuss
5. Deep-dive each selected area until satisfied
6. Store structured context on the phase bead via `bd update <phase-id> --notes`

**Output:** Structured context on the phase bead -- decisions clear enough that downstream agents can act without asking the user again
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the discuss-phase workflow from @~/.claude/forge/workflows/discuss-phase.md end-to-end.

Phase argument: $ARGUMENTS (phase number or bead ID, required).

Context is resolved via `forge-tools.cjs` commands (find-project, project-context, phase-context).
Discussion output is stored on the phase bead via `bd update <phase-id> --notes`.
</execution_context>

<process>
1. Validate phase (error if missing or not found)
2. Check if phase already has context notes (offer update/view/skip)
3. **Load prior context** -- Read project bead and all prior phase bead notes
4. **Scout codebase** -- Find reusable assets, patterns, and integration points
5. **Analyze phase** -- Check prior decisions, skip already-decided areas, generate remaining gray areas
6. **Present gray areas** -- Multi-select: which to discuss? Annotate with prior decisions + code context
7. **Deep-dive each area** -- 4 questions per area, code-informed options, Context7 for library choices
8. **Store context** -- Write structured decisions to phase bead notes
9. Offer next steps (plan the phase)

**CRITICAL: Scope guardrail**
- Phase boundary from the roadmap is FIXED
- Discussion clarifies HOW to implement, not WHETHER to add more
- If user suggests new capabilities: "That's its own phase. I'll note it for later."
- Capture deferred ideas -- don't lose them, don't act on them
</process>

<success_criteria>
- Prior context loaded and applied (no re-asking decided questions)
- Gray areas identified through intelligent analysis
- User chose which areas to discuss
- Each selected area explored until satisfied
- Scope creep redirected to deferred ideas
- Phase bead notes capture decisions, not vague vision
- User knows next steps
</success_criteria>
