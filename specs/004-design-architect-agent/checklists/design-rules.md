# Design Rules Checklist: Design Architect Agent

**Purpose**: Validates the quality, clarity, completeness, and measurability of requirements for V1 code-level styling rule enforcement by the Design Architect Agent.
**Created**: 2026-03-08
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [tasks.md](../tasks.md)

---

## Requirement Completeness

- [x] CHK001 - Is the content structure and format of `docs/DESIGN_VIBES.md` defined in the spec (e.g., sections, rule format, required fields)? [Completeness, Gap] → RESOLVED: DESIGN_VIBES.md already exists with 6 rules; T005/T006 add IDs and severity table
- [x] CHK002 - Are all V1 code-level styling rules explicitly enumerated or linked to a canonical source, rather than implied by reference to `FRONTEND_LAYER.md`? [Completeness, Spec §4] → RESOLVED: DESIGN_VIBES.md is the canonical source
- [ ] CHK003 - Is the V1 scope boundary ("code-level styling rules only") documented with an explicit list of excluded concerns (e.g., UX journey, animation, copy)? [Completeness, Gap] → DEFERRED-V2: Acceptable ambiguity for V1
- [x] CHK004 - Are the exact CSS variable patterns the agent must validate against `variables.css` specified (e.g., regex, naming convention)? [Completeness, Spec §SC-001] → RESOLVED: Regex `/#[0-9a-fA-F]{3,8}/g` specified in plan
- [x] CHK005 - Is the authoritative file filter pattern (`*.tsx`, `*.ts`, `*.module.css`, `*.css`) documented in the spec, not just the plan? [Completeness, Spec §4] → RESOLVED: Captured in spec Clarifications section
- [x] CHK006 - Are requirements defined for the `[STORY SUGGESTION]` format used in W-004 to identify design-debt items for GitHub Issues? [Completeness, Gap, Spec §W-004] → RESOLVED: Title format `[DESIGN-DEBT][PR-{n}]` specified in plan

## Requirement Clarity

- [x] CHK007 - Is "Critical (blocks merge)" severity defined with explicit, objective criteria for what qualifies? [Clarity, Spec §4] → RESOLVED: Critical = VIBES-001 (hardcoded HEX). "Blocks merge" is a severity label only — CI uses `continue-on-error: true` so nothing actually blocks. Severity labels: Critical=report only, Warning=should fix, Suggestion=backlog.
- [ ] CHK008 - Is the distinction between "Warning (should fix)" and "Suggestion (nice to have)" specified with measurable thresholds? [Clarity, Spec §4] → DEFERRED-V2: LLM-driven via rule-to-severity mapping table in DESIGN_VIBES.md
- [ ] CHK009 - Is "low-alignment or UX friction" in SC-003 quantified with concrete criteria, or is it left to agent discretion? [Ambiguity, Spec §SC-003] → DEFERRED-V2: Acceptable for V1 — left to Gemini judgment
- [ ] CHK010 - Is "responsive alignment (Mobile vs Desktop)" in SC-002 defined with specific breakpoints or viewport widths? [Ambiguity, Spec §SC-002] → DEFERRED-V2: Gemini uses general knowledge; no breakpoint spec needed for V1
- [ ] CHK011 - Is "8px grid alignment" (referenced in plan §2 prompt strategy) formally captured as a rule in the spec or DESIGN_VIBES.md? [Consistency, Gap] → DEFERRED-V2: Already in DESIGN_VIBES.md as VIBES-002
- [ ] CHK012 - Is "White Paper aesthetic" defined with concrete, agent-evaluable visual properties in DESIGN_VIBES.md, rather than remaining as a subjective descriptor? [Clarity, Ambiguity] → DEFERRED-V2: DESIGN_VIBES.md has concrete rules; "White Paper" is context for Gemini persona

## Scenario Coverage

- [x] CHK013 - Are requirements defined for when the diff contains no frontend files (empty filtered diff) — should the agent skip silently or report explicitly? [Coverage, Gap, Spec §W-001] → RESOLVED: Print "✅ No frontend changes detected." and exit 0
- [x] CHK014 - Are requirements defined for the `--local` CLI mode vs. CI mode behavior differences (e.g., diff source, output destination)? [Coverage, Spec §W-001/W-002] → RESOLVED: --local=git diff HEAD→stdout; CI=git diff origin/main...HEAD→PR comment
- [x] CHK015 - Are requirements defined for `.ts` files that are utilities or types rather than React components — should they be filtered or analyzed? [Coverage, Gap] → RESOLVED: Include `*.ts` but only analyze diff lines containing `style`, `className`, or CSS variable references to reduce noise
- [x] CHK016 - Are requirements defined for diffs that exceed Gemini's context window limit (i.e., very large PRs with many changed files)? [Coverage, Edge Case, Gap] → RESOLVED: Cap at 10 files per Gemini call; if diff exceeds 10 frontend files, analyze first 10 and note truncation in report

## Edge Case Coverage

