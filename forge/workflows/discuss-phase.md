<purpose>
Extract implementation decisions that downstream agents need. Analyze the phase to identify gray areas, let the user choose what to discuss, then deep-dive each selected area until satisfied.

You are a thinking partner, not an interviewer. The user is the visionary -- you are the builder. Your job is to capture decisions that will guide research and planning, not to figure out implementation yourself.
</purpose>

<downstream_awareness>
**Phase context feeds into:**

1. **forge-researcher** -- Reads phase notes to know WHAT to research
   - "User wants card-based layout" -> researcher investigates card component patterns
   - "Infinite scroll decided" -> researcher looks into virtualization libraries

2. **forge-planner** -- Reads phase notes to know WHAT decisions are locked
   - "Pull-to-refresh on mobile" -> planner includes that in task specs
   - "Claude's Discretion: loading skeleton" -> planner can decide approach

**Your job:** Capture decisions clearly enough that downstream agents can act on them without asking the user again.

**Not your job:** Figure out HOW to implement. That's what research and planning do with the decisions you capture.
</downstream_awareness>

<philosophy>
**User = founder/visionary. Claude = builder.**

The user knows:
- How they imagine it working
- What it should look/feel like
- What's essential vs nice-to-have
- Specific behaviors or references they have in mind

The user doesn't know (and shouldn't be asked):
- Codebase patterns (researcher reads the code)
- Technical risks (researcher identifies these)
- Implementation approach (planner figures this out)
- Success metrics (inferred from the work)

Ask about vision and implementation choices. Capture decisions for downstream agents.
</philosophy>

<scope_guardrail>
**CRITICAL: No scope creep.**

The phase boundary comes from the project roadmap and is FIXED. Discussion clarifies HOW to implement what's scoped, never WHETHER to add new capabilities.

**Allowed (clarifying ambiguity):**
- "How should posts be displayed?" (layout, density, info shown)
- "What happens on empty state?" (within the feature)
- "Pull to refresh or manual?" (behavior choice)

**Not allowed (scope creep):**
- "Should we also add comments?" (new capability)
- "What about search/filtering?" (new capability)
- "Maybe include bookmarking?" (new capability)

**The heuristic:** Does this clarify how we implement what's already in the phase, or does it add a new capability that could be its own phase?

**When user suggests scope creep:**
```
"[Feature X] would be a new capability -- that's its own phase.
Want me to note it for the roadmap backlog?

For now, let's focus on [phase domain]."
```

Capture the idea in a "Deferred Ideas" section. Don't lose it, don't act on it.
</scope_guardrail>

<gray_area_identification>
Gray areas are **implementation decisions the user cares about** -- things that could go multiple ways and would change the result.

**How to identify gray areas:**

1. **Read the phase goal** from the phase bead description
2. **Understand the domain** -- What kind of thing is being built?
   - Something users SEE -> visual presentation, interactions, states matter
   - Something users CALL -> interface contracts, responses, errors matter
   - Something users RUN -> invocation, output, behavior modes matter
   - Something users READ -> structure, tone, depth, flow matter
   - Something being ORGANIZED -> criteria, grouping, handling exceptions matter
3. **Generate phase-specific gray areas** -- Not generic categories, but concrete decisions for THIS phase

**Don't use generic category labels** (UI, UX, Behavior). Generate specific gray areas:

```
Phase: "User authentication"
-> Session handling, Error responses, Multi-device policy, Recovery flow

Phase: "Organize photo library"
-> Grouping criteria, Duplicate handling, Naming convention, Folder structure

Phase: "CLI for database backups"
-> Output format, Flag design, Progress reporting, Error recovery

Phase: "API documentation"
-> Structure/navigation, Code examples depth, Versioning approach, Interactive elements
```

**The key question:** What decisions would change the outcome that the user should weigh in on?

