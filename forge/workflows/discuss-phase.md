<purpose>
Extract implementation decisions that downstream agents need. Analyze the phase to identify gray areas, let the user choose what to discuss, then deep-dive each selected area until satisfied.

You are a thinking partner, not an interviewer. The user is the visionary -- you are the builder. Capture decisions that will guide research and planning, not figure out implementation yourself.
</purpose>

<downstream_awareness>
**Phase context feeds into:**

1. **forge-researcher** -- Reads phase notes to know WHAT to research
2. **forge-planner** -- Reads phase notes to know WHAT decisions are locked

Capture decisions clearly enough that downstream agents can act on them without asking the user again. Do NOT figure out HOW to implement -- that's what research and planning do.
</downstream_awareness>

<philosophy>
**User = founder/visionary. Claude = builder.**

The user knows: how they imagine it working, what it should look/feel like, what's essential vs nice-to-have, specific behaviors or references.

The user doesn't know (don't ask): codebase patterns, technical risks, implementation approach, success metrics.

Ask about vision and implementation choices. Capture decisions for downstream agents.
</philosophy>

<scope_guardrail>
**CRITICAL: No scope creep.**

The phase boundary comes from the project roadmap and is FIXED. Discussion clarifies HOW to implement what's scoped, never WHETHER to add new capabilities.

**Allowed:** "How should posts be displayed?" / "What happens on empty state?" / "Pull to refresh or manual?"

**Not allowed:** "Should we also add comments?" / "What about search/filtering?" (new capabilities)

**Heuristic:** Does this clarify how we implement what's in the phase, or add a new capability that could be its own phase?

**When user suggests scope creep:**
```
"[Feature X] would be a new capability -- that's its own phase.
Want me to note it for the roadmap backlog?

For now, let's focus on [phase domain]."
```

Capture deferred ideas in a "Deferred Ideas" section.
</scope_guardrail>

<gray_area_identification>
Gray areas are **implementation decisions the user cares about** -- things that could go multiple ways and would change the result.

**How to identify:**

1. Read the phase goal from the phase bead description
2. Understand the domain:
   - Something users SEE -> visual presentation, interactions, states
   - Something users CALL -> interface contracts, responses, errors
   - Something users RUN -> invocation, output, behavior modes
   - Something users READ -> structure, tone, depth, flow
   - Something being ORGANIZED -> criteria, grouping, handling exceptions
3. Generate phase-specific gray areas -- concrete decisions for THIS phase, not generic categories

```
Phase: "User authentication" -> Session handling, Error responses, Multi-device policy, Recovery flow
Phase: "CLI for database backups" -> Output format, Flag design, Progress reporting, Error recovery
```

**Key question:** What decisions would change the outcome that the user should weigh in on?