- [x] CHK017 - Is behavior specified when `docs/DESIGN_VIBES.md` or `src/styles/variables.css` is missing, empty, or malformed at runtime? [Edge Case, Gap] → RESOLVED: Non-blocking warning; skip Gemini analysis; run HEX regex check only
- [ ] CHK018 - Are requirements defined for Gemini API rate limiting or quota exhaustion (distinct from full unavailability handled in W-001/W-002)? [Edge Case, Gap] → DEFERRED-V2: Treated same as general API unavailability (non-blocking)
- [ ] CHK019 - Is behavior specified for auto-generated or vendored files that match the frontend file filter? [Edge Case, Gap] → DEFERRED-V2: Rare in this codebase; acceptable for V1
- [ ] CHK020 - Are requirements defined for a PR with no base branch comparison (e.g., orphan branch, deleted base)? [Edge Case, Gap] → DEFERRED-V2: git command fails gracefully; non-blocking

## Automation & Git Hook Requirements

- [x] CHK021 - Are requirements specified for automating W-001 via a git hook (pre-commit or pre-push), including the hook type and setup process? [Gap, Spec §W-001] → RESOLVED: Pre-push hook via Husky; `npm install --save-dev husky && npx husky init`
- [x] CHK022 - Is the developer onboarding requirement for hook installation documented (e.g., `npm install` post-install script or manual step)? [Gap, Dependency] → RESOLVED: `"prepare": "husky"` in package.json scripts; documented in DESIGN_ARCHITECT.md
- [x] CHK023 - Are requirements defined for the `--no-verify` bypass policy — is skipping the hook permitted, and under what conditions? [Coverage, Gap] → RESOLVED: `git push --no-verify` permitted for emergency use; documented in DESIGN_ARCHITECT.md

## W-004 GitHub Issues Integration

- [x] CHK024 - Are requirements defined for the GitHub Issue template structure for `design-debt` items (title format, body fields, labels)? [Completeness, Gap, Spec §W-004] → RESOLVED: Title=`[DESIGN-DEBT][PR-{n}] {description[:80]}`, body=markdown with ruleId/file/description/suggestion, labels=`['design-debt']`
- [x] CHK025 - Is the `design-debt` label creation documented as a prerequisite (must pre-exist in the repo before CI runs)? [Dependency, Gap] → RESOLVED: T024 documents manual one-time setup in DESIGN_ARCHITECT.md
- [x] CHK026 - Are requirements defined for deduplication — what prevents the agent from opening duplicate Issues for the same suggestion across multiple PR pushes? [Edge Case, Gap] → RESOLVED: Check existing open issues; skip if title prefix `[DESIGN-DEBT][PR-{n}]` + description already exists
- [x] CHK027 - Is it specified which severity levels (Critical / Warning / Suggestion) generate GitHub Issues vs. remain report-only? [Clarity, Gap, Spec §W-004] → RESOLVED: Only `Suggestion` creates GitHub Issues (design debt backlog). Critical and Warning are PR-review concerns only.
- [x] CHK028 - Are GitHub token permission scopes required to create Issues documented as a CI prerequisite? [Security, Gap] → RESOLVED: `issues: write` permission specified in design-review.yml

## Non-Functional Requirements

- [x] CHK029 - Is the <60 second latency target for W-001 traceable to a measurable acceptance criterion (e.g., a CI step timeout or test fixture)? [Measurability, Spec §W-001] → RESOLVED: 55s timeout on callGemini(); elapsed time printed to stdout
- [x] CHK030 - Are API key management requirements specified (env variable names, CI secrets configuration, local `.env` setup)? [Security, Gap] → RESOLVED: `GEMINI_API_KEY` in local `.env`; GitHub Actions secret of same name
- [x] CHK031 - Is a maximum diff size or changed-file count defined to prevent unbounded Gemini API token costs? [Non-Functional, Gap] → RESOLVED: Max 10 frontend files per Gemini call; excess files noted in report

## Acceptance Criteria Quality

- [x] CHK032 - Is SC-001 ("0% hardcoded HEX colors") verifiable via a deterministic rule (static analysis), or does it rely on Gemini interpretation? [Measurability, Spec §SC-001] → RESOLVED: Deterministic regex scan; Gemini not used for HEX detection
- [ ] CHK033 - Is SC-002 ("every PR is audited") defined with a mechanism to verify the audit ran (e.g., required CI check status)? [Measurability, Spec §SC-002] → DEFERRED-V2: GitHub Actions run history proves it; no required check status for V1
- [ ] CHK034 - Is SC-003 ("at least one friction point per major feature") tested against a known "dirty" fixture, and is "major feature" defined? [Measurability, Ambiguity, Spec §SC-003] → DEFERRED-V2: Acceptable ambiguity for V1
- [ ] CHK035 - Are acceptance criteria defined for `docs/DESIGN_VIBES.md` itself — what makes the rulebook complete and valid? [Gap, Completeness] → DEFERRED-V2: T005/T006 (add rule IDs + severity table) define completeness for V1

## Notes

- Check items off as completed: `[x]`
- `[Gap]` = requirement is missing from spec/plan
- `[Ambiguity]` = requirement exists but is too vague to implement or test objectively
- `[Dependency]` = external prerequisite that must be satisfied before implementation
- `DEFERRED-V2` = acceptable for V1; revisit in next iteration
- Items are numbered sequentially for easy reference (CHK001–CHK035)