**Claude handles these (don't ask):**
- Technical implementation details
- Architecture patterns
- Performance optimization
- Scope (roadmap defines this)
</gray_area_identification>

<process>

<step name="resolve_phase" priority="first">
Phase number or ID from argument (required).

```bash
PROJECT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project)
```

Extract the project ID, then:
```bash
CONTEXT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" project-context <project-id>)
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
- options:
  - "Update it" -- Review and revise existing context
  - "View it" -- Show me what's there
  - "Skip" -- Use existing context as-is

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
- options:
  - "Continue and replan after" -- Capture context, then run /forge:plan to replan
  - "View existing tasks" -- Show tasks before deciding
  - "Cancel" -- Skip discuss-phase

If "Continue and replan after": Continue to load_prior_context.
If "View existing tasks": Display tasks, then offer "Continue" / "Cancel".
If "Cancel": Exit workflow.

**If no tasks exist:** Continue to load_prior_context.
</step>

<step name="load_prior_context">
Read project-level and prior phase context to avoid re-asking decided questions.

**Step 1: Read project bead**
```bash
PROJECT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project)
```

Parse JSON for the project bead ID, then:
```bash
bd show <project-id> --json
```

Extract from project bead:
- **description** -- Vision, principles, non-negotiables
- **design** -- Scope/constraints
- **notes** -- Any approach decisions

**Step 2: Read all prior phase notes**
```bash
CONTEXT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" project-context <project-id>)
```

This returns all phases with their details. For each phase before the current one:
- Read the `notes` field -- these are locked preferences and decisions
- Note any patterns (e.g., "user consistently prefers minimal UI")

**Step 3: Build internal prior_decisions context**

Structure the extracted information:
```
## Project-Level
- [Key principle or constraint from project bead]
- [Requirement that affects this phase]

## From Prior Phases
### Phase N: [Name]
- [Decision that may be relevant to current phase]
- [Preference that establishes a pattern]
```

**Usage in subsequent steps:**
- `analyze_phase`: Skip gray areas already decided in prior phases
- `present_gray_areas`: Annotate options with prior decisions ("You chose X in Phase N")
- `discuss_areas`: Pre-fill answers or flag conflicts ("This contradicts Phase N -- same here or different?")

**If no prior context exists:** Continue without -- this is expected for early phases.
</step>

<step name="scout_codebase">
Lightweight scan of existing code to inform gray area identification and discussion.

**Step 1: Check for existing codebase structure**

Look at the project's source tree:
```bash
ls src/ app/ lib/ 2>/dev/null
```

**Step 2: Targeted grep for phase-relevant code**

Extract key terms from the phase goal (e.g., "feed" -> "post", "card", "list"; "auth" -> "login", "session", "token").

```bash
# Find files related to phase goal terms
grep -rl "{term1}\|{term2}" src/ app/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | head -10

# Find existing components/hooks
ls src/components/ 2>/dev/null
ls src/hooks/ 2>/dev/null
ls src/lib/ src/utils/ 2>/dev/null
```

Read the 3-5 most relevant files to understand existing patterns.

**Step 3: Build internal codebase_context**

From the scan, identify:
- **Reusable assets** -- existing components, hooks, utilities that could be used
- **Established patterns** -- how the codebase does state management, styling, data fetching
- **Integration points** -- where new code would connect (routes, nav, providers)
- **Creative options** -- approaches the existing architecture enables or constrains

Store as internal codebase_context for use in analyze_phase and present_gray_areas. This is NOT persisted -- it's used within this session only.
</step>

<step name="analyze_phase">
Analyze the phase to identify gray areas worth discussing. **Use both prior_decisions and codebase_context to ground the analysis.**

**Read the phase description and determine:**

1. **Domain boundary** -- What capability is this phase delivering? State it clearly.

2. **Check prior decisions** -- Before generating gray areas, check if any were already decided:
   - Scan prior_decisions for relevant choices
   - These are **pre-answered** -- don't re-ask unless this phase has conflicting needs
   - Note applicable prior decisions for use in presentation

3. **Gray areas by category** -- For each relevant category, identify 1-2 specific ambiguities that would change implementation. **Annotate with code context where relevant** (e.g., "You already have a Card component" or "No existing pattern for this").

4. **Skip assessment** -- If no meaningful gray areas exist (pure infrastructure, clear-cut implementation, or all already decided in prior phases), the phase may not need discussion.

**Output your analysis internally, then present to user.**
</step>

<step name="present_gray_areas">
Present the domain boundary, prior decisions, and gray areas to user.

**First, state the boundary and any prior decisions that apply:**
```
Phase [X]: [Name]
Domain: [What this phase delivers -- from your analysis]

We'll clarify HOW to implement this.
(New capabilities belong in other phases.)

[If prior decisions apply:]
**Carrying forward from earlier phases:**
- [Decision from Phase N that applies here]
- [Decision from Phase M that applies here]
```

**Then use AskUserQuestion (multiSelect: true):**
- header: "Discuss"
- question: "Which areas do you want to discuss for [phase name]?"
- options: Generate 3-4 phase-specific gray areas, each with:
  - "[Specific area]" (label) -- concrete, not generic
  - [1-2 questions this covers + code context annotation] (description)

**Prior decision annotations:** When a gray area was already decided in a prior phase, annotate it:
```
Exit shortcuts -- How should users quit?
  (You decided "Ctrl+C only, no single-key shortcuts" in Phase 5 -- revisit or keep?)
