# Data Model: Real-time Productivity Velocity Updates on Task Toggle

**Branch**: `001-velocity-task-toggle` | **Date**: 2026-03-07

## Entities

### Task (Firestore: `users/{uid}/tasks/{taskId}`)

No new fields. One field changes storage type.

| Field         | Type                                   | Before Fix               | After Fix                         |
|---------------|----------------------------------------|--------------------------|-----------------------------------|
| `status`      | `'todo' \| 'completed' \| 'someday' \| 'canceled'` | unchanged | unchanged          |
| `completedAt` | `string \| undefined`                  | Firestore Timestamp or absent | ISO 8601 string or absent (deleted) |
| `updatedAt`   | Firestore Timestamp                    | unchanged                | unchanged                         |

**State transitions for `completedAt`**:

```
status: 'todo'        → completedAt: absent (deleteField)
status: 'completed'   → completedAt: new Date().toISOString()
status: 'someday'     → completedAt: unchanged (not touched)
status: 'canceled'    → completedAt: unchanged (not touched)
```

### VelocityDay (in-memory, computed by `useDashboardStats`)

No changes to shape. Populated correctly once the Firestore query type mismatch is fixed.

| Field        | Type     | Description                              |
|--------------|----------|------------------------------------------|
| `day`        | `string` | Short weekday label (e.g., "Mon")        |
| `completion` | `number` | Count of tasks completed on this date    |
| `dateStr`    | `string` | ISO date string YYYY-MM-DD               |

## Firestore Query (after fix)

**Collection**: `users/{uid}/tasks`
**Query**:
```
where('status', '==', 'completed')
where('completedAt', '>=', sevenDaysAgo.toISOString())   // string compared to string — valid
```

**Required index**: `status ASC, completedAt DESC` — already exists in the project.

## Validation Rules

- `completedAt` MUST be a valid ISO 8601 string when `status === 'completed'`.
- `completedAt` MUST be absent (field deleted) when `status === 'todo'`.
- These rules are enforced in `useTasks.ts` at write time; no Firestore security rule changes required.
