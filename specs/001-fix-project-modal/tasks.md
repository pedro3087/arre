# Tasks: Fix Project Modal Centering and Button Visibility

**Input**: Design documents from `/specs/001-fix-project-modal/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — no test tasks generated.

**Organization**: Tasks grouped by user story. Two user stories both P1, targeting two files: `src/features/projects/ProjectModal.tsx` and `src/features/projects/ProjectModal.module.css`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 3: User Story 1 - Modal Opens Centered on Screen (Priority: P1) 🎯 MVP

**Goal**: The modal appears visually centered on the viewport from the first animation frame.

**Independent Test**: Click "New Project" → verify modal is centered both axes on any viewport size.

### Implementation for User Story 1

- [x] T001 [US1] Remove `transform: translate(-50%, -50%)` from `.modal` in `src/features/projects/ProjectModal.module.css` (centering moves to Framer Motion's style prop)
- [x] T002 [US1] Add `style={{ x: '-50%', y: '-50%' }}` prop to the `motion.div` with `className={styles.modal}` in `src/features/projects/ProjectModal.tsx`
- [x] T003 [US1] Remove `y: 10` from `initial`, `y: 0` from `animate`, and `y: 10` from `exit` on the same `motion.div` in `src/features/projects/ProjectModal.tsx`

**Checkpoint**: Modal is centered on open/close animation. Verify with "New Project" and "Edit Project" triggers.

---

## Phase 4: User Story 2 - Create Button Is Fully Visible and Actionable (Priority: P1)

**Goal**: The footer (Cancel + Create buttons) is never clipped or hidden, even on short viewports.

**Independent Test**: Open modal on a 500px-tall viewport → footer buttons must be fully visible without scrolling.

### Implementation for User Story 2

- [x] T004 [US2] Add `display: flex; flex-direction: column;` to `.modal` in `src/features/projects/ProjectModal.module.css` (anchors footer at bottom)
- [x] T005 [US2] Add `overflow-y: auto; flex: 1;` to `.body` in `src/features/projects/ProjectModal.module.css` (body scrolls; footer stays fixed)

**Checkpoint**: Footer buttons visible on all viewport sizes. Resize browser to 500px height — Create button must remain fully visible.

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T006 Manual verification per `specs/001-fix-project-modal/quickstart.md`: open New Project, check centering, check footer, resize viewport, test Edit Project mode
- [x] T007 Run `npm test` from repo root and confirm existing Playwright tests pass without modification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 3 (US1)**: No prior phases needed — start immediately
- **Phase 4 (US2)**: T004 and T005 edit the same CSS file as T001, so complete Phase 3 first to avoid conflicts
- **Polish (Phase N)**: Depends on Phase 3 + Phase 4 complete

### User Story Dependencies

- **US1 (T001–T003)**: Independent — no dependency on US2
- **US2 (T004–T005)**: Independent — no dependency on US1, but edits the same CSS file so run after US1 to keep diffs clean

### Within Each User Story

- T001 before T002 (CSS change must exist before TSX references Framer Motion centering)
- T002 and T003 can run in parallel (different props on the same component, same file — treat as sequential to be safe)
- T004 and T005 are sequential (same CSS file)

### Parallel Opportunities

- T002 and T003 touch different parts of the same `motion.div` — a single developer can do both in one edit pass
- T004 and T005 touch different CSS rules — a single developer can do both in one edit pass

---

## Parallel Example: User Stories

```
# US1 and US2 are independent concerns, but edit the same files.
# Single developer — sequential is safest:
T001 → T002 → T003  (US1 complete)
T004 → T005          (US2 complete)
T006 → T007          (Polish)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (T001–T003) — modal is centered
2. **STOP and VALIDATE**: Open "New Project", confirm centering on multiple viewport sizes
3. If centered: proceed to Phase 4

### Incremental Delivery

1. T001–T003 → US1 done → modal centered ✅
2. T004–T005 → US2 done → footer always visible ✅
3. T006–T007 → verified and tested ✅

---

## Notes

- Only 2 files change: `ProjectModal.module.css` and `ProjectModal.tsx`
- No new dependencies, no Firestore changes, no data model changes
- Fix applies to both "New Project" (create) and "Edit Project" (edit) modes — same component
- Root cause documented in `specs/001-fix-project-modal/research.md`
