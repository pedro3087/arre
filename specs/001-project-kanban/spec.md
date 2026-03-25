# Feature Specification: Project Kanban Board

**Feature Branch**: `001-project-kanban`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "we want to implement a kanban board based on projects already created. when we click on each project the tasks are filtered by project and then the tasks has a status that we can drag and drop from one status to the other, once it moves to the latest status then it closes automatically and moves to logbook."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Project Kanban Board (Priority: P1)

A user selects one of their existing projects and sees all tasks belonging to that project arranged in columns by workflow status. Each column represents a stage in the project workflow, and tasks are displayed as cards within the appropriate column.

**Why this priority**: This is the foundational view of the entire feature. Without it, nothing else can work. It delivers immediate value by giving users a visual overview of where all project tasks stand.

**Independent Test**: Can be fully tested by selecting a project from the project list, confirming tasks appear in the correct status columns as cards, and verifying tasks not belonging to the selected project are hidden.

**Acceptance Scenarios**:

1. **Given** a user has at least one project with tasks assigned to it, **When** they navigate to the Kanban view and click on a project, **Then** only tasks belonging to that project are displayed, grouped into columns by their current status.
2. **Given** a user selects a project, **When** the kanban board loads, **Then** all defined status columns are visible even if some columns have no tasks (empty columns are shown).
3. **Given** a user has no projects, **When** they navigate to the Kanban view, **Then** they see an empty state prompting them to create a project first.
4. **Given** a user selects a different project, **When** the project changes, **Then** the kanban board updates to show only the newly selected project's tasks.

---

### User Story 2 - Drag and Drop Tasks Between Status Columns (Priority: P2)

A user drags a task card from one status column and drops it onto another column to update that task's status. The task moves visually and its status is saved immediately.

**Why this priority**: This is the core interaction of a kanban board — the ability to progress tasks through workflow stages. It directly replaces manual status editing and makes workflow management faster and more intuitive.

**Independent Test**: Can be fully tested by dragging a task card from one column to an adjacent column and confirming the task appears in the new column with its status updated after a page refresh.

**Acceptance Scenarios**:

1. **Given** a task is in any non-final status column, **When** a user drags it and drops it into a different column, **Then** the task appears in the new column and its status is updated to reflect the destination column.
2. **Given** a user begins dragging a task card, **When** they are mid-drag, **Then** the valid drop target columns are visually indicated, and the dragged card shows a visual cue that it is being moved.
3. **Given** a user drags a task and releases it outside any valid column, **When** the drag ends, **Then** the task returns to its original position with no status change.
4. **Given** a user drags a task to the same column it started in, **When** the drop occurs, **Then** no status change is made.

---

### User Story 3 - Auto-Close Task on Final Status (Priority: P3)

When a user drags a task to the last status column (the "Done" or final stage), the task is automatically marked as completed and removed from the kanban board, then appears in the Logbook.

**Why this priority**: This closes the loop between active project work and completed records. It eliminates a manual step and ensures the Logbook stays up to date without extra effort.

**Independent Test**: Can be fully tested by dragging a task to the final status column, confirming it disappears from the kanban board, then navigating to the Logbook to confirm it appears there.

**Acceptance Scenarios**:

1. **Given** a task is in any non-final column, **When** a user drags it into the final (rightmost) status column, **Then** the task is automatically marked as completed, disappears from the kanban board, and appears in the Logbook.
2. **Given** a task has been auto-completed via the kanban final column, **When** the user visits the Logbook, **Then** the task appears there with the correct completion date.
3. **Given** a task was auto-completed from the kanban board, **When** the user un-completes it from the Logbook, **Then** the task returns to the kanban board in a non-final status column.

---

### Edge Cases

