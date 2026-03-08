# Feature Specification: Task Drag and Drop

**Feature Branch**: `002-task-drag-drop`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "Implement the ability to click and drag tasks to reorder them within their respective project groups. Acceptance Criteria: Tasks can be dragged and dropped in the list. Order is persisted to Firestore. Works smoothly with Framer Motion animations."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Drag and Drop Reordering (Priority: P1)

A user clicks and holds a task in a project group (in Anytime or Someday pages) and drags it to a new position within that same group to reorder their tasks.

**Why this priority**: Core functionality requested by the user.

**Independent Test**: Can be tested by navigating to Anytime, seeing tasks in a project group, dragging one task above another, and verifying the new order stays.

**Acceptance Scenarios**:

1. **Given** a list of tasks in a project group, **When** the user drags a task and drops it in a new position, **Then** the UI immediately reflects the new order using Framer Motion animations.
2. **Given** a changed order, **When** the drop completes, **Then** the new order is persisted to Firestore.
3. **Given** the page is refreshed, **When** the user views the project group, **Then** the tasks appear in the custom order.

---

### Edge Cases

- Reordering tasks fast before the first Firestore write completes.
- What happens if a task has no existing `order` property?
- **Google Tasks Mixed In:** Google Tasks do not persist order to Firestore. They should be excluded from the drag-and-drop actions to prevent jumpy behavior.
- Updating multiple tasks `order` index so they remain consistent.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to drag and drop tasks using `framer-motion` `Reorder.Group` and `Reorder.Item`.
- **FR-002**: System MUST persist the new order to Firestore using a batched update, updating the `order` property on the affected tasks.
- **FR-003**: System MUST fallback to `createdAt` when a task has no `order` defined, placing ordered tasks (by value) first, then unordered tasks (by `createdAt` descending).
- **FR-004**: System MUST sort Tasks by `order` primarily in project groups.

### Key Entities

- **Task**: Must have an optional `order` field (Number) used for custom sorting.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Tasks can be reordered seamlessly.
- **SC-002**: Order is preserved upon refresh.
- **SC-003**: Framer Motion animations feel smooth and native.
