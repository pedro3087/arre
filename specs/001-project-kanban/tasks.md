# Tasks: Project Kanban Board

**Input**: Design documents from `/specs/001-project-kanban/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ui-contracts.md ✅, quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the new dependency and extend shared types before any feature code is written.

- [x] T001 Install @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities via npm in the frontend directory
- [x] T002 Add `KanbanStatus` type and extend `Task` interface with `kanbanStatusId?: string` in `frontend/src/shared/types/task.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data and hooks that ALL user stories depend on. Must be complete before any story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Implement `useKanbanStatuses` hook with Firestore real-time listener, CRUD operations (addStatus, updateStatus, deleteStatus, reorderStatuses), and `seedDefaults` in `frontend/src/features/kanban/hooks/useKanbanStatuses.ts`
- [x] T004 Implement `useKanbanBoard` hook that accepts a `projectId`, loads tasks for that project filtered by non-completed status, groups tasks by `kanbanStatusId` (placing undefined-kanbanStatusId tasks into first column), and exposes `moveTask` with auto-complete logic for final column in `frontend/src/features/kanban/hooks/useKanbanBoard.ts`
- [x] T005 [P] Create `KanbanCard` component (draggable task card showing title, tags, energy, date metadata) with `useDraggable` from @dnd-kit/core and `DragOverlay` preview in `frontend/src/features/kanban/KanbanCard.tsx` and `frontend/src/features/kanban/KanbanCard.module.css`
- [x] T006 [P] Create `KanbanColumn` component (droppable area using `useDroppable` from @dnd-kit/core, renders column header with label and final-column indicator, renders task cards, applies drop-zone highlight when `isOver`) in `frontend/src/features/kanban/KanbanColumn.tsx` and `frontend/src/features/kanban/KanbanColumn.module.css`

**Checkpoint**: Hooks and base components ready — user story phases can now begin.

---

## Phase 3: User Story 1 — View Project Kanban Board (Priority: P1) 🎯 MVP

**Goal**: Users can navigate to the Kanban view, select a project, and see all its tasks arranged in status columns.

**Independent Test**: Navigate to `/kanban`, select a project from the picker, and verify only tasks for that project appear in the correct columns. Verify empty state shows when no project is selected or the project has no tasks.

### Implementation for User Story 1

- [x] T007 [US1] Create `KanbanBoard` component with `DndContext` wrapping, project picker UI (list of projects with color dots), column rendering loop, `handleDragEnd` dispatcher, and empty states (no projects / no tasks) in `frontend/src/features/kanban/KanbanBoard.tsx` and `frontend/src/features/kanban/KanbanBoard.module.css`
- [x] T008 [US1] Create `Kanban` page component that wraps `KanbanBoard` and calls `seedDefaults` on first mount (if no statuses exist) in `frontend/src/pages/Kanban.tsx`
- [x] T009 [US1] Add `/kanban` route to the router and wrap with `ProtectedRoute` in `frontend/src/App.tsx`
- [x] T010 [P] [US1] Add Kanban nav link (using `LayoutDashboard` icon from Lucide React) to the sidebar navigation list in `frontend/src/layout/Sidebar.tsx`
- [x] T011 [P] [US1] Add Kanban entry to the mobile bottom navigation bar in `frontend/src/layout/BottomNav.tsx`

**Checkpoint**: Navigate to `/kanban`, select a project, verify tasks display in columns. US1 fully functional.

---

## Phase 4: User Story 2 — Drag and Drop Tasks Between Columns (Priority: P2)

**Goal**: Users can drag a task card from one column and drop it onto another column to update its status, with immediate Firestore persistence.

**Independent Test**: On the kanban board with a project selected, drag a task card from column A to column B. Verify the card appears in column B after the drop, and that refreshing the page shows the task still in column B.

### Implementation for User Story 2

