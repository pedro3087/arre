# Quickstart: Project & Kanban Drag-and-Drop Priority Ordering

**Branch**: `001-project-drag-ordering` | **Date**: 2026-04-07

## Prerequisites

All dependencies are already installed. No `npm install` needed.

```bash
# Verify @dnd-kit packages are present
grep "@dnd-kit" frontend/package.json
```

## Local Development

```bash
# Start the frontend dev server
cd frontend
npm run dev
```

The app is a Firebase-connected React SPA. Firestore changes are real-time via `onSnapshot`.

## Testing the Feature

### Slice A+B: Project reordering in Sidebar

1. Open the app and ensure at least 2 projects exist (use "New Project" or the seed button in dev mode).
2. Hover over a project in the left sidebar — a grab handle icon should appear.
3. Drag the project up or down; a placeholder should show the drop target.
4. Release — the project should appear in the new position.
5. Refresh the page — the order should persist.
6. Click a project after reordering — only that project's tasks appear on the board.

### Slice C+D: Column reordering on the Kanban board

1. Open a project's Kanban board with at least 2 columns.
2. Hover over a column header — a grab handle icon should appear.
3. Drag the column left or right; adjacent columns shift to show the drop target.
4. Release — the column appears in the new position with its tasks intact.
5. Refresh or navigate away and back — column order persists.

### Slice E: Task reordering within a column

1. On a Kanban board, hover over a task card — a drag handle should appear.
2. Drag the card up or down within the same column.
3. Release — the card appears in the new position.
4. Refresh — the order persists.
5. Drag the card to a different column — existing status-change behaviour still works.

## Key Files to Understand

| File | Purpose |
|---|---|
| `frontend/src/features/projects/hooks/useProjects.ts` | Firestore CRUD + new `reorderProjects()` |
| `frontend/src/features/projects/DraggableProjectList.tsx` | New sortable project list component |
| `frontend/src/layout/Sidebar.tsx` | Left navigation panel |
| `frontend/src/features/kanban/KanbanBoard.tsx` | Main board — DndContext orchestration |
| `frontend/src/features/kanban/KanbanColumn.tsx` | Individual column — add `useSortable` |
| `frontend/src/features/kanban/KanbanCard.tsx` | Task card — switch to `useSortable` |
| `frontend/src/features/kanban/hooks/useKanbanBoard.ts` | Board state + new reorder delegates |
| `frontend/src/features/kanban/KanbanStatusManager.tsx` | Reference implementation of column sortable |
| `frontend/src/shared/types/task.ts` | Type definitions for Project, KanbanStatus, Task |

## Reference: Existing Sortable Pattern (KanbanStatusManager)

`KanbanStatusManager.tsx` is the best reference for the drag-and-drop pattern to replicate:

```typescript
// Pattern to follow for DraggableProjectList and KanbanBoard column sorting
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={ids} strategy={verticalListSortingStrategy}>
    {items.map(item => <SortableItem key={item.id} id={item.id} {...item} />)}
  </SortableContext>
</DndContext>

// In onDragEnd:
function handleDragEnd({ active, over }) {
  if (!over || active.id === over.id) return;
  const oldIndex = ids.indexOf(active.id);
  const newIndex = ids.indexOf(over.id);
  const newOrder = arrayMove(ids, oldIndex, newIndex);
  reorderStatuses(newOrder); // or reorderProjects(newOrder)
}
```

## Firestore Console Verification

To verify persistence during development, check the Firestore console:
- `users/{uid}/projects` — each document should have an `order` field (integer)
- `users/{uid}/kanbanStatuses` — each document should have `order` updated on column reorder
- `users/{uid}/tasks` — each document should have `order` updated on task reorder
