# Research: Project & Kanban Drag-and-Drop Priority Ordering

**Branch**: `001-project-drag-ordering` | **Date**: 2026-04-07

## Decisions & Rationale

---

### Decision 1: Use @dnd-kit/sortable for project reordering in Sidebar

**Decision**: Extend `@dnd-kit/sortable` (already installed) to the project list in `Sidebar.tsx`, following the exact same pattern already used in `KanbanStatusManager.tsx`.

**Rationale**: Consistency. The app already has two drag-and-drop libraries coexisting (@dnd-kit for kanban, Framer Motion for task lists). Adding @dnd-kit to the Sidebar keeps it aligned with the kanban column reorder pattern (which is most similar in structure: a vertical list of named items). No new dependencies needed.

**Alternatives considered**:
- Framer Motion `Reorder` (already used in `ReorderableTaskList.tsx`): rejected because it's used only for task lists within page views, not for sidebar navigation items.
- react-beautiful-dnd: rejected — not installed, would add a new dependency.

---

### Decision 2: Kanban column drag-and-drop on the board itself (not just in settings)

**Decision**: Add column reordering directly to `KanbanBoard.tsx` by nesting a `SortableContext` (items = column IDs) inside the existing `DndContext`, using a drag handle on column headers. Distinguish column drags from task drags via the `active.data.current.type` convention (@dnd-kit data attribute).

**Rationale**: The spec (FR-003) requires column reordering on the board. `KanbanStatusManager.tsx` already has this for the settings view, but the board is a separate surface. The existing `DndContext` in `KanbanBoard.tsx` handles task drags; we extend it to handle both types by branching in `onDragEnd`.

**Alternatives considered**:
- Point users to the existing KanbanStatusManager (settings) for column reordering: rejected — the spec explicitly calls for board-level drag-and-drop.
- Separate `DndContext` wrappers for columns vs tasks: rejected — nested DndContexts cause pointer event conflicts in @dnd-kit; the recommended pattern is one context with type tagging.

**Implementation pattern (from @dnd-kit docs)**:
```
DndContext (onDragEnd branches on active.data.current.type)
  ├── SortableContext (column IDs, horizontalListSortingStrategy)
  │   └── KanbanColumn (useSortable, drag handle on header)
  └── Each KanbanColumn contains:
      └── SortableContext (task IDs within column, verticalListSortingStrategy)  [future FR-008]
          └── KanbanCard (useSortable / useDraggable)
```

---

### Decision 3: Task reordering within columns (FR-007/FR-008)

**Decision**: Migrate `KanbanCard` from `useDraggable` to `useSortable` within each column's `SortableContext`. The existing `reorderTasks()` hook method in `useTasks.ts` is already implemented — only the UI wiring is missing.

**Rationale**: `reorderTasks()` already writes correct Firestore batch updates. Task drag-between-columns (status change) via `moveTask()` also already exists in `useKanbanBoard.ts`. The gap is purely in the UI: cards need `useSortable` instead of `useDraggable`, and `onDragEnd` must handle same-column reordering vs cross-column moves.

**Alternatives considered**:
- Keep Framer Motion `Reorder` for task ordering within columns: rejected — Framer Motion's `Reorder` cannot be composed inside @dnd-kit's `DndContext` without losing drop coordination. Unifying on @dnd-kit avoids library conflicts.

---

### Decision 4: Project `order` field initialisation

**Decision**: On `addProject()`, assign `order = projects.length` (already done in `useProjects.ts`). Change the Firestore query from `orderBy('createdAt', 'asc')` to `orderBy('order', 'asc')`.

**Rationale**: The `ProjectDocument` type already has `order: number`. The only gap is that the query ignores it. Existing projects without a proper `order` value will need a one-time migration (assign order = index based on createdAt sort) handled in `reorderProjects()` on first drag.

**Alternatives considered**:
- Keep createdAt ordering and only change on drag: rejected — the order would reset on refresh unless persisted via the `order` field.
- Firestore compound index on (order, createdAt): not needed; single `order` field index is sufficient.

---

### Decision 5: Existing overlap with `002-task-drag-drop` branch

**Finding**: The `002-task-drag-drop` branch added `reorderTasks()` to `useTasks.ts` and `ReorderableTaskList.tsx`. Both are already present in the current `001-project-drag-ordering` branch (merged or cherry-picked). The Framer Motion approach is used for task list views (Inbox, Today, etc.) and is not the same surface as kanban task ordering.

**Decision**: The kanban board will use @dnd-kit for card ordering within columns (separate from the Framer Motion task list used in non-kanban views). The same `reorderTasks()` hook serves both.

---

## What Already Exists (No New Work Needed)

| Capability | Location | Status |
|---|---|---|
| `@dnd-kit/core`, `/sortable`, `/utilities` installed | package.json | ✅ ready |
| `order` field on Project | `firestore.ts` → `ProjectDocument` | ✅ exists |
| `order` field on KanbanStatus | `task.ts` → `KanbanStatus` | ✅ exists |
| `order` field on Task | `task.ts` → `Task` | ✅ optional, exists |
| `reorderStatuses(orderedIds[])` | `useKanbanStatuses.ts` | ✅ implemented |
| `reorderTasks(reorderedTasks[])` | `useTasks.ts` | ✅ implemented |
| Column drag-and-drop (settings view) | `KanbanStatusManager.tsx` | ✅ implemented |
| Task drag between columns | `KanbanBoard.tsx` + `useKanbanBoard.ts` | ✅ implemented |
| Firestore rules for all collections | `firestore.rules` | ✅ allow `order` updates |

## What Needs to Be Built

| Capability | File | Gap |
|---|---|---|
| `reorderProjects(orderedIds[])` | `useProjects.ts` | Missing method + query fix |
| Draggable project list | `Sidebar.tsx` or new `DraggableProjectList.tsx` | Missing UI |
| Column drag on board | `KanbanBoard.tsx` + `KanbanColumn.tsx` | Missing sortable wiring |
| Card sortable within column | `KanbanCard.tsx` + `KanbanBoard.tsx` | Missing sortable wiring |
