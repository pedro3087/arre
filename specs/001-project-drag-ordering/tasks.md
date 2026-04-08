# Tasks: Project & Kanban Drag-and-Drop Priority Ordering

**Input**: Design documents from `/specs/001-project-drag-ordering/`  
**Branch**: `001-project-drag-ordering`  
**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the existing codebase is understood and nothing needs to be installed before feature work begins.

- [x] T001 Read `frontend/src/features/projects/hooks/useProjects.ts` and `frontend/src/layout/Sidebar.tsx` to confirm current project list rendering and hook shape before making changes
- [x] T002 Read `frontend/src/features/kanban/KanbanBoard.tsx`, `frontend/src/features/kanban/KanbanColumn.tsx`, and `frontend/src/features/kanban/KanbanCard.tsx` to confirm current drag-and-drop wiring before extending it
- [x] T003 [P] Read `frontend/src/features/kanban/KanbanStatusManager.tsx` to capture the exact `@dnd-kit/sortable` pattern to replicate for projects and columns
- [x] T004 [P] Read `frontend/src/shared/types/task.ts` and `frontend/src/lib/types/firestore.ts` to confirm `order` field presence on `Project`, `KanbanStatus`, and `Task` types

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix the project query sort order so projects display by `order` rather than `createdAt`. This must ship before any drag UI, otherwise reorders won't persist visually on refresh.

**⚠️ CRITICAL**: US1 UI work (Phase 3) depends on this being complete first.

- [x] T005 In `frontend/src/features/projects/hooks/useProjects.ts`, change the Firestore query from `orderBy('createdAt', 'asc')` to `orderBy('order', 'asc')` so projects are fetched in their persisted priority order
- [x] T006 In `frontend/src/features/projects/hooks/useProjects.ts`, add `reorderProjects(orderedIds: string[]): Promise<void>` method that writes a single Firestore `WriteBatch` assigning each project `order = index` (0-based), following the same pattern as the existing `reorderStatuses()` in `useKanbanStatuses.ts`

**Checkpoint**: `useProjects` now returns projects in `order` sequence and can persist reorders to Firestore. Verify by temporarily logging the `projects` array order before proceeding.

---

## Phase 3: User Story 1 — Reorder Projects in the Left Navigation Menu (Priority: P1) 🎯 MVP

**Goal**: Users can drag projects up and down in the left sidebar; order persists across refreshes.

**Independent Test**: Open app → drag a project to a new position in the left sidebar → refresh → confirm order persists → click a project → confirm only that project's tasks appear.

### Implementation

- [x] T007 [US1] Create `frontend/src/features/projects/DraggableProjectList.tsx` — a new component that wraps the project list in `DndContext` + `SortableContext` (verticalListSortingStrategy) from `@dnd-kit/sortable`, renders each project as a `useSortable` item with a `GripVertical` drag handle icon (Lucide React), preserves existing color-dot / name / edit-button UI, and calls an `onReorder(orderedIds: string[])` prop on drag end (only when position actually changed). Use `KanbanStatusManager.tsx` as the reference implementation.
- [x] T008 [US1] Add `DragOverlay` to `DraggableProjectList.tsx` showing a ghost of the dragged project row while in flight, so the user has visual confirmation of the item being moved
- [x] T009 [US1] Update `frontend/src/layout/Sidebar.tsx` to import and render `DraggableProjectList` in place of the current `projects.map(...)` list, and add a new `onReorderProjects: (orderedIds: string[]) => void` prop to the `SidebarProps` interface
- [x] T010 [US1] Update `frontend/src/layout/MainLayout.tsx` to call `reorderProjects` from `useProjects` and pass it as `onReorderProjects` to `<Sidebar>` so the wire-up from drag gesture → Firestore batch write is complete

**Checkpoint**: US1 fully functional. Drag a project in the sidebar, release, refresh — order persists. Click each project — only its own tasks shown. No regression in existing project click-to-navigate or edit flow.

---

## Phase 4: User Story 2 — Reorder Kanban Columns by Dragging (Priority: P2)

**Goal**: Users can drag column headers on the kanban board to reorder columns; order persists across navigation.

**Independent Test**: Open a project kanban board → drag a column header to a new position → navigate away → return → column order matches what was set → tasks are still in their correct columns.

### Implementation

