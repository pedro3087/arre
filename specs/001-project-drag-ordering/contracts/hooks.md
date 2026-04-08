# Hook Contracts: Project & Kanban Drag-and-Drop Priority Ordering

**Branch**: `001-project-drag-ordering` | **Date**: 2026-04-07

These contracts describe the public interface of hooks that are added or modified by this feature. Existing unchanged hooks are omitted.

---

## `useProjects` (modified)

**File**: `frontend/src/features/projects/hooks/useProjects.ts`

### Changes from current

| Change | Before | After |
|---|---|---|
| Firestore query sort | `orderBy('createdAt', 'asc')` | `orderBy('order', 'asc')` |
| New method | — | `reorderProjects(orderedIds: string[]): Promise<void>` |

### New method contract

```typescript
/**
 * Persists a new project display order to Firestore.
 * Writes a batch update assigning each project a new `order` integer
 * equal to its index in `orderedIds`.
 *
 * @param orderedIds - Array of project IDs in the desired display order,
 *                     from highest priority (index 0) to lowest.
 * @returns Promise that resolves when all Firestore writes complete.
 * @throws Firestore write errors propagate to the caller.
 */
reorderProjects(orderedIds: string[]): Promise<void>
```

**Behaviour**:
- Performs a single Firestore `WriteBatch` with one `update({ order: index })` per project.
- Does not mutate the local `projects` state; the `onSnapshot` listener will reflect the new order after the batch commits.
- Caller is responsible for optimistic local state if instant visual feedback is needed.

---

## `useKanbanBoard` (modified)

**File**: `frontend/src/features/kanban/hooks/useKanbanBoard.ts`

### Changes from current

| Change | Before | After |
|---|---|---|
| New method | — | `reorderColumns(orderedIds: string[]): Promise<void>` |
| New method | — | `reorderTasksInColumn(columnId: string, orderedTaskIds: string[]): Promise<void>` |

### New method contracts

```typescript
/**
 * Delegates to reorderStatuses() from useKanbanStatuses.
 * Convenience wrapper so KanbanBoard only imports one hook.
 *
 * @param orderedIds - Column (KanbanStatus) IDs in desired left-to-right order.
 */
reorderColumns(orderedIds: string[]): Promise<void>

/**
 * Reorders tasks within a single column.
 * Calls reorderTasks() with tasks sorted to match orderedTaskIds.
 *
 * @param columnId    - The KanbanStatus ID whose tasks are being reordered.
 * @param orderedTaskIds - Task IDs in the desired top-to-bottom order within the column.
 */
reorderTasksInColumn(columnId: string, orderedTaskIds: string[]): Promise<void>
```

---

## `KanbanBoard` component (modified)

**File**: `frontend/src/features/kanban/KanbanBoard.tsx`

### DragEnd routing logic (new)

```typescript
// In onDragEnd handler — branch on drag type
if (active.data.current?.type === 'column') {
  // Column reorder: call reorderColumns(newColumnOrder)
} else {
  // Task drag (existing logic)
  if (sourceColumnId === destColumnId) {
    // Same-column reorder: call reorderTasksInColumn(...)
  } else {
    // Cross-column move: call moveTask(...) [unchanged]
  }
}
```

### Data attributes on draggable elements

| Element | `data.current.type` | `data.current.id` |
|---|---|---|
| Column header drag handle | `'column'` | KanbanStatus ID |
| Task card | `'task'` | Task ID |

---

## `DraggableProjectList` component (new)

**File**: `frontend/src/features/projects/DraggableProjectList.tsx`

```typescript
interface DraggableProjectListProps {
  /** Ordered list of projects to display */
  projects: Project[];
  /** Currently active project ID (highlighted in sidebar) */
  activeProjectId: string | null;
  /** Called when user clicks a project (navigate to it) */
  onSelectProject: (projectId: string) => void;
  /** Called when user requests project edit */
  onEditProject: (project: Project) => void;
  /** Called when drag-drop completes with new ordered IDs */
  onReorder: (orderedIds: string[]) => void;
}
```

**Behaviour**:
- Uses `@dnd-kit/sortable`: `SortableContext` + `verticalListSortingStrategy`.
- Each project item uses `useSortable` with `id = project.id`.
- Drag handle is a dedicated icon element (not the whole row) to preserve click-to-navigate.
- Calls `onReorder` once on `DragEndEvent` (not on every drag-over).
- Shows `DragOverlay` of the dragged project row while in flight.
- Preserves all existing project row UI (color dot, name, edit button).

---

## `Sidebar` component (modified)

**File**: `frontend/src/layout/Sidebar.tsx`

### Changes from current

| Change | Before | After |
|---|---|---|
| Project list rendering | `projects.map(...)` with static `<li>` items | `<DraggableProjectList>` component |
| New prop | — | `onReorderProjects: (orderedIds: string[]) => void` |

### Updated props

```typescript
interface SidebarProps {
  // ... existing props unchanged ...
  onReorderProjects: (orderedIds: string[]) => void; // new
}
```
