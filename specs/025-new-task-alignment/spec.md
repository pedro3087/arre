# Feature Specification: Land on New Task & UI Alignment

**Feature Branch**: `025-new-task-alignment`  
**Created**: 2026-03-09
**Status**: Draft  
**Input**: User description: "we need to be able to land on the New Task instead Magic import and we need to align and make them very similar on shape/form/colors for the objects on the New Task to the other objects present on the Inbox page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Default to Manual Creation (Priority: P1)

When a user clicks the "New Task" button from any page, they should see the manual task entry form immediately, rather than the AI "Magic Import" screen. This reduces friction for the most common action.

**Why this priority**: Directly addresses the primary user request to "land on New Task instead of Magic Import".

**Independent Test**: Open the New Task modal from any page. Verify that the "New Task" tab is active and the "What needs to be done?" input has focus.

**Acceptance Scenarios**:

1. **Given** I am on the Inbox page, **When** I click "New Task", **Then** the manual task creation form is displayed by default.
2. **Given** I am on a different page (e.g., Upcoming), **When** I click "New Task", **Then** the manual task creation form is displayed.
3. **Given** I am editing an existing task, **When** the modal opens, **Then** it still shows the "Edit Task" manual form (current behavior preserved).

---

### User Story 2 - UI Alignment with Inbox Aesthetic (Priority: P2)

The interactive elements within the New Task modal (buttons, pills, selectors) should share the same design language as the Inbox page to feel like a cohesive part of the application.

**Why this priority**: Ensures design consistency across the application, making the product feel more professional and predictable.

**Independent Test**: Compare the "Create Task" button with the "New Task" button on the Inbox. Compare the Energy Level pills with the Energy Filter on the Inbox.

**Acceptance Scenarios**:

1. **Given** I am in the New Task modal, **When** I look at the "Create Task" button, **Then** it should be fully rounded (9999px border-radius) and use the same purple-neon background color as the main "New Task" button on the Inbox.
2. **Given** I am selecting an energy level, **When** I choose a level, **Then** the pills should be fully rounded (9999px) and match the style/color of the Energy Filter pills on the Inbox (background-color with opacity, specific border colors, and subtle glow for 'high').
3. **Given** I am entering a task title, **When** I interact with the input, **Then** it should feel aligned with the Inbox search input (could be a rounded field or at least share the same internal padding and font consistency).

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST set the default `activeTab` of `TaskEditorModal` to `'manual'` for new tasks.
- **FR-002**: The "Create Task" button MUST use `border-radius: 9999px` and `background: var(--accent-purple-neon)`.
- **FR-003**: Energy level buttons MUST use `border-radius: 9999px` and match the color scheme of the `EnergyFilter` component.
- **FR-004**: The task title input MUST be updated to better align with the Inbox design (e.g., matching border radius of the search bar if a bounded input is used, or ensuring color/weight consistency).
- **FR-005**: All dropdowns (Project Select) and date pickers MUST have standardized border radii (e.g., 8px or 12px) to match the "Card" aesthetic of the Inbox.

### Key Entities

- **TaskEditorModal**: The primary UI component for task entry/editing.
- **Manual Form**: The set of fields (Title, Notes, Energy, Date, Project) within the modal.
- **Magic Import**: The AI-assisted task generation tab.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users reach the task entry field in 1 click (vs 2 clicks currently to switch tabs).
- **SC-002**: Consistency Score: Interactive elements (pills, primary buttons) use uniform `9999px` border radius across both Inbox/Dashboard and Task Modal.
- **SC-003**: Color Harmony: Primary action color in modal (Create Task) matches the primary action color in Inbox (New Task button).