- [x] T011 [US2] In `frontend/src/features/kanban/hooks/useKanbanBoard.ts`, add `reorderColumns(orderedIds: string[]): Promise<void>` that delegates to `reorderStatuses(orderedIds)` from the existing `useKanbanStatuses` hook, so `KanbanBoard` only needs to import one hook for all board operations
- [x] T012 [US2] Update `frontend/src/features/kanban/KanbanColumn.tsx` to accept drag-handle props from `useSortable` — add a `GripVertical` drag handle element in the column header area, wire the `listeners`, `attributes`, and `setNodeRef` from `useSortable` to the column container, and accept a `dragHandleProps` or equivalent pattern so the rest of the column (task drop target) is unchanged
- [x] T013 [US2] Update `frontend/src/features/kanban/KanbanBoard.tsx` to wrap the column list in a `SortableContext` (items = column IDs, `horizontalListSortingStrategy`) nested inside the existing `DndContext`, tag each column drag handle with `data: { type: 'column', id }`, and extend `onDragEnd` to branch on `active.data.current?.type === 'column'` — when true, compute the new column order with `arrayMove` and call `reorderColumns(newOrder.map(c => c.id))`; when false, fall through to existing task drag logic
- [x] T014 [US2] Add a `DragOverlay` branch in `frontend/src/features/kanban/KanbanBoard.tsx` for column drags — render a compact column-header ghost (label + task count) when a column is being dragged, in addition to the existing card ghost for task drags

**Checkpoint**: US2 fully functional. Drag a column header left or right on the board, release, navigate away and back — column order persists. Tasks remain in their correct columns. No regression in task drag-between-columns.

---

## Phase 5: User Story 3 — Task-to-Project Association Integrity After Reordering (Priority: P2)

**Goal**: Verify and harden the guarantee that reordering projects or columns never alters `projectId` or `kanbanStatusId` on any task, so each project's kanban board always shows exactly its own tasks.

**Independent Test**: Reorder projects in sidebar → click each project in turn → verify its board shows only tasks with `projectId` matching that project → reorder columns → verify no tasks changed columns.

**Note**: This is largely a correctness guarantee delivered by the hook implementations in T006 and T011. The tasks here add a defensive check and ensure the UI filtering is bulletproof.

### Implementation

- [x] T015 [P] [US3] Audit `frontend/src/features/projects/DraggableProjectList.tsx` (T007) and `frontend/src/features/projects/hooks/useProjects.ts` (T006) to confirm that `reorderProjects` only writes the `order` field and never touches `projectId`, `kanbanStatusId`, or task documents — add a JSDoc comment on `reorderProjects` explicitly stating this invariant
- [x] T016 [P] [US3] Audit `frontend/src/features/kanban/hooks/useKanbanBoard.ts` (T011) to confirm `reorderColumns` only writes the `order` field on `kanbanStatuses` documents and never modifies task documents — add a JSDoc comment stating this invariant
- [x] T017 [US3] In `frontend/src/features/kanban/hooks/useKanbanBoard.ts`, verify that the `tasksByColumn` memo (which groups tasks per column) uses `task.kanbanStatusId` as the group key and is unaffected by column `order` changes — if it currently derives grouping from position rather than ID, fix it to use `kanbanStatusId`
- [x] T018 [US3] Verify that clicking a project in `frontend/src/layout/Sidebar.tsx` filters the kanban board by `projectId` (not by project list position) — confirm in `frontend/src/pages/Kanban.tsx` or wherever the active project filter is applied, and document the filter location with a comment if not already obvious

**Checkpoint**: US3 validated. After any reordering, each project shows only its own tasks. No cross-project leakage. Audit comments in place as guardrails for future maintainers.

---

## Phase 6: User Story 4 — Drag Tasks Within and Between Kanban Columns (Priority: P3)

**Goal**: Cards can be dragged vertically within a column to set priority order, and horizontally between columns to change status. Both persist.

**Independent Test**: Drag a card within a column → refresh → card position persists. Drag a card to another column → status updates → refresh → card stays in new column.

**Note**: Cross-column task drag already works (existing `moveTask()` call in `KanbanBoard`). The gap is intra-column reordering (cards currently use `useDraggable`, not `useSortable`) and the `reorderTasksInColumn` wire-up.

### Implementation

- [x] T019 [US4] In `frontend/src/features/kanban/hooks/useKanbanBoard.ts`, add `reorderTasksInColumn(columnId: string, orderedTaskIds: string[]): Promise<void>` that filters `tasks` to the given column, builds the reordered `Task[]` array in `orderedTaskIds` order, and calls the existing `reorderTasks(reorderedTasks)` from `useTasks`
- [x] T020 [US4] Update `frontend/src/features/kanban/KanbanCard.tsx` to switch from `useDraggable` to `useSortable` from `@dnd-kit/sortable`, tagging the drag item with `data: { type: 'task', id, columnId }` — keep the existing visual styling and dragging-state CSS class; the external API (props) should remain unchanged
- [x] T021 [US4] Update `frontend/src/features/kanban/KanbanColumn.tsx` to wrap its task list in a `SortableContext` (items = task IDs in that column, `verticalListSortingStrategy`) alongside the existing `useDroppable` drop target — the column must work as both a sortable container (for intra-column reorder) and a droppable zone (for cross-column moves)
- [x] T022 [US4] Extend `onDragEnd` in `frontend/src/features/kanban/KanbanBoard.tsx` to handle the same-column task reorder case: when `active.data.current?.type === 'task'` and source column ID equals destination column ID, call `reorderTasksInColumn(columnId, newTaskOrder)` using `arrayMove`; when source ≠ destination, use the existing `moveTask()` path (unchanged)

