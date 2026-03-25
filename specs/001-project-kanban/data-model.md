# Data Model: Project Kanban Board

**Branch**: `001-project-kanban` | **Phase**: 1 | **Date**: 2026-03-24

---

## New Entity: KanbanStatus

Represents one column on the kanban board. Stored as a Firestore sub-collection document.

**Firestore path**: `users/{uid}/kanbanStatuses/{statusId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Firestore document ID (auto-generated) |
| `label` | string | yes | Display name for the column (e.g., "In Progress"). Max 50 chars. |
| `order` | number | yes | Integer controlling column position left-to-right. Lower = leftmost. |
| `isFinal` | boolean | yes | If `true`, dropping a task here marks it completed and moves it to Logbook. Exactly one status must have `isFinal: true` at all times. |
| `createdAt` | string | yes | ISO 8601 timestamp of creation. |

**Validation rules**:
- `label` must be non-empty and unique per user.
- `isFinal: true` must exist on exactly one document at all times; the system enforces this on write.
- `order` values must be unique; reordering uses a batch write to update all affected `order` fields atomically.
- A status document cannot be deleted if any task has `kanbanStatusId` pointing to it. The user must reassign those tasks first (or the UI reassigns them to the first column automatically on delete).

**Default seed data** (created on first Kanban page visit when no statuses exist):

```
{ label: "To Do",       order: 0, isFinal: false }
{ label: "In Progress", order: 1, isFinal: false }
{ label: "Done",        order: 2, isFinal: true  }
```

---

## Modified Entity: Task

The existing `Task` type gains one new optional field.

**Firestore path**: `users/{uid}/tasks/{taskId}` *(unchanged)*

**New field added**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `kanbanStatusId` | string \| undefined | no | ID of the `KanbanStatus` document this task is currently in. `undefined` means the task has not been explicitly placed; it falls into the first column on the kanban board. Cleared (set to `undefined`) when the task is completed via the final column. |

**No other Task fields change.** The existing `status: TaskStatus` field continues to drive all existing views (Today, Inbox, Logbook, etc.).

---

## State Transitions

### Task Moving Between Kanban Columns (non-final)

```
Task.kanbanStatusId = <source column id>
          │
          │ user drags to non-final column
          ▼
Task.kanbanStatusId = <destination column id>
Task.status unchanged
Task.updatedAt = now
```

### Task Moving to Final Column (auto-complete)

```
Task.kanbanStatusId = <any column id>
          │
          │ user drags to column where isFinal = true
          ▼
Task.status = 'completed'
Task.completedAt = now
Task.kanbanStatusId = undefined    ← cleared
Task.updatedAt = now
          │
          │ existing Logbook query picks up status='completed'
          ▼
Task appears in Logbook
```

### Task Un-completed from Logbook (reverse flow)

```
Task.status = 'todo'               ← existing Logbook un-complete action
Task.kanbanStatusId = undefined    ← remains undefined
          │
          │ task reappears in kanban board's first column (by default rule)
          ▼
Task visible in first column of kanban board for its project
```

---

## Entity Relationships

```
User
 ├── tasks/{taskId}              (existing)
 │    ├── projectId?  ──────────┐
 │    └── kanbanStatusId?  ─────┤──► KanbanStatus
 ├── projects/{projectId}  ◄────┘  (existing)
 └── kanbanStatuses/{statusId}  (new)
```

- One user → many Projects
- One user → many KanbanStatuses (global, not per-project)
- One Project → many Tasks (via `projectId` on Task)
- One KanbanStatus → many Tasks (via `kanbanStatusId` on Task)
- On the kanban board: filter Tasks by `projectId` = selected project; group by `kanbanStatusId` (or first column if undefined)

---

## Firestore Query Patterns

### Load kanban board for a project

```
Collection: users/{uid}/kanbanStatuses
Query: orderBy('order', 'asc')
→ Returns ordered list of columns

Collection: users/{uid}/tasks
Query: where('projectId', '==', selectedProjectId)
       where('status', '!=', 'completed')   ← exclude already-completed tasks
→ Returns all active tasks for the project; client groups by kanbanStatusId
```

### Move task to non-final column

```
Document: users/{uid}/tasks/{taskId}
Update: { kanbanStatusId: destinationStatusId, updatedAt: serverTimestamp() }
```

### Move task to final column (auto-complete)

```
Document: users/{uid}/tasks/{taskId}
Update: {
  status: 'completed',
  completedAt: serverTimestamp(),
  kanbanStatusId: deleteField(),
  updatedAt: serverTimestamp()
}
```

### Reorder kanban columns

```
Batch write:
  users/{uid}/kanbanStatuses/{id1} → { order: 0 }
  users/{uid}/kanbanStatuses/{id2} → { order: 1 }
  users/{uid}/kanbanStatuses/{id3} → { order: 2 }
```
