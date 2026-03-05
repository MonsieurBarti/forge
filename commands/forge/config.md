---
name: forge:config
description: View or modify Forge configuration
argument-hint: "[get|set|list|clear] [key] [value]"
allowed-tools: Bash
---

<objective>
Manage Forge configuration stored in the beads key-value store (`bd kv`).
Configuration controls hook behavior (context thresholds, update checks)
and workflow preferences (auto-research).
</objective>

<execution_context>
Parse the user's intent from the argument:

**No argument or "list"**: Show all Forge config with current values and defaults.
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" config-list
```

**"get KEY"**: Get a specific config value.
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" config-get KEY
```

**"set KEY VALUE"**: Set a config value.
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" config-set KEY VALUE
```

**"clear KEY"**: Remove a config value (revert to default).
```bash
node "$HOME/.claude/forge/bin/forge-tools.cjs" config-clear KEY
```

**Available configuration keys:**

| Key | Default | Description |
|-----|---------|-------------|
| `context_warning` | `0.35` | Context window warning threshold (0-1) |
| `context_critical` | `0.25` | Context window critical/block threshold (0-1) |
| `update_check` | `true` | Check for updates on session start |
| `auto_research` | `true` | Auto-run research before planning |

Keys are stored with `forge.` prefix in `bd kv` (e.g., `forge.context_warning`).
Users can specify keys with or without the prefix.

Format output as a readable table showing current values alongside defaults.
</execution_context>