**Claude handles (don't ask):** Technical implementation, architecture, performance, scope.
</gray_area_identification>

<process>

<step name="resolve_phase" priority="first">
Phase number or ID from argument (required).

```bash
PROJECT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project)
```

Extract the project ID, then:
```bash
CONTEXT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" project-context-slim <project-id>)
```

Match the phase number to the ordered list of phases. If a phase ID was given directly, use it.

**If phase not found:**
```
Phase [X] not found in project.

Use /forge:progress to see available phases.
```
Exit workflow.

**If phase found:** Extract phase ID, title, description. Continue to check_existing.
</step>

<step name="check_existing">
Check if phase already has context notes:

```bash
bd show <phase-id> --json
```

Check the `notes` field. **If notes exist and contain structured context:**
Use AskUserQuestion:
- header: "Context"
- question: "Phase [X] already has context notes. What do you want to do?"
- options: "Update it" / "View it" / "Skip"

If "Update": Load existing, continue to analyze_phase
If "View": Display notes, then offer update/skip
If "Skip": Exit workflow

**If no context notes exist:**

Check if phase has children (tasks already planned):
```bash
bd children <phase-id> --json
```

**If tasks exist:**
Use AskUserQuestion:
- header: "Plans exist"
- question: "Phase [X] already has tasks created without user context. Your decisions here won't affect existing tasks unless you replan."
- options: "Continue and replan after" / "View existing tasks" / "Cancel"

If "Continue and replan after": Continue to load_prior_context.
If "View existing tasks": Display tasks, then offer "Continue" / "Cancel".
If "Cancel": Exit workflow.

**If no tasks exist:** Continue to load_prior_context.
</step>

<step name="load_prior_context">
Read project-level and prior phase context to avoid re-asking decided questions.

> Reuse PROJECT and CONTEXT from resolve_phase — do NOT re-call find-project or project-context-slim.

**Step 1: Read project bead**
```bash
bd show <project-id> --json
```

Extract: description (vision, principles), design (scope/constraints), notes (approach decisions).

**Step 2: Read all prior phase notes**

From the CONTEXT output, for each phase before the current one, read the `notes` field for locked preferences and decisions.

**Step 3: Build internal prior_decisions context**

```
## Project-Level
- [Key principle or constraint from project bead]

## From Prior Phases
### Phase N: [Name]
- [Decision that may be relevant to current phase]
```

**Usage in subsequent steps:**
- `analyze_phase`: Skip gray areas already decided
- `present_gray_areas`: Annotate options with prior decisions
- `discuss_areas`: Pre-fill answers or flag conflicts

**If no prior context exists:** Continue without -- expected for early phases.
</step>

<step name="scout_codebase">
Lightweight scan of existing code to inform gray area identification.

```bash
ls src/ app/ lib/ 2>/dev/null
```

Extract key terms from the phase goal and search for related files:
```bash
grep -rl "{term1}\|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -10
ls src/components/ src/hooks/ src/lib/ src/utils/ 2>/dev/null
```

Read the 3-5 most relevant files to understand existing patterns.

Build internal codebase_context identifying: reusable assets, established patterns, integration points, creative options the architecture enables or constrains. This is NOT persisted -- session only.
</step>

<step name="analyze_phase">
Analyze the phase using both prior_decisions and codebase_context.

1. **Domain boundary** -- What capability is this phase delivering?
2. **Check prior decisions** -- Skip gray areas already decided in prior phases
3. **Gray areas by category** -- For each relevant category, identify 1-2 specific ambiguities. Annotate with code context where relevant.
4. **Skip assessment** -- If no meaningful gray areas exist (pure infrastructure, clear-cut, or all decided), the phase may not need discussion.
</step>

<step name="present_gray_areas">
State the boundary and any prior decisions, then present gray areas.

```
Phase [X]: [Name]
Domain: [What this phase delivers]

We'll clarify HOW to implement this.
(New capabilities belong in other phases.)

[If prior decisions apply:]
**Carrying forward from earlier phases:**
- [Decision from Phase N that applies here]
```

Use AskUserQuestion (multiSelect: true):
- header: "Discuss"
- question: "Which areas do you want to discuss for [phase name]?"
- options: 3-4 phase-specific gray areas with concrete labels and 1-2 question descriptions

Annotate with prior decisions ("You decided X in Phase N -- revisit or keep?") and code context ("You already have a Card component with shadow/rounded variants") where applicable.

**Do NOT include a "skip" or "you decide" option.** User ran this command to discuss -- give them real choices.
</step>

<step name="discuss_areas">
For each selected area, conduct a focused discussion loop.

**Philosophy: 4 questions, then check.**

**For each area:**

1. Announce: `Let's talk about [Area].`

2. Ask 4 questions using AskUserQuestion:
   - header: "[Area]" (max 12 chars)
   - question: Specific decision
   - options: 2-3 concrete choices (AskUserQuestion adds "Other" automatically)
   - Annotate options with code context when relevant
   - Include "You decide" when reasonable
   - Use context7 tools only when library-specific knowledge improves options

3. After 4 questions, check:
   - "More questions about [area], or move to next?"
   - Options: "More questions" / "Next area"
   - If "More questions" -> ask 4 more, then check again
   - If "Other" (free text) -> interpret intent

4. After all selected areas complete:
   - Summarize captured decisions
   - AskUserQuestion: "We've discussed [list areas]. Which gray areas remain unclear?"
   - Options: "Explore more gray areas" / "I'm ready for context"
   - If "Explore more": identify 2-4 additional gray areas, loop back
   - If "I'm ready for context": Proceed to write_context

**Question design:** Options should be concrete, not abstract. Each answer should inform the next question. If user picks "Other", ask follow-up as plain text, confirm, then resume AskUserQuestion.

**Scope creep handling:**
```
"[Feature] sounds like a new capability -- that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```
</step>

<step name="write_context">
Store structured context on the phase bead.

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning

## Phase Boundary
[Clear statement of what this phase delivers]

## Implementation Decisions
### [Category 1]
- [Decision captured]

### Claude's Discretion
[Areas where user said "you decide"]

## Existing Code Insights
### Reusable Assets
- [Component/hook/utility]: [How it could be used]

### Established Patterns
- [Pattern]: [How it constrains/enables this phase]

### Integration Points
- [Where new code connects]

## Specific Ideas
[References, examples, "I want it like X" moments]

## Deferred Ideas
[Ideas that came up but belong in other phases]
```

**Store on the phase bead:**
```bash
bd update <phase-id> --notes "<context block>"
```

If deferred ideas reference new capabilities, optionally create beads:
```bash
bd create --title="Deferred: <idea>" --type=feature --priority=3
bd dep add <new-id> <project-id> --type=parent-child
```
</step>

<step name="confirm_creation">
Present summary and next steps:

```
## Decisions Captured
### [Category]
- [Key decision]

[If deferred ideas exist:]
## Noted for Later
- [Deferred idea] -- future phase

---
## Next Up
**Phase [X]: [Name]** -- [Goal]
`/forge:plan [X]`

---
**Also available:**
- Review context: `bd show <phase-id>` (check notes field)
- Edit context manually: `bd update <phase-id> --notes "..."`
```
</step>

</process>

<questioning_reference>
@~/.claude/forge/references/questioning.md
</questioning_reference>

<success_criteria>
- Phase validated against project
- Prior context loaded; already-decided questions not re-asked
- Codebase scouted for reusable assets, patterns, and integration points
- Gray areas identified with code and prior decision annotations
- User selected which areas to discuss
- Each selected area explored until user satisfied
- Scope creep redirected to deferred ideas
- Phase bead notes capture actual decisions, not vague vision
- Deferred ideas preserved
- User knows next steps
</success_criteria>
</output>
