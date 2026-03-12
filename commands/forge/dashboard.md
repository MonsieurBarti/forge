---
name: forge:dashboard
description: Generate an interactive HTML dashboard for the project and open it in the browser
argument-hint: "[project-id]"
allowed-tools: Read, Bash, Grep, Glob
---

<objective>
Generate a self-contained HTML dashboard showing project progress, phases with task checklists,
requirement coverage, and blockers. Opens in the default browser.
</objective>

<context>
Read the Forge conventions: @~/.claude/forge/references/conventions.md
</context>

<execution_context>
Execute the dashboard workflow from @~/.claude/forge/workflows/dashboard.md end-to-end.

1. Find the project (use argument if provided, otherwise auto-detect):
```bash
PROJECT=$(node "$HOME/.claude/forge/bin/forge-tools.cjs" find-project)
```

2. Generate the HTML dashboard:
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" generate-dashboard <project-id>
```

3. Open the generated HTML file in the browser:
```bash
open <path-from-step-2>
```

Report the file path to the user when done.
</execution_context>