- What happens when a project has no tasks assigned to it? → Show empty board with all columns visible and an empty state message.
- What happens if a task is assigned to a project but has no status yet? → Assign a default starting status (first column).
- What happens if two users simultaneously move the same task? → Last write wins; the board refreshes to reflect the latest state.
- What happens when a user drags a task card very quickly across multiple columns? → The drop registers only on the column where the card is released.
- What happens to tasks without a `projectId` when a project is selected? → They are not shown on the kanban board for that project.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a Kanban board view accessible from the main navigation.
- **FR-002**: System MUST present a list of the user's existing projects for selection within the Kanban view.
- **FR-003**: System MUST filter and display only tasks belonging to the selected project on the kanban board.
- **FR-004**: System MUST display task cards organized into columns, where each column represents a distinct workflow status.
- **FR-005**: Workflow statuses MUST follow a defined linear order from first (starting) to last (final/done). The status columns are shared globally across all projects. Users can add, rename, and reorder columns app-wide through a settings interface, but all projects use the same set of columns.
- **FR-006**: Users MUST be able to drag a task card from one status column and drop it onto another status column to change the task's status.
- **FR-007**: System MUST visually indicate valid drop targets while a task is being dragged.
- **FR-008**: System MUST persist the status change immediately when a task is dropped into a new column.
- **FR-009**: System MUST automatically mark a task as completed and move it to the Logbook when it is dropped into the final status column.
- **FR-010**: System MUST display all defined status columns even when they contain no tasks.
- **FR-011**: System MUST show an empty state when the selected project has no tasks.
- **FR-012**: System MUST show an empty state when the user has no projects.
- **FR-013**: Each task card MUST display at minimum the task title and any visible metadata relevant to the project context (e.g., tags, energy level).
- **FR-014**: Users MUST be able to add new status columns, rename existing columns, and reorder columns through a dedicated settings area.
- **FR-015**: System MUST prevent deletion or renaming of the final status column in a way that would break auto-completion behavior; users must always designate one column as the "final" (done) column.
- **FR-016**: Changes to global column configuration MUST be reflected immediately across all projects on the kanban board.

### Key Entities

- **Project**: An existing entity with an ID and title. Acts as the filter scope for the kanban board. A user selects one project at a time.
- **Task**: An existing entity with a title, status, and optional `projectId`. On the kanban board, it is represented as a draggable card. Its `status` is updated via drag-and-drop.
- **Kanban Column**: A visual grouping that represents one workflow status stage. Columns are ordered linearly. The final column triggers auto-completion on drop.
- **Logbook**: The existing completed-tasks view. Auto-completed tasks from the kanban final column appear here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select a project and see all its tasks on the kanban board within 2 seconds of clicking the project.
- **SC-002**: Users can drag a task card and drop it into a new column in a single fluid gesture without needing to click any extra confirmation.
- **SC-003**: A task dropped into the final status column disappears from the board and appears in the Logbook within 1 second, with no additional user action required.
- **SC-004**: 90% of users can move a task between columns successfully on their first attempt without instructions.
- **SC-005**: The kanban board correctly filters tasks by project with zero tasks from other projects visible.
- **SC-006**: The board remains usable and legible with projects containing up to 50 tasks across all columns.

## Assumptions

- The app already has an existing Projects feature with a list of user-created projects, and tasks already support a `projectId` field linking them to a project.
- The app already has a Logbook view that displays tasks with a "completed" status.
- The "latest" (final) status column maps to the existing `completed` status on the Task entity, enabling seamless integration with the existing Logbook.
- Tasks without a `projectId` are not shown on the kanban board regardless of which project is selected.
- Workflow statuses for the kanban board are global (shared across all projects) but user-configurable: users can add, rename, and reorder columns app-wide. Custom per-project statuses are out of scope. Default columns on first use are "To Do", "In Progress", and "Done".
- The kanban board is a new top-level view/section in the app, accessible from the main navigation.
- Task cards on the kanban board do not need to support inline editing in this initial version; editing is done through the existing task detail view.
- The feature is for a single user; multi-user/team collaboration on boards is out of scope.
