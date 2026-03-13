---
name: forge:settings
description: Configure Forge workflow toggles (research, verification, parallel execution, etc.)
argument-hint: "[get|set] [key] [value]"
allowed-tools: Read, Write, Bash, AskUserQuestion
---

<objective>
Configure Forge workflow toggles with two-layer override: global defaults
(~/.claude/forge.local.md) and per-project overrides (.forge/settings.yaml).
Project settings win over global. Both win over built-in defaults.
</objective>

<execution_context>
Parse the user's intent from the argument:

**No argument**: Run the interactive settings workflow.
Follow the workflow from @~/.claude/forge/workflows/settings.md end-to-end.

**"get" or "get KEY"**: Show current effective settings (or a specific one).
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" settings-load
```
Display as a formatted table with value, source, and description for each setting.

**"set KEY VALUE"**: Set a specific setting (defaults to project scope).
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" settings-set project KEY VALUE
```

**"set --global KEY VALUE"**: Set a setting at global scope.
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" settings-set global KEY VALUE
```

**"clear KEY"**: Clear a project-level override (falls back to global/default).
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" settings-clear project KEY
```

**"clear --global KEY"**: Clear a global setting (falls back to default).
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" settings-clear global KEY
```

**Available workflow toggles:**

| Key | Default | Description |
|-----|---------|-------------|
| `skip_verification` | `false` | Skip phase verification after execution |
| `auto_commit` | `true` | Auto-commit after each completed task |
| `require_discussion` | `true` | Require user discussion before planning |
| `auto_research` | `true` | Auto-run research before planning |
| `plan_check` | `true` | Run plan checker to validate plans |
| `parallel_execution` | `true` | Execute independent tasks in parallel |
| `quality_gate` | `true` | Run pre-PR quality pipeline (security, code review, performance audits) |

**Override layers** (highest priority wins):
1. Per-project: `.forge/settings.yaml`
2. Global: `~/.claude/forge.local.md` (YAML frontmatter)
3. Built-in defaults

Format output as a readable table showing value, source, and description.
</execution_context>