- [x] T012 [US2] Wire `DndContext`'s `onDragEnd` in `KanbanBoard` to call `moveTask(activeTaskId, overColumnStatusId)` from `useKanbanBoard`; handle the case where the drop target is the same column (no-op) in `frontend/src/features/kanban/KanbanBoard.tsx`
- [x] T013 [US2] Add drag-in-progress visual feedback: render a `DragOverlay` with a clone of the dragged `KanbanCard` at full opacity while dragging; reduce source card opacity to 0.3 during drag in `frontend/src/features/kanban/KanbanBoard.tsx` and `frontend/src/features/kanban/KanbanCard.module.css`
- [x] T014 [US2] Implement drop-zone highlight in `KanbanColumn`: apply a visual highlight CSS class when the column's `useDroppable` reports `isOver: true` in `frontend/src/features/kanban/KanbanColumn.tsx` and `frontend/src/features/kanban/KanbanColumn.module.css`
- [x] T015 [US2] Implement optimistic UI update in `useKanbanBoard.moveTask`: update local `tasksByColumn` state immediately before the Firestore write resolves, then revert on error, in `frontend/src/features/kanban/hooks/useKanbanBoard.ts`

**Checkpoint**: Drag a task between columns — card moves visually and status persists after page refresh. US2 fully functional.

---

## Phase 5: User Story 3 — Auto-Close Task on Final Column (Priority: P3)

**Goal**: Dropping a task into the final (Done) column automatically marks it completed, removes it from the board, and makes it appear in the Logbook.

**Independent Test**: Drag a task to the "Done" column. Verify it disappears from the kanban board immediately. Navigate to Logbook and verify the task appears there with today's completion date. Un-complete the task from Logbook and verify it reappears in the first kanban column.

### Implementation for User Story 3

- [x] T016 [US3] Ensure `moveTask` in `useKanbanBoard` checks `destinationStatus.isFinal` and, when true, writes `{ status: 'completed', completedAt: serverTimestamp(), kanbanStatusId: deleteField() }` to the task document instead of a regular status column update in `frontend/src/features/kanban/hooks/useKanbanBoard.ts`
- [x] T017 [US3] Add a visual indicator (badge or icon) on the final column header in `KanbanColumn` to signal to users that dropping here completes the task in `frontend/src/features/kanban/KanbanColumn.tsx` and `frontend/src/features/kanban/KanbanColumn.module.css`
- [x] T018 [US3] Verify the Logbook query in `frontend/src/features/tasks/hooks/useTasks.ts` already filters by `status === 'completed'` (read the file); add no changes if already correct, or adjust the query to include tasks completed via kanban if needed

**Checkpoint**: Drag to final column — task gone from board, visible in Logbook. Un-complete restores to first column. US3 fully functional.

---

## Phase 6: Kanban Column Settings (Cross-Story Polish)

**Purpose**: Allow users to manage the global kanban columns (add, rename, reorder, set final). Completes the user-configurability requirement from the spec.

