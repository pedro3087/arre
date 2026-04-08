# Feature Specification: Project & Kanban Drag-and-Drop Priority Ordering

**Feature Branch**: `001-project-drag-ordering`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "we should be able to drag and drop order on the kanban board and also on the main menu panel on the left, but the tasks also get re-organized so when the customer clicks on the project it keeps displaying the tasks associated to the project. this will help us to look at projects based on priorities"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reorder Projects in the Left Navigation Menu (Priority: P1)

As a user, I want to drag projects up and down in the left-hand menu panel so that my most important projects appear at the top and the order reflects my current priorities.

**Why this priority**: The left menu is the primary navigation surface. Establishing a persistent priority order there is the foundational capability — everything else (kanban board column order, task display order) builds on the same ordering data.

**Independent Test**: Can be fully tested by opening the app, dragging a project to a new position in the left menu, refreshing the page, and verifying the new order persists.

**Acceptance Scenarios**:

1. **Given** the left menu lists multiple projects, **When** the user drags a project card to a new position, **Then** the project moves to that position and all other projects shift accordingly.
2. **Given** the user has reordered projects, **When** the user refreshes the page or reopens the app, **Then** the custom order is restored exactly as left.
3. **Given** a new project is created, **When** it appears in the left menu, **Then** it is added at the bottom of the list (lowest priority by default).

---

### User Story 2 - Reorder Kanban Columns by Dragging (Priority: P2)

As a user, I want to drag and drop the columns on the kanban board to rearrange their order so that I can reflect the workflow priority or process stages that matter most right now.

**Why this priority**: The kanban board is the primary task-management view. Allowing column reordering gives users control over their workflow stages without affecting core navigation, making it a valuable but self-contained enhancement.

**Independent Test**: Can be fully tested by opening a project's kanban board, dragging one column to a new position, navigating away, returning to the board, and confirming the column order persisted.

**Acceptance Scenarios**:

1. **Given** a project kanban board is open with multiple columns, **When** the user drags a column header to a new horizontal position, **Then** the column drops into that position and all other columns shift to accommodate.
2. **Given** the user has reordered columns, **When** the user navigates away and returns to the kanban board, **Then** the column order is restored to what was last set.
3. **Given** column order has been changed, **When** the user views the tasks within each column, **Then** each task remains associated with its correct column and is not lost or reassigned.

---

### User Story 3 - Tasks Remain Associated with Their Project After Reordering (Priority: P2)

As a user, I want that after reordering projects or columns, clicking any project in the left menu still shows only that project's tasks — correctly organized — so that reordering never causes data loss or cross-project task mixing.

**Why this priority**: This is a correctness guarantee. Without it, drag-and-drop reordering could appear to work but actually corrupt the user's view of their data.

**Independent Test**: Can be fully tested by reordering projects, clicking each project in turn, and verifying its task list contains only the tasks originally assigned to it.

**Acceptance Scenarios**:

1. **Given** the user has reordered projects in the left menu, **When** the user clicks any project, **Then** only tasks belonging to that project are displayed on the kanban board.
2. **Given** the user has reordered kanban columns within a project, **When** the user clicks a different project and returns, **Then** the column order is still correct and no tasks have moved to a different column.
3. **Given** multiple projects each have tasks in overlapping column names (e.g., both have a "To Do" column), **When** the user reorders either project's columns, **Then** only that project's column order changes; the other project is unaffected.

---

### User Story 4 - Drag-and-Drop Tasks Within and Between Kanban Columns (Priority: P3)

As a user, I want to drag tasks between columns and within a column to change their status and relative priority so that the board always reflects the current state of work.

**Why this priority**: Task reordering within the board extends the ordering concept to the task level, completing the priority-management story. It is lower priority because project-level and column-level ordering (P1/P2) delivers the headline value first.

**Independent Test**: Can be fully tested by dragging a task from one column to another and verifying its status updates accordingly, then refreshing to confirm persistence.

**Acceptance Scenarios**:

1. **Given** a task is in one column, **When** the user drags it to a different column, **Then** the task moves to the new column and its status updates to match that column's status.
2. **Given** multiple tasks in a single column, **When** the user drags one task above or below another, **Then** the vertical order within the column is updated and persists after page reload.
3. **Given** a task is dragged to the final/done column, **When** the move is confirmed, **Then** the task is marked complete following existing completion rules.

---

### Edge Cases

- What happens when the user drags a project and drops it back in the same position? The order should remain unchanged with no unnecessary saves.
- What happens when two users (or two browser tabs) reorder the same project list simultaneously? The last save wins; no silent data corruption.
- What happens when there is only one project or one column? Drag-and-drop should still activate but produce no visible change.
- How does the system handle a very long list of projects that overflows the left menu? The drag target should remain reachable (scrolling while dragging is supported or the list scrolls automatically).
- What happens if the network is unavailable when the user drops a project/column? The reorder should be attempted and the user notified if it could not be saved; the UI should not silently revert.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to drag and drop projects in the left navigation menu to change their display order.
- **FR-002**: The project order established in the left menu MUST persist across page reloads, browser sessions, and devices for the same user account.
- **FR-003**: Users MUST be able to drag and drop kanban board columns to change their horizontal order within a project.
- **FR-004**: The kanban column order MUST persist per project, independently for each project.
- **FR-005**: Reordering projects or columns MUST NOT alter task-to-project or task-to-column associations.
- **FR-006**: Clicking a project in the left menu MUST always display only the tasks belonging to that project, regardless of any reordering that has occurred.
- **FR-007**: Users MUST be able to drag tasks between kanban columns to update their status.
- **FR-008**: Users MUST be able to drag tasks vertically within a column to set their priority order within that column.
- **FR-009**: Task order within columns MUST persist per project per column.
- **FR-010**: A newly created project MUST be placed at the bottom (lowest priority) of the left menu order by default.
- **FR-011**: A newly created kanban column MUST be appended at the rightmost position by default.
- **FR-012**: The system MUST provide clear visual affordance (drag handle or cursor change) indicating which elements are draggable.
- **FR-013**: The system MUST show a visual placeholder or highlight indicating the drop target position while the user is dragging.

### Key Entities

- **Project Order**: A user-specific ordered list of project identifiers representing the user's chosen priority sequence for projects in the left menu.
- **Column Order**: A project-specific ordered list of kanban column (status) identifiers representing the display sequence of columns on the board.
- **Task Order**: A column-specific ordered list of task identifiers representing the display sequence of tasks within a kanban column.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can reorder a project in the left menu in under 5 seconds (drag, drop, confirmed).
- **SC-002**: Project order, column order, and task order each persist correctly after page reload 100% of the time under normal network conditions.
- **SC-003**: Clicking any project immediately after reordering displays only that project's tasks — zero cross-project task leakage.
- **SC-004**: All reordering interactions (project, column, task) complete with visible confirmation within 1 second under normal network conditions.
- **SC-005**: Users report that locating their highest-priority project requires fewer steps after using drag-to-reorder ordering compared to the previous fixed order.

## Assumptions

- Each user has their own independent project order; reordering by one user does not affect any other user's view.
- The existing kanban column drag-and-drop infrastructure (@dnd-kit) is already present in the codebase and will be extended, not replaced.
- "Tasks associated to the project" means the task-to-project relationship is stored in each task's data record and is not inferred from ordering alone.
- The left menu panel already lists projects; this feature adds drag-to-reorder without redesigning the panel's visual layout.
- Offline/conflict resolution defaults to last-write-wins, consistent with existing Firestore usage in the app.
