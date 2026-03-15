<purpose>
Generate unit and E2E tests for a completed phase based on task beads and their acceptance criteria.
Classifies changed files into TDD (unit), E2E (browser), or Skip categories, presents a test plan
for user approval, then generates tests following RED-GREEN conventions.
</purpose>

<process>

<step name="resolve_phase">
Parse `$ARGUMENTS` for:
- Phase number (integer, decimal, or letter-suffix) or phase bead ID
- Remaining text -> `$EXTRA_INSTRUCTIONS` (optional)

If no argument:
```
ERROR: Phase number or ID required
Usage: /forge:add-tests <phase> [additional instructions]
```
Exit.

Find project and resolve phase:
```bash
PROJECT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project)
CONTEXT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" project-context-slim <project-id>)
```

Match phase number to ordered list. Verify phase is closed or in_progress. If still open:
```
ERROR: Phase has not been executed yet. Run /forge:execute <phase> first.
```

Present banner:
```
------------------------------------------------------------
 FORGE > ADD TESTS -- Phase {N}: {phase_title}
------------------------------------------------------------
```
</step>

<step name="load_tasks_and_criteria">
```bash
bd children <phase-id> --json
```

For each task, extract: `title`, `acceptance_criteria`, `notes`, `status`.

Check requirement traceability:
```bash
bd dep list <task-id> --type validates
```

If no acceptance criteria found, warn: "Tests will be generated based on implementation analysis only."

Build map: task -> acceptance criteria -> implementation files -> requirements validated.
</step>

<step name="analyze_implementation">
Identify files modified by the phase from task notes or git:
```bash
git log --oneline --all --grep="phase" | head -20
```

Classify each file:

| Category | Criteria | Test Type |
|----------|----------|-----------|
| **TDD** | Pure functions where `expect(fn(input)).toBe(output)` is writable | Unit tests |
| **E2E** | UI behavior verifiable by browser automation | Playwright/E2E tests |
| **Skip** | Not meaningfully testable or already covered | None |

**TDD:** business logic, data transformations, parsers, validators, state machines, utilities.

**E2E:** keyboard shortcuts, navigation, form interactions, selection, drag-and-drop, modals, data grids.

**Skip:** UI layout/styling, configuration, glue code, migrations, simple CRUD, type definitions.

Read each file to verify classification -- don't classify based on filename alone.
</step>

<step name="present_classification">
```
AskUserQuestion(
  header: "Test Classification",
  question: |
    ## Files classified for testing

    ### TDD (Unit Tests) -- {N} files
    {list with brief reason}

    ### E2E (Browser Tests) -- {M} files
    {list with brief reason}

    ### Skip -- {K} files
    {list with brief reason}

    {if $EXTRA_INSTRUCTIONS: "Additional instructions: ${EXTRA_INSTRUCTIONS}"}

    ### Acceptance Criteria Coverage
    {task title -> criteria -> files covering it}

    How would you like to proceed?
  options: ["Approve and generate test plan", "Adjust classification", "Cancel"]
)
```

If "Adjust": apply changes and re-present. If "Cancel": exit.
</step>

<step name="discover_test_structure">
```bash
find . -type d -name "*test*" -o -name "*spec*" -o -name "*__tests__*" 2>/dev/null | head -20
find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "*Tests.*" -o -name "*Test.*" \) 2>/dev/null | head -20
ls package.json *.sln Cargo.toml pyproject.toml 2>/dev/null
```

Identify: test directory structure, naming conventions, test runner commands, test framework.

If ambiguous, ask user via AskUserQuestion.
</step>

<step name="generate_test_plan">
**TDD files** (RED-GREEN-REFACTOR):
1. Map acceptance criteria to testable assertions
2. Identify testable functions/methods
3. List input scenarios, expected outputs, edge cases

**E2E files** (RED-GREEN gates):
1. Map acceptance criteria to user scenarios
2. Describe user action, expected outcome, assertions

Present plan via AskUserQuestion:
- options: "Generate all" / "Cherry-pick" / "Adjust plan"
</step>

<step name="execute_tdd_generation">
For each approved TDD test:

1. Create test file following project conventions
2. Write test with arrange/act/assert structure
3. Run: `{discovered test command}`
4. Evaluate:
   - **Passes**: verify it tests meaningful behavior
   - **Assertion failure**: flag as potential bug (do NOT fix implementation):
     ```
     WARNING: Potential bug found: {test name}
     Expected: {expected}, Actual: {actual}
     File: {impl file}, Task: {task-id}
     ```
   - **Import/syntax error**: fix test and re-run
</step>

<step name="execute_e2e_generation">
For each approved E2E test:

1. Check for existing tests covering same scenario; extend rather than duplicate
2. Create test file targeting user scenario from acceptance criteria
3. Run: `{discovered e2e command}`
4. Evaluate:
   - **GREEN**: record success
   - **RED**: flag if genuine bug, fix if test issue
   - **Cannot run**: report blocker, do NOT mark complete

**No-skip rule:** Never mark success without actually running the test.
</step>

<step name="summary_commit_and_update">
```
------------------------------------------------------------
 FORGE > TEST GENERATION COMPLETE
------------------------------------------------------------

| Category | Generated | Passing | Failing | Blocked |
|----------|-----------|---------|---------|---------|
| Unit     | {N}       | {n1}    | {n2}    | {n3}    |
| E2E      | {M}       | {m1}    | {m2}    | {m3}    |

## Acceptance Criteria Coverage
## Files Created/Modified
## Coverage Gaps
## Bugs Discovered
```

Commit passing tests:
```bash
git add {test files}
git commit -m "test(phase-{N}): add tests from forge:add-tests"
```

Update beads:
```bash
bd update <task-id> --notes="Tests added: <test-file-paths>"
bd comments add <task-id> "Tests generated: {N} unit, {M} e2e -- {summary}"
```

Present next steps:
- Bugs discovered: `/forge:quick fix the {N} test failures`
- Blocked tests: describe what's needed
- All passing: "Phase {N} is fully tested."
- Also: `/forge:add-tests {next_phase}`, `/forge:verify {phase_number}`
</step>

</process>

<success_criteria>
- [ ] Phase resolved and tasks loaded with acceptance criteria
- [ ] All changed files classified into TDD/E2E/Skip
- [ ] Classification approved by user
- [ ] Test structure discovered (directories, conventions, runners)
- [ ] Test plan approved (linked to acceptance criteria)
- [ ] TDD tests generated with arrange/act/assert
- [ ] E2E tests generated targeting user scenarios
- [ ] All tests executed -- no untested tests marked as passing
- [ ] Bugs flagged (not fixed)
- [ ] Test files committed, task beads updated
- [ ] Coverage gaps documented
- [ ] Next steps presented
</success_criteria>
</output>
