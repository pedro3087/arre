# Feature Specification: Kanban Done Sync

**Feature Branch**: `001-kanban-done-sync`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "we want to make sure that once we move tasks on kanban from in progress to done the tasks is updated as completed and is updated everywhere like in all the pages, inbox, logbook and wherever is needed"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mark Task Complete via Kanban (Priority: P1)

A user drags a task card from the "In Progress" column to the "Done" column on the kanban board. The task is immediately recorded as completed, and any other view open in the app reflects the updated state without requiring a page refresh.

**Why this priority**: This is the core behavior of the feature. Without reliable completion marking, the rest of the sync is meaningless.

**Independent Test**: Open the kanban board with a task in "In Progress". Drag it to "Done". Verify the task card displays a completed visual state on the board. This can be verified in isolation before checking other views.

**Acceptance Scenarios**:

1. **Given** a task is in the "In Progress" column, **When** the user drags it to the "Done" column, **Then** the task is marked as completed, its completed date/time is recorded, and it remains visible as a card in the "Done" column.
2. **Given** a task has been moved to the "Done" column, **When** the user views the kanban board, **Then** the task card is still present in the "Done" column and does not disappear or get hidden.
3. **Given** a task is in the "Done" column, **When** the user drags it back to any non-Done column, **Then** the task is unmarked as completed and its completed date is cleared.
4. **Given** a task is already completed (marked done via another view), **When** it appears on the kanban board, **Then** it is shown in the "Done" column automatically.

---

### User Story 2 - Completion Reflected in Inbox (Priority: P2)

After a task is marked complete from the kanban board, the Inbox view no longer shows it among active tasks. Users do not need to manually refresh or re-filter the Inbox.

**Why this priority**: The Inbox is the primary task management view. Stale task state there creates confusion and double-work.

**Independent Test**: Open Inbox alongside Kanban (or navigate between them). Move a task to Done on Kanban. Navigate to Inbox and confirm the task no longer appears in active items.

**Acceptance Scenarios**:

1. **Given** a task appears in the Inbox as active, **When** the task is moved to "Done" on the kanban board, **Then** the task is removed from the Inbox active list and shown in the completed state if the Inbox has a completed section.
2. **Given** the Inbox is open in another tab/window, **When** a task is completed via Kanban, **Then** the Inbox reflects the updated state within a reasonable time (no manual refresh needed).

---

### User Story 3 - Completed Task Appears in Logbook (Priority: P3)

When a task is completed by dragging it to the "Done" kanban column, it appears in the Logbook alongside tasks completed through other means (e.g., checkbox, list view).

**Why this priority**: The Logbook is the historical record of completed work. It must be the single source of truth for completed tasks regardless of how they were completed.

**Independent Test**: Open the Logbook and note current completed tasks. Move a task to "Done" on Kanban. Navigate to Logbook and verify the task appears with its completion timestamp.

**Acceptance Scenarios**:

1. **Given** the Logbook shows previously completed tasks, **When** a task is moved to "Done" on the kanban board, **Then** the task appears in the Logbook with the correct completion date and time.
2. **Given** a task was completed via the kanban board, **When** a user views the Logbook, **Then** the task is indistinguishable from tasks completed via other methods (no special kanban-only label).

---

### User Story 4 - Consistent State Across All Views (Priority: P2)

Any view in the application that displays tasks — project lists, dashboards, search results, or filtered views — shows the correct completion state for tasks completed via the kanban board.

**Why this priority**: Inconsistent task state across views undermines trust in the application's data.

**Independent Test**: Navigate to at least two other task-displaying views after marking a task done on Kanban. Each view should show the task as completed without a refresh.

**Acceptance Scenarios**:

1. **Given** a task is completed on the Kanban board, **When** the user navigates to any other page that lists tasks, **Then** the task is displayed as completed on that page.
2. **Given** a user applies a filter to show only active tasks, **When** a task has been marked complete via Kanban, **Then** the task does not appear in the active filter results.

---

### Edge Cases

- What happens when the user drags a task to "Done" and immediately drags it back — does the completion state toggle correctly both times?
- How does the system handle a task moved to "Done" while the user is offline — does it sync once connectivity is restored?
- If the "Done" column is deleted or renamed by the project owner, what happens to existing completed tasks?
- What if a task is simultaneously marked complete in one view and moved on the kanban board in another open session?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST mark a task as completed when it is moved to the "Done" kanban column.
- **FR-002**: System MUST keep the task card visible in the "Done" column after it is marked complete — completed tasks are NOT removed or hidden from the kanban board.
- **FR-003**: System MUST record the completion date and time when a task is marked complete via the kanban board.
- **FR-004**: System MUST unmark a task as completed (and clear its completion date) when it is moved from the "Done" column back to any other kanban column.
- **FR-005**: System MUST reflect the updated completion state in the Inbox view without requiring a manual page refresh.
- **FR-006**: System MUST reflect the updated completion state in the Logbook view without requiring a manual page refresh.
- **FR-007**: System MUST reflect the updated completion state in all other views that display task lists (project views, dashboards, search results, filtered views).
- **FR-008**: A task completed via the kanban board MUST be treated identically to a task completed via any other method (checkbox, list view, etc.) in all views.
- **FR-009**: System MUST ensure that tasks already marked complete through other means are displayed in the "Done" kanban column when the kanban board is viewed.
- **FR-010**: Completion state changes MUST be persisted reliably — if an error occurs during the update, the user MUST be informed and the task state must remain consistent (no partial updates).

### Key Entities

- **Task**: Represents a unit of work with attributes including completion status (complete/incomplete) and completion date/time. The task's completion state is the single source of truth across all views.
- **Kanban Column**: A named swimlane on the kanban board. One column is designated as the "Done" column; moving a task into it triggers the completion workflow.
- **Kanban Status**: The mapping between a kanban column and the task completion state. The "Done" column maps to the completed status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of tasks moved to the "Done" kanban column remain visible as cards in the "Done" column after the drag action — no task disappears from the board upon completion.
- **SC-002**: 100% of tasks moved to the "Done" kanban column are reflected as completed in the Inbox within 2 seconds of the drag action completing.
- **SC-003**: 100% of tasks moved to the "Done" kanban column appear in the Logbook within 2 seconds of the drag action completing.
- **SC-004**: Zero cases where a task shows as "active" in any view after being marked complete via the kanban board (no stale state).
- **SC-005**: Users report no confusion about task completion state across views — measured by absence of support requests related to "task shows wrong status in different pages."
- **SC-006**: Toggling a task between Done and another column (complete → incomplete → complete) produces the correct state each time, with no data inconsistency.

## Assumptions

- The application already has a concept of task completion state (complete/incomplete) that is shared across views; this feature ensures the kanban "Done" column writes to that same shared state.
- The "Done" column is a single, identifiable column per kanban board — not multiple columns that all mean "done."
- Moving a task back from "Done" to any other column reverses the completion; this is the expected reversible behavior.
- All views already subscribe to the same underlying task data source; the primary gap is that the kanban drag action does not currently update the shared completion field.
- Completed tasks are intended to remain visible in the "Done" column on the kanban board. There is no auto-archiving or hiding of completed task cards from the board.
- Performance targets (2 seconds) reflect the existing app's real-time data sync capability and standard user expectations for task management tools.