- [x] T019 Create `KanbanStatusManager` component with: sortable column list using `@dnd-kit/sortable`, inline label editing (click-to-edit), add-column button, delete button (disabled when tasks assigned), and radio-style "Final" toggle in `frontend/src/features/kanban/KanbanStatusManager.tsx` and `frontend/src/features/kanban/KanbanStatusManager.module.css`
- [x] T020 Add a "Kanban Columns" section to the existing Settings page that renders `KanbanStatusManager` in `frontend/src/pages/Settings.tsx`
- [x] T021 [P] Add `deleteStatus` guard in `useKanbanStatuses`: before deleting a status document, query tasks where `kanbanStatusId == statusId`; throw an error (surfaced in UI as a tooltip/message) if any tasks are assigned in `frontend/src/features/kanban/hooks/useKanbanStatuses.ts`
- [x] T022 [P] Ensure `isFinal` toggle in `KanbanStatusManager` uses a Firestore batch write to unset `isFinal: false` on the previous final column and set `isFinal: true` on the new one atomically in `frontend/src/features/kanban/hooks/useKanbanStatuses.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass across all stories.

- [x] T023 [P] Add empty-column placeholder (faint dashed border or "Drop tasks here" text) so empty columns remain droppable and visually meaningful in `frontend/src/features/kanban/KanbanColumn.tsx` and `frontend/src/features/kanban/KanbanColumn.module.css`
- [x] T024 [P] Handle loading state in `KanbanBoard`: show a skeleton or spinner while `useKanbanBoard` is loading tasks or statuses in `frontend/src/features/kanban/KanbanBoard.tsx`
- [x] T025 [P] Handle error state in `KanbanBoard`: show an error message if Firestore fails to load tasks or statuses in `frontend/src/features/kanban/KanbanBoard.tsx`
- [x] T026 Audit all new CSS modules for consistency with existing app design tokens (colors, spacing, typography) defined in `frontend/src/styles/variables.css`; update `KanbanBoard.module.css`, `KanbanColumn.module.css`, `KanbanCard.module.css`, `KanbanStatusManager.module.css`
- [x] T027 Validate the full end-to-end flow against the acceptance scenarios in `specs/001-project-kanban/spec.md`: project selection, drag between columns, final column auto-complete, Logbook appearance, Settings column management

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T001, T002 complete)
- **US1 Phase 3**: Depends on Phase 2 — especially T003, T004, T005, T006
- **US2 Phase 4**: Depends on Phase 3 (KanbanBoard must exist to wire drag events)
- **US3 Phase 5**: Depends on Phase 4 (drag-end wiring must exist to intercept final column)
- **Settings Phase 6**: Can start after Phase 2 (foundational hooks exist); independent of US2/US3
- **Polish Phase 7**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Requires Phase 1 + Phase 2 complete. No dependency on US2 or US3.
- **US2 (P2)**: Requires US1 complete (extends KanbanBoard drag wiring).
- **US3 (P3)**: Requires US2 complete (extends moveTask in the same hook).
- **Settings**: Can run in parallel with US2/US3 after Phase 2.

### Within Each Phase

- Models/types before hooks (T001-T002 before T003-T004)
- Hooks before components (T003-T004 before T005-T006)
- Components before page + routing (T005-T007 before T008-T011)
- Tasks marked [P] within a phase have no inter-dependencies and can be done simultaneously

### Parallel Opportunities

- T005 and T006 (KanbanCard, KanbanColumn) — different files, no mutual dependency
- T010 and T011 (Sidebar, BottomNav) — different files
- T021 and T022 (Settings guards) — different concerns in same file, but sequential writes are safe
- T023, T024, T025, T026 (Polish) — all different files

---

## Parallel Example: Phase 2 Foundational

```
Can run simultaneously after T001+T002:
  Task T003: useKanbanStatuses hook  (frontend/src/features/kanban/hooks/useKanbanStatuses.ts)
  Task T004: useKanbanBoard hook     (frontend/src/features/kanban/hooks/useKanbanBoard.ts)
  Task T005: KanbanCard component    (frontend/src/features/kanban/KanbanCard.tsx)
  Task T006: KanbanColumn component  (frontend/src/features/kanban/KanbanColumn.tsx)
```

## Parallel Example: User Story 1

```
After T007 (KanbanBoard) and T008 (Kanban page) complete:
  Task T009: Add /kanban route       (frontend/src/App.tsx)
  Task T010: Sidebar nav link        (frontend/src/layout/Sidebar.tsx)
  Task T011: BottomNav entry         (frontend/src/layout/BottomNav.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Install @dnd-kit, extend Task type
2. Complete Phase 2: Hooks + base components (the most complex part)
3. Complete Phase 3: KanbanBoard page, route, nav links
4. **STOP and VALIDATE**: Select a project, verify tasks appear in columns
5. Ship MVP — users can see their project tasks in kanban view

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Phase 3 → Users can **view** project kanban board (US1 ✅)
3. Phase 4 → Users can **drag** tasks between columns (US2 ✅)
4. Phase 5 → Tasks **auto-complete** to Logbook on final column (US3 ✅)
5. Phase 6 → Users can **configure** columns in Settings
6. Phase 7 → Polish complete

### Parallel Team Strategy

With two developers after Phase 2:
- **Developer A**: Phase 3 → Phase 4 → Phase 5 (core board experience)
- **Developer B**: Phase 6 (Settings column management)
- Both join for Phase 7 polish

---

## Notes

- [P] tasks = different files, no blocking inter-dependencies within the same phase
- T018 is a read-verify task — check useTasks.ts before writing anything; it may need zero changes
- The `seedDefaults` call (T008) only fires once per user, guarded by checking if the collection is empty
- T015 (optimistic UI) is important for perceived performance — implement alongside T012, not as an afterthought
- Framer Motion can still be used for card entrance/exit animations within columns without conflicting with @dnd-kit drag handling
