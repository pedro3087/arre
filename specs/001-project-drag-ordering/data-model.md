# Data Model: Project & Kanban Drag-and-Drop Priority Ordering

**Branch**: `001-project-drag-ordering` | **Date**: 2026-04-07

## Overview

All three key entities (`Project`, `KanbanStatus`, `Task`) already have an `order` field in the data model. No Firestore schema migrations are required. The changes are limited to:
1. Fixing the project query to sort by `order` instead of `createdAt`.
2. Adding a `reorderProjects()` operation (write path only).

---

## Entities

### Project

**Firestore path**: `users/{uid}/projects/{projectId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Document ID |
| `title` | string | yes | Display name |
| `color` | string | yes | One of the PROJECT_COLORS enum values |
| `order` | number | yes | Zero-based integer; lower = higher priority in left menu |
| `createdAt` | string (ISO) | yes | Used as tiebreaker for initial ordering |

**Changes**: No schema change. Query changed from `orderBy('createdAt')` → `orderBy('order')`.

**Ordering rules**:
- On create: `order = currentProjects.length` (already implemented)
- On reorder: all affected projects receive a new integer `order` value (0-based, contiguous)
- On delete: remaining projects are NOT re-indexed (gaps are acceptable; relative order is preserved)

---

### KanbanStatus (Kanban Column)

**Firestore path**: `users/{uid}/kanbanStatuses/{statusId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Document ID |
| `label` | string | yes | Column header text |
| `order` | number | yes | Zero-based integer; lower = leftmost on board |
| `isFinal` | boolean | yes | If true, moving a task here marks it complete |
| `createdAt` | string (ISO) | yes | Creation timestamp |

**Changes**: No schema change. The `reorderStatuses()` hook and query (`orderBy('order')`) already exist and work correctly.

---

### Task

**Firestore path**: `users/{uid}/tasks/{taskId}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Document ID |
| `title` | string | yes | Task title |
| `status` | string | yes | `'todo' \| 'completed' \| 'canceled' \| 'someday'` |
| `projectId` | string | no | References a Project document ID |
| `kanbanStatusId` | string | no | References a KanbanStatus document ID |
| `order` | number | no | Position within its kanban column; lower = higher in column |
| `createdAt` | string (ISO) | yes | Creation timestamp |
| `completedAt` | string (ISO) | no | Set when task moves to a final column |
| `updatedAt` | string (ISO) | no | Last modification timestamp |

**Changes**: No schema change. `reorderTasks()` already exists and writes correct `order` values. The kanban board UI needs to call it on intra-column card reorder.

**Key invariant**: `projectId` is the authoritative link between a task and its project. Reordering (of projects, columns, or tasks) MUST NOT modify `projectId`. This is guaranteed by the existing hook implementations.

---

## State Transitions

### Project Reorder

```
User drags project in Sidebar
  → optimistic UI update (local state reorder)
  → reorderProjects(newOrderedIds[]) called
    → Firestore batch: update each project doc with new order integer
  → onSnapshot fires → UI confirms persisted order
```

### Column Reorder (on board)

```
User drags column header on KanbanBoard
  → DragEndEvent fires with type='column'
  → arrayMove(columns, fromIndex, toIndex) → newOrder
  → reorderStatuses(newOrder.map(s => s.id)) called
    → Firestore batch: update each status doc with new order integer
  → useKanbanStatuses onSnapshot fires → board re-renders in new order
```

### Task Reorder (within column)

```
User drags card within same column
  → DragEndEvent fires with type='task', same source & dest column
  → arrayMove(columnTasks, fromIndex, toIndex) → reorderedTasks
  → reorderTasks(reorderedTasks) called
    → Firestore batch: update each task doc with new order integer
  → useTasks onSnapshot fires → column re-renders in new order
```

### Task Move (cross-column)

```
User drags card to different column (existing behaviour, unchanged)
  → DragEndEvent fires with type='task', different dest column
  → moveTask(taskId, toStatusId) called
    → Updates task.kanbanStatusId + status + completedAt if isFinal
```

---

## Firestore Security Rules

No changes required. The existing rules allow all field updates on projects, tasks, and kanbanStatuses as long as the core validation passes:

- `isValidProject()` checks `title` (string, non-empty) and `color` (string or null) — `order` updates pass through.
- `isValidTask()` checks `title`, `status` enum, and `projectId` — `order` updates pass through.
- `kanbanStatuses` has blanket read/write for owner — no validation function, all updates allowed.
