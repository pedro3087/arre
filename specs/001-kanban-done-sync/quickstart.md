# Quickstart: Testing Kanban Done Sync

**Branch**: `001-kanban-done-sync` | **Date**: 2026-04-07

## Prerequisites

- Firebase emulator running or access to dev Firestore
- A project with at least one task in "In Progress"

## Running the App

```bash
cd frontend
npm run dev
```

## Manual Test Checklist

### Core flow (FR-001, FR-002, SC-001)
1. Open a project's Kanban board
2. Drag a task from "In Progress" to "Done"
3. ✅ Task card remains visible in the "Done" column
4. ✅ Task card shows completed visual state (check icon or strikethrough)

### Cross-view sync — Inbox (FR-005, SC-002)
5. Open the Inbox in a second browser tab (or navigate to it)
6. ✅ The completed task no longer appears in the Inbox active list

### Cross-view sync — Logbook (FR-006, SC-003)
7. Navigate to the Logbook
8. ✅ The completed task appears at the top (sorted by `completedAt` DESC)
9. ✅ Its completion timestamp matches when you dragged it

### Board reload persistence (FR-002, SC-001)
10. Refresh the Kanban board page
11. ✅ The task still appears in the "Done" column

### Tasks completed via checkbox appear in Done column (FR-008)
12. Mark an existing project task as complete from the Inbox (checkbox)
13. Navigate to the Kanban board for that project
14. ✅ The task appears in the "Done" column

### Reversibility (FR-004, SC-006)
15. Drag the task from "Done" back to "In Progress"
16. ✅ Task reappears in the Inbox as active
17. ✅ Task disappears from the Logbook
18. ✅ Task is in the "In Progress" column on the board

## Running Tests

```bash
npm test
```

## Key File Under Test

`src/features/kanban/hooks/useKanbanBoard.ts` — all behavior changes are in this single file.
