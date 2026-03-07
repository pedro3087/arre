# Research: Real-time Productivity Velocity Updates on Task Toggle

**Branch**: `001-velocity-task-toggle` | **Date**: 2026-03-07

## Decision 1: How to store `completedAt` in Firestore

**Decision**: Store `completedAt` as an ISO 8601 string (e.g., `new Date().toISOString()`).

**Rationale**: The existing `Task` TypeScript interface already declares `completedAt?: string`. The rest of the codebase (parsing logic in `useTasks.ts`, the `Task` type, mock data) treats dates as ISO strings. Switching to a consistent ISO string removes the cross-type comparison failure in the Firestore query.

**Alternatives considered**:
- **Keep Firestore Timestamp (`serverTimestamp()`) and fix the query** — would require importing `Timestamp` and using `Timestamp.fromDate(sevenDaysAgo)` as the query boundary. More verbose and introduces a Firestore-specific type into query logic. Rejected in favor of the simpler ISO string approach that matches existing types.
- **Use `FieldValue.serverTimestamp()` + client-side timestamp** — two writes per operation, adds complexity. Rejected.

---

## Decision 2: How to clear `completedAt` on uncomplete

**Decision**: Use Firestore's `deleteField()` sentinel to remove the field from the document.

**Rationale**: Setting `completedAt: null` would leave a null-valued field, which could cause issues in the query (`where('completedAt', '>=', ...)` with a null field). Deleting the field entirely is the cleanest approach and matches FR-003 ("clear the completion timestamp").

**Alternatives considered**:
- **Set to `null`** — leaves the field present; Firestore range queries on null are undefined behavior. Rejected.
- **Set to empty string `""`** — would satisfy the TypeScript type but an empty string would incorrectly satisfy `>= sevenDaysAgo` in some edge cases. Rejected.

---

## Decision 3: Does the `onSnapshot` listener need changes?

**Decision**: No. The existing `onSnapshot` in `useDashboardStats` is correctly structured. Once the type mismatch is resolved (Decision 1), the listener will fire as expected whenever a task's `status` changes between `completed` and `todo`.

**Rationale**: Firestore `onSnapshot` re-evaluates the query whenever a document in the collection changes. A task going from `status: 'todo'` to `status: 'completed'` will add a document to the snapshot; toggling back removes it. The listener already handles both cases.

---

## Decision 4: Backward compatibility for old Firestore Timestamp documents

**Decision**: No migration needed. `useDashboardStats.ts` already parses both Firestore Timestamp and string types for `completedAt` (lines 65-69). Old documents with Timestamp-stored `completedAt` will continue to be read correctly.

**Rationale**: The fix is forward-only — new completions store ISO strings, old documents keep Timestamps. The query `where('completedAt', '>=', sevenDaysAgo.toISOString())` will only match the new ISO string documents. Old Timestamp documents (pre-fix) will fall out of the query result as they cannot be compared against the string boundary — but since these are historical documents from before the fix, any that should appear in the 7-day window will simply be excluded until re-completed. This is an acceptable trade-off given the small user base and short 7-day window.
