# Data Model: Design Architect Agent

**Feature**: `specs/004-design-architect-agent`

## Entities

All entities are in-memory only (no persistence). The agent produces ephemeral reports per run.

---

### DesignFinding

Represents a single rule violation or design observation.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ruleId` | `string` | VIBES rule identifier | `"VIBES-001"` |
| `severity` | `"Critical" \| "Warning" \| "Suggestion"` | Impact level | `"Critical"` |
| `file` | `string` | Relative file path from repo root | `"src/components/TaskCard.module.css"` |
| `description` | `string` | Human-readable issue description | `"Hardcoded color \`#ff0000\` found."` |
| `suggestion` | `string` | Actionable fix | `"Replace with \`var(--accent-ruby)\`."` |

**Detection source**:
- `ruleId: "VIBES-001"` → always from deterministic regex (never Gemini)
- All other `ruleId` values → from Gemini LLM response

---

### DesignDebtItem (GitHub Issue payload)

Represents a `Suggestion`-severity finding promoted to a GitHub Issue.

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | `string` | Issue title (max ~90 chars) | `"[DESIGN-DEBT][PR-42] Missing hover state on TaskCard button."` |
| `body` | `string` | Markdown issue body | See template below |
| `labels` | `string[]` | Always `['design-debt']` | `["design-debt"]` |

**Title format**: `[DESIGN-DEBT][PR-{PR_NUMBER}] {finding.description.slice(0, 80)}`

**Body template**:
```markdown
## Design Debt Item

**Rule**: `VIBES-005`
**File**: `src/components/TaskCard.tsx`
**PR**: #42

**Issue**:
{finding.description}

**Suggested Fix**:
{finding.suggestion}

---
*Created automatically by the Design Architect Agent*
```

---

### DesignReport (in-memory)

Aggregated output of a single agent run.

| Field | Type | Description |
|-------|------|-------------|
| `findings` | `DesignFinding[]` | All findings (hex + LLM merged) |
| `filesAnalyzed` | `number` | Frontend files actually sent to Gemini |
| `truncatedCount` | `number` | Files omitted due to MAX_FILES=10 cap |
| `hexFindingsCount` | `number` | Subset of Critical findings from regex |
| `llmFindingsCount` | `number` | Subset of findings from Gemini |
| `elapsedMs` | `number` | Wall-clock duration of the run |

---

## Severity → Action Mapping

| Severity | Source | Creates PR Comment | Creates GitHub Issue | Exits with code 1 |
|----------|--------|--------------------|----------------------|-------------------|
| Critical | Regex (VIBES-001) | ✅ | ❌ | ✅ (non-blocking in CI) |
| Warning  | Gemini LLM | ✅ | ❌ | ❌ |
| Suggestion | Gemini LLM | ✅ | ✅ (design-debt) | ❌ |