```

**Code context annotations:** When the scout found relevant existing code:
```
Layout style -- Cards vs list vs timeline?
  (You already have a Card component with shadow/rounded variants. Reusing it keeps the app consistent.)
```

**Do NOT include a "skip" or "you decide" option.** User ran this command to discuss -- give them real choices.

Continue to discuss_areas with selected areas.
</step>

<step name="discuss_areas">
For each selected area, conduct a focused discussion loop.

**Philosophy: 4 questions, then check.**

Ask 4 questions per area before offering to continue or move on. Each answer often reveals the next question.

**For each area:**

1. **Announce the area:**
   ```
   Let's talk about [Area].
   ```

2. **Ask 4 questions using AskUserQuestion:**
   - header: "[Area]" (max 12 chars -- abbreviate if needed)
   - question: Specific decision for this area
   - options: 2-3 concrete choices (AskUserQuestion adds "Other" automatically)
   - **Annotate options with code context** when relevant:
     ```
     "How should posts be displayed?"
     - Cards (reuses existing Card component -- consistent with Messages)
     - List (simpler, would be a new pattern)
     - Timeline (needs new Timeline component -- none exists yet)
     ```
   - Include "You decide" as an option when reasonable -- captures Claude discretion
   - **Context7 for library choices:** When a gray area involves library selection or API approach decisions, use context7 tools to fetch current documentation and inform the options. Don't use Context7 for every question -- only when library-specific knowledge improves the options.

3. **After 4 questions, check:**
   - header: "[Area]" (max 12 chars)
   - question: "More questions about [area], or move to next?"
   - options: "More questions" / "Next area"

   If "More questions" -> ask 4 more, then check again
   If "Next area" -> proceed to next selected area
   If "Other" (free text) -> interpret intent: continuation phrases map to "More questions"; advancement phrases map to "Next area"

4. **After all initially-selected areas complete:**
   - Summarize what was captured from the discussion so far
   - AskUserQuestion:
     - header: "Done"
     - question: "We've discussed [list areas]. Which gray areas remain unclear?"
     - options: "Explore more gray areas" / "I'm ready for context"
   - If "Explore more gray areas":
     - Identify 2-4 additional gray areas based on what was learned
     - Return to present_gray_areas logic with these new areas
     - Loop: discuss new areas, then prompt again
   - If "I'm ready for context": Proceed to write_context

**Question design:**
- Options should be concrete, not abstract ("Cards" not "Option A")
- Each answer should inform the next question
- If user picks "Other" to provide freeform input, ask your follow-up as plain text -- NOT another AskUserQuestion. Wait for them to type at the normal prompt, then reflect their input back and confirm before resuming AskUserQuestion for the next question.

**Scope creep handling:**
If user mentions something outside the phase domain:
```
"[Feature] sounds like a new capability -- that belongs in its own phase.
I'll note it as a deferred idea.

Back to [current area]: [return to current question]"
```

Track deferred ideas internally.
</step>

<step name="write_context">
Store structured context on the phase bead.

**Build the context block:**

```markdown
# Phase [X]: [Name] - Context

**Gathered:** [date]
**Status:** Ready for planning

## Phase Boundary

[Clear statement of what this phase delivers -- the scope anchor]

## Implementation Decisions

### [Category 1 that was discussed]
- [Decision or preference captured]
- [Another decision if applicable]

### [Category 2 that was discussed]
- [Decision or preference captured]

### Claude's Discretion
[Areas where user said "you decide" -- note that Claude has flexibility here]

## Existing Code Insights

### Reusable Assets
- [Component/hook/utility]: [How it could be used in this phase]

### Established Patterns
- [Pattern]: [How it constrains/enables this phase]

### Integration Points
- [Where new code connects to existing system]

## Specific Ideas

[Any particular references, examples, or "I want it like X" moments from discussion]

## Deferred Ideas

[Ideas that came up but belong in other phases. Don't lose them.]
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
- Prior context loaded from project and phase beads
- Already-decided questions not re-asked (carried forward from prior phases)
- Codebase scouted for reusable assets, patterns, and integration points
- Gray areas identified through intelligent analysis with code and prior decision annotations
- User selected which areas to discuss
- Each selected area explored until user satisfied
- Scope creep redirected to deferred ideas
- Phase bead notes capture actual decisions, not vague vision
- Deferred ideas preserved (as beads or noted in context)
- User knows next steps
</success_criteria>