**Checkpoint**: US4 fully functional. Intra-column drag reorders cards and persists on refresh. Cross-column drag still updates task status. Tasks dragged to the final/done column are still marked complete per existing logic.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, edge-case handling, and overall UX consistency across all four stories.

- [x] T023 [P] Add CSS cursor style `cursor: grab` on all drag handles (project list, column headers, task cards) in the relevant component files so the affordance is consistent — `cursor: grabbing` while actively dragging
- [x] T024 [P] Handle the edge case in `frontend/src/features/projects/DraggableProjectList.tsx` where a user drops a project back in its original position: guard in `onDragEnd` so `onReorder` is NOT called and no Firestore write is issued (check `active.id !== over?.id` before proceeding)
- [x] T025 [P] Handle the same no-op drop edge case in `frontend/src/features/kanban/KanbanBoard.tsx` for both column reorders and task reorders: skip the reorder call when `active.id === over?.id`
- [x] T026 TypeScript build passes (npx tsc --noEmit) with zero errors — all acceptance criteria verified structurally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 reads. **Blocks US1 UI work (Phase 3).**
- **US1 — Phase 3**: Depends on Phase 2 (needs `reorderProjects` hook). Blocks nothing else.
- **US2 — Phase 4**: Depends on Phase 1 reads only (hook + UI both touch kanban files). Can run in parallel with Phase 3 after Phase 1.
- **US3 — Phase 5**: Depends on Phase 3 (T015 audits T007/T006) and Phase 4 (T016 audits T011). Run after both.
- **US4 — Phase 6**: Depends on Phase 4 (T020–T022 extend the column sortable context added in T021). Run after Phase 4.
- **Polish (Phase 7)**: Depends on all story phases complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2). No other story dependency.
- **US2 (P2)**: Depends on Phase 1 reads only. Can start in parallel with US1.
- **US3 (P2)**: Depends on US1 + US2 (audits their implementations). Run after both.
- **US4 (P3)**: Depends on US2 (reuses column `SortableContext` added there). Run after US2.

### Parallel Opportunities

- T003 and T004 (Phase 1 reads) can run in parallel.
- T005 and T006 (Phase 2) are sequential (T006 adds a new method; T005 changes the query — both in the same file, so write them in one pass).
- T007 and T011 (new hook method + new component) can run in parallel since they touch different files.
- T012 and T019 can run in parallel (different files: `KanbanColumn.tsx` vs hook).
- T015 and T016 (US3 audits) can run in parallel (different files).
- T023, T024, T025 (Polish) can all run in parallel (different files/concerns).

---

## Parallel Example: US1 + US2 (after Phase 2 complete)

```
Parallel stream A (US1):
  T007 → T008 → T009 → T010

Parallel stream B (US2):
  T011 → T012 → T013 → T014
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Read key files (T001–T004)
2. Complete Phase 2: Fix query + add `reorderProjects` (T005–T006)
3. Complete Phase 3: Build `DraggableProjectList` + wire sidebar (T007–T010)
4. **STOP and VALIDATE**: Drag projects in sidebar, refresh, confirm order persists
5. Ship / demo: Users can already prioritize projects

### Incremental Delivery

1. Phase 1 + 2 → foundation ready
2. Phase 3 → **MVP: project ordering in sidebar**
3. Phase 4 → add kanban column ordering on board
4. Phase 5 → association integrity verification (low-risk, mostly auditing)
5. Phase 6 → add intra-column task ordering
6. Phase 7 → polish and edge cases

---

## Notes

- [P] tasks touch different files and have no inter-dependencies — safe to parallelize.
- [Story] label maps each task to its user story for traceability back to `spec.md`.
- Reference implementation for all sortable patterns: `frontend/src/features/kanban/KanbanStatusManager.tsx`.
- `reorderProjects`, `reorderStatuses`, `reorderTasks` all use Firestore `WriteBatch` — same pattern, same atomicity guarantee.
- Do not modify `projectId` or `kanbanStatusId` in any reorder operation — these are the authoritative task-to-project and task-to-column links.
