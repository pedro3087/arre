# Tasks: Kanban Done Sync

**Input**: Design documents from `/specs/001-kanban-done-sync/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Key Finding**: Cross-view sync (Inbox, Logbook, all views) already works via Firestore real-time listeners. All four changes are in a single file: `src/features/kanban/hooks/useKanbanBoard.ts`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies, packages, or files required. Existing Firebase, dnd-kit, and React setup is sufficient.

- [x] T001 Confirm current branch is `001-kanban-done-sync` and working directory is clean (`git status`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No schema changes required — Task and KanbanStatus Firestore collections are already correct. No foundational work needed before user story implementation.

- [x] T002 Read and understand `src/features/kanban/hooks/useKanbanBoard.ts` in full before making any changes — note the four locations that need modification: (1) onSnapshot filter line 44, (2) optimistic update line 86, (3) Firestore write lines 99–103, (4) tasksByColumn memo lines 58–75

**Checkpoint**: Ready to implement — single file, four targeted changes

---

## Phase 3: User Story 1 — Mark Task Complete via Kanban (Priority: P1) 🎯 MVP

**Goal**: Dragging a task to the Done column marks it complete AND keeps it visible in that column. Dragging it back reverses the completion.

**Independent Test**: Open a kanban board, drag a task to Done — card stays in Done column, shows completed state. Drag it back — card moves to the target column, shows active state.

### Implementation for User Story 1

- [x] T003 [US1] In `src/features/kanban/hooks/useKanbanBoard.ts` onSnapshot handler (line 44): remove the `.filter((t) => t.status !== 'completed')` client-side filter so completed tasks are included in board state
- [x] T004 [US1] In `src/features/kanban/hooks/useKanbanBoard.ts` moveTask optimistic update (line 85–86): replace `setTasks((prev) => prev.filter((t) => t.id !== taskId))` with a `map` call that updates the task's `status` to `'completed'` and `kanbanStatusId` to `toStatusId`, keeping the card in local state
- [x] T005 [US1] In `src/features/kanban/hooks/useKanbanBoard.ts` moveTask Firestore write (line 101): replace `kanbanStatusId: deleteField()` with `kanbanStatusId: toStatusId` so the Done column association is persisted to Firestore
- [x] T006 [US1] In `src/features/kanban/hooks/useKanbanBoard.ts` tasksByColumn memo (lines 58–75): add a `finalColumnId` variable (`statuses.find((s) => s.isFinal)?.id`); in the task-grouping loop, route any task where `t.status === 'completed'` to `finalColumnId` (regardless of stored `kanbanStatusId`), and only fall back to `firstColumnId` for non-completed tasks with no valid `kanbanStatusId`

**Checkpoint**: User Story 1 complete — drag to Done keeps card visible, drag back reverses it. Verify with quickstart.md steps 1–4 and 15–18.

---

## Phase 4: User Story 2 + User Story 4 — Cross-View Sync (Priority: P2)

**Goal**: Completing a task via kanban automatically updates the Inbox and all other task-list views. No code changes needed — Firestore real-time listeners already propagate `status` changes.

**Independent Test**: Drag a task to Done on kanban, navigate to Inbox — task is gone from active list. Navigate to any project view or dashboard — task shows as completed.

### Verification for User Story 2 + 4

- [ ] T007 [P] [US2] Manually verify: drag a task to Done on the Kanban board, then open the Inbox — confirm the task no longer appears in the active task list (uses quickstart.md step 5–6)
- [ ] T008 [P] [US4] Manually verify: drag a task to Done on the Kanban board, navigate to the project list view and any other page that displays tasks — confirm the task is shown as completed without a page refresh (uses quickstart.md step 12–14)
- [ ] T009 [US2] Manually verify: mark an active project task complete via Inbox checkbox, then open the Kanban board for that project — confirm the task appears in the Done column (FR-008, quickstart.md step 12–14)

**Checkpoint**: Cross-view sync confirmed working — Inbox and all views reflect kanban completion in real time.

---

## Phase 5: User Story 3 — Logbook Sync (Priority: P3)

**Goal**: Tasks completed via the kanban board appear in the Logbook, sorted by completion time. No code changes needed.

**Independent Test**: Drag a task to Done, navigate to Logbook — task appears at the top with the correct completion timestamp.

### Verification for User Story 3

- [ ] T010 [P] [US3] Manually verify: drag a task to Done on the Kanban board, navigate to the Logbook — confirm the task appears at the top, sorted by `completedAt` DESC (uses quickstart.md step 7–9)
- [ ] T011 [P] [US3] Manually verify: the task in Logbook has a completion timestamp that matches when the drag action occurred — no special "kanban-completed" label vs tasks completed via other means (FR-008, quickstart.md step 9)

**Checkpoint**: Logbook sync confirmed — all completed tasks appear regardless of completion method.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge case validation and board reload persistence.

- [ ] T012 Manually verify: drag a task to Done, refresh the Kanban board page — task still appears in Done column (persistence, quickstart.md step 10–11)
- [ ] T013 [P] Manually verify: drag a task to Done then immediately drag it back to In Progress — both completion state and kanban column are correct with no stale data (SC-006, quickstart.md step 15–18)
- [ ] T014 [P] Manually verify: mark a project task as complete via checkbox in the Anytime or Upcoming view, open its project's Kanban board — task appears in the Done column (FR-008)
- [x] T015 Run `npm run lint` in the frontend directory to confirm no TypeScript or lint errors were introduced by the changes to `src/features/kanban/hooks/useKanbanBoard.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1** (T001): No dependencies — start immediately
- **Phase 2** (T002): Depends on T001
- **Phase 3** (T003–T006): Depends on T002 — BLOCKS verification phases
- **Phase 4** (T007–T009): Depends on Phase 3 completion
- **Phase 5** (T010–T011): Depends on Phase 3 completion — can run in parallel with Phase 4
- **Phase 6** (T012–T015): Depends on Phase 3 completion — can run in parallel with Phases 4 and 5

