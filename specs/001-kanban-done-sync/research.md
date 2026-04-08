# Research: Kanban Done Sync

**Branch**: `001-kanban-done-sync` | **Date**: 2026-04-07

## Findings

### Decision 1: Inbox and Logbook sync is already implemented
- **Decision**: No changes needed to Inbox, Logbook, or any other task-list view.
- **Rationale**: All views use `useTasks` hook with `onSnapshot` real-time listeners. The Inbox query filters `where('status', '==', 'todo')` and the Logbook query filters `where('status', '==', 'completed')`. When `moveTask` writes `status: 'completed'` to Firestore, Firestore pushes the update to all active listeners immediately. Tasks disappear from Inbox and appear in Logbook without any additional work.
- **Files**: `src/features/tasks/hooks/useTasks.ts` (Inbox query lines 196-202, Logbook query lines 224-228)
- **Alternatives considered**: Adding a shared task state manager or event bus — unnecessary given Firestore already provides real-time propagation.

### Decision 2: The only bug is in `useKanbanBoard.ts` — three related issues
- **Decision**: Fix three lines in `src/features/kanban/hooks/useKanbanBoard.ts`. No other files need changes.
- **Rationale**: 
  1. **Line 44** — `.filter((t) => t.status !== 'completed')` excludes all completed tasks from the board snapshot. Removing this filter allows completed tasks to appear.
  2. **Line 86** — `setTasks((prev) => prev.filter((t) => t.id !== taskId))` (optimistic update) removes the card from local state when moving to Done. Should instead update the task's `kanbanStatusId` and `status` in local state so the card stays in the Done column.
  3. **Lines 99-103** — `kanbanStatusId: deleteField()` removes the column association. Should instead preserve `kanbanStatusId: toStatusId` so the card is anchored to the Done column in local state.
- **Alternatives considered**: Keeping the filter and adding a separate query for completed tasks — would require a composite Firestore index (`projectId + status`), which the existing code explicitly avoids (comment on line 32).

### Decision 3: Grouping logic must route completed tasks to the final column
- **Decision**: Update the `tasksByColumn` memo to place any task with `status === 'completed'` in the final column (`isFinal: true`), regardless of its stored `kanbanStatusId`.
- **Rationale**: Tasks completed via checkbox in other views (Inbox, Anytime, etc.) set `status: 'completed'` but do **not** update `kanbanStatusId`. Their `kanbanStatusId` may still point to "In Progress" or may be undefined. The grouping logic must normalize this: all completed tasks → final column.
- **Alternatives considered**: Updating `kanbanStatusId` in `updateTask` whenever `status` becomes `'completed'` — requires knowing which column is final in a hook that has no awareness of kanban statuses; couples task management to kanban. The grouping approach keeps concerns separated.

### Decision 4: `kanbanStatusId` is preserved (not deleted) when completing via drag
- **Decision**: Change `kanbanStatusId: deleteField()` to `kanbanStatusId: toStatusId` in `moveTask`.
- **Rationale**: Preserving the `kanbanStatusId` anchors the card to the Done column in Firestore. This ensures the Firestore snapshot also reflects the correct column assignment (consistent with the local optimistic state). If the task is later uncompleted (moved back), the drag handler will update `kanbanStatusId` to the new column.
- **Alternatives considered**: Deleting `kanbanStatusId` and relying solely on grouping logic — works for the board display, but makes Firestore data inconsistent (a completed task has no column association).

### Decision 5: Error handling — revert on failure
- **Decision**: On Firestore write failure in `moveTask`, revert the optimistic update by re-fetching from the snapshot (already happens automatically via `onSnapshot`) and show a console error. No user-facing toast notification for now.
- **Rationale**: The existing pattern (console.error + let `onSnapshot` revert) is consistent with the rest of the codebase. FR-010 says the user MUST be informed on error — this will be addressed by the snapshot reverting the card to its original column, which is a visible signal to the user.
- **Alternatives considered**: Toast/snackbar notification — would require a notification system that may not exist; out of scope for this targeted fix.

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| How does the Done column get identified? | `isFinal: true` on `KanbanStatus` — already in the data model |
| Do Inbox/Logbook need code changes? | No — Firestore real-time listeners handle propagation |
| Is a composite Firestore index needed? | No — single-field query + client-side filtering preserves existing approach |
| Where are completed tasks placed on board reload? | Grouping logic normalizes: `status === 'completed'` → final column |
