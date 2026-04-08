# Feature Specification: Fix Project Modal Centering and Button Visibility

**Feature Branch**: `001-fix-project-modal`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "when click on the new project button and the modal opens, the modal is not opening on the center and the create button is not visible properly"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Modal Opens Centered on Screen (Priority: P1)

When a user clicks the "New Project" button, the modal should appear visually centered on the screen, regardless of the current viewport size or the presence of a sidebar.

**Why this priority**: The modal being off-center is the most visible and disorienting part of the bug. A centered modal is a fundamental UX expectation.

**Independent Test**: Can be fully tested by clicking "New Project" and verifying the modal appears in the center of the viewport.

**Acceptance Scenarios**:

1. **Given** the user is on any page with the sidebar open, **When** the user clicks "New Project", **Then** the modal appears visually centered (both horizontally and vertically) within the viewport.
2. **Given** the user is on a mobile-sized viewport, **When** the user opens the modal, **Then** the modal is centered and does not overflow outside the screen.
3. **Given** the user resizes the browser window while the modal is open, **When** the resize happens, **Then** the modal remains centered.

---

### User Story 2 - Create Button Is Fully Visible and Actionable (Priority: P1)

When the modal is open, all footer buttons (Cancel, Create) must be fully visible and clickable without requiring the user to scroll.

**Why this priority**: The "Create" button is the primary action; if it is hidden or clipped, users cannot complete their goal.

**Independent Test**: Can be fully tested by opening the modal and verifying the "Create" button is fully rendered, unclipped, and responds to clicks.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** the user views it, **Then** the full "Create" button text and background are visible without scrolling.
2. **Given** the modal is open on a short viewport (e.g., 600px tall), **When** the user views it, **Then** the footer with Cancel and Create buttons remains visible and usable.
3. **Given** the user has typed a project name, **When** the "Create" button is visible and clicked, **Then** the project is saved and the modal closes.

---

### Edge Cases

- What happens when the viewport is very small (e.g., 320×568 mobile)? The modal should be scrollable or shrink to fit without hiding the footer.
- What happens when animations are running and the user clicks quickly? Centering must be correct from the very first animation frame.
- Does the fix work when the modal is used in "Edit Project" mode (same component)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The modal MUST appear centered horizontally and vertically within the browser viewport when opened.
- **FR-002**: The modal centering MUST be preserved throughout the open/close animation (from first frame to last).
- **FR-003**: The "Create" button (and all footer buttons) MUST be fully visible and not clipped or obscured when the modal opens.
- **FR-004**: The modal MUST remain usable (scrollable or auto-fitting) on viewports as small as 320px wide and 568px tall.
- **FR-005**: The fix MUST apply consistently to both "New Project" and "Edit Project" modes since they share the same modal component.

### Key Entities

- **ProjectModal**: The dialog overlay component used to create and edit projects. Has a backdrop, animated container, header, body (name input + color picker), and footer (Cancel + Create/Save buttons).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The modal center point is within 5px of the viewport center (both axes) on desktop and tablet viewports.
- **SC-002**: The "Create" / "Save" button is 100% visible (no clipping) on all supported viewport sizes without any user scrolling required at the modal level.
- **SC-003**: The modal opens correctly on the first click with no visual jump or reposition after the animation begins.
- **SC-004**: The fix works identically for both "New Project" (create mode) and "Edit Project" (edit mode) modal invocations.

## Assumptions

- The root cause is that Framer Motion's animated `transform` (used for scale/slide-in animations) overrides the CSS `transform: translate(-50%, -50%)` centering rule, causing the modal to appear off-center.
- The "Create" button visibility issue is likely caused by the same transform conflict or by `overflow: hidden` on the modal container clipping the footer at certain viewport heights.
- The fix will be applied in CSS (and/or the animation config) without changing the modal's markup structure or business logic.
- No new dependencies are required; the fix is purely presentational.
