# Research: Design Architect Agent

**Feature**: `specs/004-design-architect-agent`
**Phase**: Phase 0 — Research & Decisions
**Date**: 2026-03-08

## Resolved Decisions

| # | Decision | Resolution | Rationale |
|---|----------|-----------|-----------|
| 1 | LLM model | `gemini-2.5-flash` (not 2.0 Pro as originally stated in spec) | Consistent with existing `qa-agent.js`; lower latency; sufficient for text-only code analysis |
| 2 | Module format | ESM (`import`/`export`) | `package.json` has `"type": "module"`; all project scripts must use ESM |
| 3 | `DESIGN_VIBES.md` | Already existed with 6 rules | Updated to add `VIBES-00X` rule IDs and severity mapping table |
| 4 | Git hook type | Pre-push via Husky | Less intrusive than pre-commit; catches issues before sharing; `--no-verify` escape hatch documented |
| 5 | HEX detection (SC-001) | Deterministic regex `/#[0-9a-fA-F]{3,8}\b/g` on added diff lines | Fully testable without LLM; consistent; not subject to model hallucination |
| 6 | GitHub Issues (W-004) | `POST /repos/{owner}/{repo}/issues` with `labels: ['design-debt']` | Native GitHub API; no extra tooling; `issues: write` permission in workflow |
| 7 | Gemini API key — CI | `GEMINI_API_KEY` already exists as a GitHub Actions secret (used by `qa-agent.yml`) | No new secret setup required |
| 8 | Gemini API key — local | Developer adds `GEMINI_API_KEY=...` to `.env` file (not committed) | Consistent with project's local env pattern |
| 9 | Deduplication | Title prefix match: `[DESIGN-DEBT][PR-{n}]` + first 40 chars of description | Prevents duplicate Issue flood on repeated pushes to same PR |

## Architectural Decisions

### CHK007 — "Critical" severity does not hard-block merges
Resolved: `continue-on-error: true` in `design-review.yml`. Exit code 1 is emitted for Critical findings but the CI step never fails the workflow. "Critical" is a severity label, not a merge gate.

### CHK015 — `.ts` file filtering
Resolved: Plain `.ts` files (not `.tsx`) are included only if their diff lines match `/style|className|var\(--|\.module/i`. Pure utility/type files are silently excluded.

### CHK016/CHK031 — Max files cap
Resolved: 10 files maximum per Gemini call. If a diff exceeds 10 frontend files, the first 10 are analyzed and the report notes the truncation.

### CHK017 — Missing `DESIGN_VIBES.md`
Resolved: Non-blocking warning; Gemini analysis is skipped; deterministic HEX scan still runs.

### CHK027 — Which severities create GitHub Issues
Resolved: Only `Suggestion`-severity findings create Issues. `Critical` and `Warning` are PR-review concerns resolved before merge.
