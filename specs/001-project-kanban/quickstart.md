# Quickstart: Project Kanban Board

**Branch**: `001-project-kanban` | **Date**: 2026-03-24

A developer guide for getting oriented with this feature's implementation scope.

---

## Prerequisites

- Node.js 18+
- Firebase project configured (existing `.env` or Firebase config)
- Run `npm install` from the repo root — no new setup needed beyond adding `@dnd-kit` packages

---

## New Dependency

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

This is the only new package. Everything else builds on existing stack (React 19, Framer Motion, Firebase, CSS Modules).

---

## New Files to Create

```
frontend/src/
├── features/kanban/
│   ├── KanbanBoard.tsx              # Board view: project picker + columns
│   ├── KanbanBoard.module.css
│   ├── KanbanColumn.tsx             # One status column + droppable area
│   ├── KanbanColumn.module.css
│   ├── KanbanCard.tsx               # Draggable task card
│   ├── KanbanCard.module.css
│   ├── KanbanStatusManager.tsx      # Settings UI for column management
│   ├── KanbanStatusManager.module.css
│   └── hooks/
│       ├── useKanbanStatuses.ts     # Firestore CRUD for KanbanStatus collection
│       └── useKanbanBoard.ts        # Board state + moveTask logic
└── pages/
    └── Kanban.tsx                   # Route page wrapper
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/shared/types/task.ts` | Add `kanbanStatusId?: string` to `Task` interface; add `KanbanStatus` type |
| `src/App.tsx` | Add `/kanban` route pointing to `Kanban` page |
| `src/layout/Sidebar.tsx` | Add Kanban nav link (with Columns or LayoutDashboard icon from Lucide) |
| `src/layout/BottomNav.tsx` | Add Kanban entry for mobile nav |
| `src/pages/Settings.tsx` | Add "Kanban Columns" section rendering `KanbanStatusManager` |

---

## Key Implementation Notes

### 1. Seeding default statuses

In `useKanbanStatuses`, on mount check if the `kanbanStatuses` collection is empty. If so, call `seedDefaults()` which writes the three default documents. This runs only once per user, on first Kanban page visit.

### 2. Grouping tasks with no kanbanStatusId

In `useKanbanBoard`, after loading tasks for the selected project:
```
const firstColumnId = statuses[0]?.id
tasksByColumn[firstColumnId] += tasks where kanbanStatusId === undefined
```
This ensures no task is ever "invisible" on the board.

### 3. Final column auto-complete

In `moveTask`, after identifying the destination status:
```
if (destinationStatus.isFinal) {
  update task: { status: 'completed', completedAt: now, kanbanStatusId: deleteField() }
} else {
  update task: { kanbanStatusId: destinationStatus.id }
}
```

### 4. DnD architecture with @dnd-kit

```
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={columnIds}>           // columns sortable in Settings
    {statuses.map(status => (
      <KanbanColumn key={status.id} ... />      // each column is a droppable
    ))}
  </SortableContext>
</DndContext>
```
Cards within each column use `useDraggable` from `@dnd-kit/core`. Columns use `useDroppable`. The `handleDragEnd` event extracts `active.id` (task ID) and `over.id` (column status ID) and calls `moveTask`.

### 5. Visual drag feedback

Use `DragOverlay` from `@dnd-kit/core` to render a floating preview of the card while dragging. The original card position can use reduced opacity (`opacity: 0.3`) to show the "hole" where it was.

---

## Running Tests

```bash
npm test
```

Playwright tests live in `/tests/`. Add new e2e tests in `/tests/kanban/` covering:
- Project selection shows filtered tasks
- Drag task between columns updates status
- Drag to final column moves task to Logbook
- Column management in Settings (add/rename/reorder)

---

## Firestore Structure (new)

```
users/
└── {uid}/
    ├── tasks/{taskId}              ← add kanbanStatusId field
    └── kanbanStatuses/{statusId}   ← new collection
        ├── label: string
        ├── order: number
        ├── isFinal: boolean
        └── createdAt: string
```

No Firestore security rule changes needed — existing user-scoped rules cover new sub-collections.
