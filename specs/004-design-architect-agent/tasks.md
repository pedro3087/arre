# Tasks: Design Architect Agent (#004)

**Input**: Design documents from `specs/004-design-architect-agent/`
**Prerequisites**: [plan.md](plan.md) ✅ | [spec.md](spec.md) ✅

**Organization**: Tasks are grouped by workflow (W-001 → W-004) as user stories, enabling each mode to be implemented and tested independently.

**User Story Mapping**:
- **US1** → W-001: Local Pre-flight Check (`--local` mode, terminal output)
- **US2** → W-002: Automated PR Review (CI mode, PR comment)
- **US3** → W-004: Design Debt → GitHub Issues (auto-create `design-debt` issues)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared state)
- **[Story]**: Maps to workflow user story (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install tooling, scaffold entry point, wire npm scripts.

- [x] T001 Install Husky as devDependency: `npm install --save-dev husky` and run `npx husky init`
- [x] T002 Add `"design-check": "node scripts/design-architect.js --local"` and `"prepare": "husky"` to `package.json` scripts section
- [x] T003 Create empty ESM entry point `scripts/design-architect.js` with a `// TODO: implement` comment and `#!/usr/bin/env node` shebang
- [x] T004 Create `.husky/pre-push` hook file containing: `npm run design-check`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared utilities that ALL workflows depend on — must be complete before any user story work begins.

**⚠️ CRITICAL**: No US1/US2/US3 work can begin until this phase is complete.

- [x] T005 Update `docs/DESIGN_VIBES.md` — assign rule IDs `VIBES-001` through `VIBES-006` to the existing 6 rules (prepend ID to each rule heading)
- [x] T006 Update `docs/DESIGN_VIBES.md` — add severity mapping table after the rules section:
  ```
  | Rule ID   | Description           | Severity   |
  |-----------|-----------------------|------------|
  | VIBES-001 | No hardcoded colors   | Critical   |
  | VIBES-002 | 8px/4px grid          | Warning    |
  | VIBES-003 | Border radius         | Warning    |
  | VIBES-004 | Typography hierarchy  | Warning    |
  | VIBES-005 | Hover states          | Suggestion |
  | VIBES-006 | No inline styles      | Warning    |
  ```
- [x] T007 Implement `parseDiff(diffOutput)` helper in `scripts/design-architect.js` — filters raw git diff to frontend-only files (`*.tsx`, `*.ts`, `*.module.css`, `*.css`), returns array of `{ file, content }` objects
- [x] T008 Implement `detectHardcodedHex(filteredFiles)` helper in `scripts/design-architect.js` — regex scan `/#[0-9a-fA-F]{3,8}/g`, returns array of `{ ruleId: 'VIBES-001', severity: 'Critical', file, description, suggestion }` findings
- [x] T009 Implement `buildGeminiPrompt(filteredFiles, designVibesContent)` helper in `scripts/design-architect.js` — loads `docs/DESIGN_VIBES.md`, constructs prompt instructing Gemini to return a JSON array of `{ ruleId, severity, file, description, suggestion }` findings
- [x] T010 Implement `callGemini(prompt)` helper in `scripts/design-architect.js` — calls `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, 55s timeout, returns parsed findings array; on error logs warning and returns `[]` (non-blocking)
- [x] T011 Implement `renderMarkdownReport(findings, filesAnalyzed)` helper in `scripts/design-architect.js` — groups findings into Critical / Warning / Suggestion sections, each finding shows `ruleId`, `file`, `description`, `suggestion`

**Checkpoint**: All shared utilities implemented and individually testable by calling them with mock data.

---

## Phase 3: US1 — Local Pre-flight Check (W-001) 🎯 MVP

**Goal**: Developer runs `npm run design-check` before pushing; gets a <60s terminal report; exits with code 1 if Critical findings exist.

**Independent Test**:
1. Introduce a hardcoded `color: #ff0000` in any `*.module.css` file
2. Run `npm run design-check`
3. Expect: Critical finding printed to stdout referencing that file; exit code 1
4. Remove the hardcoded color, re-run → exit code 0

- [x] T012 [US1] Implement `getDiff(isLocal)` in `scripts/design-architect.js` — when `isLocal=true` runs `git diff HEAD`; when `false` runs `git diff origin/main...HEAD`; returns raw diff string
- [x] T013 [US1] Implement `--local` arg parsing at the top of `scripts/design-architect.js` main entry — detect `process.argv.includes('--local')` to set mode flag
- [x] T014 [US1] Wire local mode main flow in `scripts/design-architect.js`:
  1. Call `getDiff(true)`
  2. Call `parseDiff()` → if no frontend files, print "✅ No frontend changes detected." and exit 0
  3. Call `detectHardcodedHex()` for deterministic Critical findings
  4. Call `buildGeminiPrompt()` + `callGemini()` for LLM findings
  5. Merge all findings
  6. Call `renderMarkdownReport()` and print to stdout
  7. Exit 1 if any Critical findings, else 0
- [x] T015 [US1] Add elapsed-time tracking to local mode — print `⏱ Analysis completed in Xs` at end; warn if elapsed > 55s

**Checkpoint**: `npm run design-check` and `git push` (pre-push hook) both work end-to-end on a dirty branch.

---

## Phase 4: US2 — Automated PR Review via CI (W-002)

**Goal**: GitHub Actions posts a Design Review Report as a PR comment on every PR open/update that touches frontend files.

**Independent Test**:
1. Open a PR on GitHub that modifies any `*.tsx` or `*.module.css` file
2. Verify `design-review.yml` workflow runs
3. Verify a PR comment appears with the structured markdown report
4. Verify workflow passes even if `GEMINI_API_KEY` is invalid (non-blocking)

- [x] T016 [US2] Implement `postPrComment(markdownBody)` helper in `scripts/design-architect.js` — uses `GITHUB_TOKEN`, `PR_NUMBER`, `REPO_OWNER`, `REPO_NAME` env vars; POSTs to `https://api.github.com/repos/{owner}/{repo}/issues/{pr}/comments`; mirrors `qa-agent.js` pattern
- [x] T017 [US2] Wire CI mode main flow in `scripts/design-architect.js` (when `--local` flag absent):
  1. Call `getDiff(false)` using `git diff origin/main...HEAD`
  2. Call `parseDiff()` → if no frontend files, call `postPrComment("✅ No frontend changes detected — design audit skipped.")` and exit 0
  3. Call `detectHardcodedHex()` + `callGemini()`, merge findings
  4. Call `renderMarkdownReport()` and `postPrComment()`
  5. Exit 1 if any Critical findings, else 0
- [x] T018 [US2] Handle Gemini failure in CI mode — if `callGemini()` returns empty due to error, post special PR comment: "⚠️ Design audit skipped — Gemini API unavailable. Deterministic checks (HEX color scan) still ran."
- [x] T019 [P] [US2] Create `.github/workflows/design-review.yml` with:
  - `on: pull_request: branches: [main], paths: ['src/**/*.tsx','src/**/*.ts','src/**/*.css','src/**/*.module.css']`
  - `permissions: contents: read, pull-requests: write, issues: write`
  - Steps: `actions/checkout@v4` (fetch-depth: 0), `actions/setup-node@v4` (lts/*, cache: npm), `npm ci`, `node scripts/design-architect.js`
  - All required env vars from secrets/context
  - `continue-on-error: true` on the run step

**Checkpoint**: Open a real or draft PR → workflow triggers → PR comment posted correctly.

---

## Phase 5: US3 — Design Debt GitHub Issues (W-004)

**Goal**: In CI mode, every `Suggestion`-level finding automatically opens a GitHub Issue with the `design-debt` label. Duplicate issues are not created on repeated pushes.

**Independent Test**:
1. Introduce a component missing a hover state (VIBES-005)
2. Open/update a PR → verify a GitHub Issue is created with label `design-debt`
3. Push again to same PR → verify no duplicate Issue is created for the same finding

- [x] T020 [US3] Implement `getExistingDesignDebtIssues()` helper in `scripts/design-architect.js` — GETs open issues with label `design-debt` via GitHub API; returns array of issue titles for deduplication check
- [x] T021 [US3] Implement `createDesignDebtIssue(finding, prNumber)` helper in `scripts/design-architect.js` — POSTs to `/repos/{owner}/{repo}/issues` with:
  - title: `[DESIGN-DEBT][PR-{prNumber}] {finding.description.slice(0, 80)}`
  - body: markdown with rule ID, file reference, description, suggestion
  - labels: `['design-debt']`
- [x] T022 [US3] Add deduplication logic: before calling `createDesignDebtIssue()`, check if an open issue title already starts with `[DESIGN-DEBT][PR-{prNumber}]` + same description prefix; skip if duplicate
- [x] T023 [US3] Wire W-004 into CI mode flow — after posting PR comment, iterate `Suggestion`-severity findings and call `createDesignDebtIssue()` with deduplication; log each created/skipped issue to stdout
- [x] T024 [US3] Create the `design-debt` label in the GitHub repo (one-time setup) — document in `docs/DESIGN_ARCHITECT.md` as a prerequisite step with the curl/GitHub CLI command

**Checkpoint**: Two consecutive pushes to the same PR with the same Suggestion finding → exactly 1 GitHub Issue created.

---

## Phase 6: Companion Spec Artifacts

**Purpose**: Complete the plan-phase deliverables deferred during `/speckit.plan`.

- [x] T025 [P] Create `specs/004-design-architect-agent/research.md` — document all 9 Phase 0 decisions from plan.md (model choice, ESM, DESIGN_VIBES.md existence, Husky, HEX regex, GitHub Issues, secrets, deduplication)
- [x] T026 [P] Create `specs/004-design-architect-agent/data-model.md` — document the `DesignFinding`, `DesignDebtItem`, and `DesignReport` shapes with field types and example values
- [x] T027 [P] Create `specs/004-design-architect-agent/contracts/cli.md` — document CLI contract: command syntax, `--local` flag, exit codes (0 = pass, 1 = Critical findings, 2 = runtime error), env var requirements

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, spec updates, and final validation.

- [x] T028 [P] Update `specs/004-design-architect-agent/plan.md` — replace existing draft with the full plan from the approved planning session (model correction: gemini-2.5-flash, not 2.0 Pro; all phases, critical files table, verification steps)
- [x] T029 [P] Update `specs/004-design-architect-agent/spec.md` — correct model reference from "Gemini 2.0 Pro" to "Gemini 2.5 Flash" in Section 2 and Section 4
- [x] T030 Create `docs/DESIGN_ARCHITECT.md` — dual-agent architecture overview, local setup (`GEMINI_API_KEY` in `.env`), running `npm run design-check`, pre-push hook bypass policy (`--no-verify`), CI behavior, severity interpretation, `design-debt` label setup
- [x] T031 Update `README.md` — add "Dual-Agent Review" section mentioning both QA Agent and Design Architect Agent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 — Local)**: Depends on Phase 2 completion — MVP deliverable
- **Phase 4 (US2 — CI)**: Depends on Phase 2 + Phase 3 (reuses `getDiff`, `parseDiff`, Gemini helpers)
- **Phase 5 (US3 — Issues)**: Depends on Phase 4 (CI mode must exist first)
- **Phase 6 (Artifacts)**: Can run in parallel with Phases 3–5 (docs only)
- **Phase 7 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US1 (Local mode)**: Can start immediately after Phase 2 — no story dependencies
- **US2 (CI mode)**: Depends on US1 helpers being available (getDiff, parseDiff, Gemini, renderMarkdown)
- **US3 (GitHub Issues)**: Depends on US2 CI mode being wired

### Within Each User Story

- Foundational helpers (Phase 2) before any story wiring
- Story wiring tasks sequential within each phase (wire flow last)
- `continue-on-error` workflow setting critical for non-blocking guarantee

### Parallel Opportunities

- T005 and T006 (DESIGN_VIBES.md updates) can run in parallel
- T007, T008, T009 (helper functions) can run in parallel — different logical units
- T019 (workflow YAML) can be written in parallel with T016–T018 (script logic)
- T025, T026, T027 (artifacts) can all run in parallel
- T028, T029, T030, T031 (polish docs) can all run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Can run simultaneously:
Task T005: "Update DESIGN_VIBES.md — assign rule IDs"
Task T007: "Implement parseDiff() helper in scripts/design-architect.js"
Task T008: "Implement detectHardcodedHex() helper in scripts/design-architect.js"
Task T009: "Implement buildGeminiPrompt() helper in scripts/design-architect.js"

# Then:
Task T006: "Update DESIGN_VIBES.md — add severity table" (depends on T005)
Task T010: "Implement callGemini() helper" (after T009 defines prompt shape)
Task T011: "Implement renderMarkdownReport() helper" (independent)
```

---

## Implementation Strategy

### MVP First (US1 Only — Local Pre-flight)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T011) — critical blocker
3. Complete Phase 3: US1 (T012–T015)
4. **STOP and VALIDATE**: Run `npm run design-check` on a dirty branch
5. Ship: developers now have automated local design checks on every push

### Incremental Delivery

1. Setup + Foundational → shared infrastructure ready
2. US1 (Local mode) → `npm run design-check` + pre-push hook (**MVP**)
3. US2 (CI mode) → PR comments on every PR
4. US3 (GitHub Issues) → Design Debt backlog automation
5. Each phase adds value independently

---

## Notes

- `[P]` tasks operate on different functions/files — safe to parallelize
- `design-architect.js` is a single ESM file; internal helpers are functions, not separate files
- `GEMINI_API_KEY` must be set in `.env` locally and in GitHub Secrets for CI
- Pre-push hook bypass: `git push --no-verify` (emergency use only)
- Exit code 1 from `design-architect.js` does NOT block CI (workflow uses `continue-on-error: true`)
- The `design-debt` GitHub label must be created manually before W-004 can run (see T024)