### User Story Dependencies

- **US1 (P1)**: Only story requiring code changes — must complete before any verification
- **US2 (P2)**: Independent of US1 implementation; verification depends on US1 being done
- **US3 (P3)**: Independent of US1 implementation; verification depends on US1 being done
- **US4 (P2)**: Independent of US1 implementation; verification depends on US1 being done

### Within User Story 1

All four tasks (T003–T006) modify the same file. Execute in order to avoid mid-file inconsistencies:

1. T003 — remove the filter (simplest change, no logic)
2. T004 — fix optimistic update (affects local state only)
3. T005 — fix Firestore write (affects persisted data)
4. T006 — fix grouping logic (depends on understanding the full local state shape after T003–T005)

---

## Parallel Opportunities

```bash
# Phase 3: All in same file — execute sequentially (T003 → T004 → T005 → T006)

# Phase 4 + Phase 5 can run in parallel after Phase 3:
Task: T007 [US2] Verify Inbox removes completed task
Task: T008 [US4] Verify all-views consistency
Task: T010 [US3] Verify Logbook shows completed task
Task: T011 [US3] Verify Logbook timestamp + equality

# Phase 6 can also run concurrently with Phase 4 + 5:
Task: T012 Persistence after board refresh
Task: T013 Drag-Done-then-back edge case
Task: T014 Completion via other views → kanban Done column
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete T001–T002 (Setup + read the file)
2. Complete T003–T006 (all four changes in `useKanbanBoard.ts`)
3. **Validate**: Drag to Done → card stays in Done column. Drag back → card leaves Done column. ✅
4. **Done** — all sync is automatic from here.

### Full Delivery

1. MVP above → validates core behavior
2. Run T007–T011 → confirms all views already sync correctly
3. Run T012–T015 → edge cases + lint check
4. Open PR on branch `001-kanban-done-sync`

---

## Notes

- All four code changes are in `src/features/kanban/hooks/useKanbanBoard.ts` — no other files need modification
- Inbox, Logbook, and all other views already sync via Firestore `onSnapshot` — only board display is broken
- The `isFinal` flag on `KanbanStatus` is the canonical signal for the Done column — do not hardcode column names
- Completed tasks without a `kanbanStatusId` (completed via checkbox) must land in the final column on the board — handle this in T006's grouping logic
