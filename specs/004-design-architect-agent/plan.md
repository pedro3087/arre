# Implementation Plan: Design Architect Agent

**Feature Path**: `specs/004-design-architect-agent`
**Reference Spec**: [spec.md](spec.md)
**Research**: [research.md](research.md)
**Data Model**: [data-model.md](data-model.md)
**CLI Contract**: [contracts/cli.md](contracts/cli.md)

---

## Summary

The Design Architect Agent is an AI-powered design reviewer implemented as a single Node.js ESM script (`scripts/design-architect.js`). It mirrors the existing `scripts/qa-agent.js` architecture: git diff → LLM analysis → structured report → GitHub integration. V1 scope is **code-level styling rules only**.

---

## Research Decisions (Phase 0)

| Decision | Resolution |
|----------|-----------|
| LLM model | `gemini-2.5-flash` (spec says 2.0 Pro — corrected; consistent with `qa-agent.js`) |
| Module format | ESM (`"type": "module"` in `package.json`) |
| `DESIGN_VIBES.md` | Pre-existing with 6 rules; updated with rule IDs + severity table |
| Git hook | Pre-push via Husky (`npm install --save-dev husky`) |
| HEX detection | Deterministic regex `/#[0-9a-fA-F]{3,8}\b/g` — no LLM needed for SC-001 |
| GitHub Issues | `POST /repos/{owner}/{repo}/issues`, `labels: ['design-debt']`, `issues: write` permission |
| Secrets | `GEMINI_API_KEY` already a GitHub Actions secret; no new setup required |
| Max files | 10 files per run (CHK016/CHK031) |
| Deduplication | Title prefix `[DESIGN-DEBT][PR-{n}]` + first 40 chars of description |
| Critical severity | Severity label only; CI uses `continue-on-error: true` (CHK007) |
| `.ts` filtering | Include only if diff lines match `/style|className|var\(--|\.module/i` (CHK015) |
| Missing DESIGN_VIBES.md | Non-blocking warning; skip Gemini; HEX scan still runs (CHK017) |
| W-004 severity trigger | Only `Suggestion` creates Issues; Critical/Warning are PR-review items (CHK027) |

---

## Files Created / Modified

| File | Action | Description |
|------|--------|-------------|
| `scripts/design-architect.js` | **Created** | Main agent script (~220 lines ESM) |
| `.github/workflows/design-review.yml` | **Created** | CI workflow; PR trigger; paths filter |
| `docs/DESIGN_VIBES.md` | **Updated** | Added `VIBES-00X` rule IDs + severity mapping table |
| `docs/DESIGN_ARCHITECT.md` | **Created** | Developer guide and ops documentation |
| `package.json` | **Updated** | Added `design-check` and `prepare` scripts |
| `.husky/pre-push` | **Created** | Pre-push hook running `npm run design-check` |
| `specs/004-design-architect-agent/research.md` | **Created** | Phase 0 decisions |
| `specs/004-design-architect-agent/data-model.md` | **Created** | Entity shapes |
| `specs/004-design-architect-agent/contracts/cli.md` | **Created** | CLI contract |

---

## Implementation Phases

### Phase 1: Knowledge Base

- Updated `docs/DESIGN_VIBES.md` with `VIBES-001` through `VIBES-006` rule IDs
- Added severity mapping table (Critical / Warning / Suggestion per rule)
- Added agent instruction to not report VIBES-001 (handled by regex)

### Phase 2: Core Script (`scripts/design-architect.js`)

**Helpers**:
- `getDiff(isLocal)` — `git diff HEAD` (local) or `git diff origin/main...HEAD` (CI)
- `parseDiff(raw)` — filters to frontend files; `.ts` filtered by style-pattern regex
- `detectHardcodedHex(files)` — deterministic regex; returns `DesignFinding[]` with `severity: "Critical"`
- `buildGeminiPrompt(files, vibesContent)` — constructs structured prompt; instructs JSON-only response
- `callGemini(prompt)` — fetch with 55s AbortController timeout; non-blocking on all errors
- `renderMarkdownReport(findings, filesAnalyzed, truncated)` — grouped Critical/Warning/Suggestion sections

**CI-only helpers**:
- `postPrComment(body)` — mirrors `qa-agent.js` pattern
- `getExistingDesignDebtIssues()` — GETs open `design-debt` issues for deduplication
- `createDesignDebtIssue(finding, prNumber)` — POSTs new Issue with `design-debt` label

### Phase 3: GitHub Actions (`design-review.yml`)

- Trigger: `pull_request` to `main`, paths-filtered to `src/**/*.{tsx,ts,css,module.css}`
- Permissions: `pull-requests: write`, `issues: write`
- `continue-on-error: true` on run step (non-blocking guarantee)
- Full git history via `fetch-depth: 0`

### Phase 4: Automation (Husky pre-push hook)

- `npm install --save-dev husky` + `npx husky init`
- `.husky/pre-push` contains: `npm run design-check`
- `package.json` scripts: `"design-check"` and `"prepare": "husky"`

---

## Reused Patterns (from `qa-agent.js`)

- Gemini API call structure (fetch + JSON body + response parsing)
- GitHub PR comment via `POST /repos/{owner}/{repo}/issues/{pr}/comments`
- `fetch-depth: 0` checkout for accurate git diff
- Environment variable pattern (all from `process.env`)
- Non-blocking error handling (warn + return empty, never throw)

---

## Verification Steps

1. **SC-001**: Add `color: #ff0000` to any `.module.css` → run `npm run design-check` → expect Critical finding; exit 1
2. **SC-002**: Open a PR touching a frontend file → verify `design-review.yml` runs → verify PR comment posted
3. **SC-003**: Change a form component → verify at least one Warning/Suggestion in report
4. **W-004**: Trigger a Suggestion finding in CI → verify GitHub Issue created with `design-debt` label → push again → verify no duplicate
5. **Failure mode**: Set `GEMINI_API_KEY=invalid` → verify CI step passes, warning comment posted
6. **Latency**: Run `npm run design-check` on a 3-file diff → wall-clock time < 60s
7. **No frontend changes**: Run `npm run design-check` with only backend changes → "No frontend changes detected" message, exit 0
