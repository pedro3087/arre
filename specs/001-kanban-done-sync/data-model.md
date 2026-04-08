# Data Model: Kanban Done Sync

**Branch**: `001-kanban-done-sync` | **Date**: 2026-04-07

## Entities

### Task (`users/{uid}/tasks/{taskId}`)

Existing entity. Relevant fields for this feature:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `'todo' \| 'completed' \| 'canceled' \| 'someday'` | The task's completion state. Setting to `'completed'` is the single trigger that propagates across all views. |
| `completedAt` | `string` (ISO timestamp) or absent | Set when `status` becomes `'completed'`; deleted when reverted to `'todo'`. |
| `kanbanStatusId` | `string` (KanbanStatus ID) or absent | The kanban column the task belongs to. **Before this fix**: deleted when completing. **After this fix**: set to the Done column's ID when completing via drag. |
| `projectId` | `string` | Project the task belongs to. Used as the Firestore query filter on the kanban board. |

**State transitions relevant to this feature:**

```
[Any column, status=todo]
    │ drag to Done column (isFinal=true)
    ▼
[Done column, status=completed, completedAt=now, kanbanStatusId=doneColumnId]
    │ drag back to any other column
    ▼
[Other column, status=todo, completedAt deleted, kanbanStatusId=targetColumnId]

[Any column, status=todo]
    │ checkbox in Inbox / Anytime / Upcoming / Logbook
    ▼
[status=completed, completedAt=now, kanbanStatusId unchanged]
    → board grouping logic routes to Done column regardless of kanbanStatusId value
```

### KanbanStatus (`users/{uid}/kanbanStatuses/{statusId}`)

Existing entity. No changes to schema.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID. Referenced by `Task.kanbanStatusId`. |
| `label` | `string` | Display name (e.g., "Done"). |
| `order` | `number` | Sort order for column display. |
| `isFinal` | `boolean` | `true` for exactly one status per board — the completion column. Used by `moveTask` to trigger completion and by the new grouping logic to route completed tasks. |
| `createdAt` | `string` | ISO timestamp. |

## Invariants

1. Exactly one `KanbanStatus` per board has `isFinal: true` (enforced by `setFinalStatus` in `useKanbanStatuses.ts`).
2. A task with `status === 'completed'` is always displayed in the final kanban column, regardless of its stored `kanbanStatusId`.
3. A task with `status !== 'completed'` and a valid `kanbanStatusId` is displayed in its assigned column.
4. A task with `status !== 'completed'` and no valid `kanbanStatusId` is displayed in the first column (order=0).
5. `completedAt` is always present when `status === 'completed'` and absent otherwise.

## No Schema Changes Required

All fields already exist in the Firestore schema. This feature changes only the **write behavior** (stop deleting `kanbanStatusId`) and **read behavior** (include completed tasks in board, update grouping logic).
