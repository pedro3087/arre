# Feature Specification: Sidebar Toggle

**Feature Branch**: `027-sidebar-toggle`  
**Created**: 2026-06-04  
**Status**: Draft  
**Input**: User description: "Add a sidebar toggle (collapse/expand) feature to the desktop layout. When collapsed, the sidebar slides off-screen via translateX(-100%) and the main content expands to fill the width. A small expand button appears at the top-left of the main content area to re-open the sidebar. The user's preference persists across sessions via localStorage. Mobile behavior remains unchanged (sidebar always hidden, bottom nav shown). The toggle button lives in the sidebar header next to the 'Arre' logo. Uses PanelLeftClose/PanelLeftOpen icons from lucide-react. Follows existing patterns (local state in MainLayout with props to Sidebar, CSS transitions already in place). Only 4 files need modification: Sidebar.tsx, Sidebar.module.css, MainLayout.tsx, MainLayout.module.css."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Collapse Sidebar to Gain Screen Space (Priority: P1)

As a user working on a task-heavy view (e.g., Kanban board or dashboard), I want to collapse the sidebar so I can use the full width of my screen for content.

**Why this priority**: This is the core value proposition — users need more horizontal space for content-dense views like Kanban boards. Without this, the sidebar permanently occupies 260px on every page.

**Independent Test**: Can be fully tested by clicking the collapse button in the sidebar header and verifying the sidebar slides away and the main content fills the screen.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded (default state), **When** the user clicks the collapse button in the sidebar header, **Then** the sidebar slides off-screen to the left with a smooth animation and the main content area expands to fill the full viewport width.
2. **Given** the sidebar is expanded, **When** the user clicks the collapse button, **Then** a small expand button appears at the top-left corner of the main content area.

---

### User Story 2 - Expand Sidebar from Collapsed State (Priority: P1)

As a user who previously collapsed the sidebar, I want to re-expand it to access navigation, projects, and the "New Task" button.

**Why this priority**: Equally critical as collapsing — without a reliable way to re-open, collapsing becomes a one-way trap.

**Independent Test**: Can be tested by first collapsing the sidebar, then clicking the expand button and verifying the sidebar reappears.

**Acceptance Scenarios**:

1. **Given** the sidebar is collapsed, **When** the user clicks the expand button in the top-left corner of the main content area, **Then** the sidebar slides back into view with a smooth animation and the main content adjusts its width accordingly.
2. **Given** the sidebar is collapsed, **When** the user clicks the expand button, **Then** the expand button disappears (since the sidebar header now contains the collapse button).

---

### User Story 3 - Sidebar State Persists Across Sessions (Priority: P2)

As a user who prefers a collapsed sidebar, I want my preference remembered so I don't have to collapse it every time I open the app.

**Why this priority**: Important for user experience but not blocking — the toggle still works without persistence, it just resets on refresh.

**Independent Test**: Can be tested by collapsing the sidebar, refreshing the page, and verifying the sidebar remains collapsed.

**Acceptance Scenarios**:

1. **Given** the user collapses the sidebar and refreshes the page, **When** the page loads, **Then** the sidebar remains collapsed and the expand button is visible.
2. **Given** the user expands the sidebar and refreshes the page, **When** the page loads, **Then** the sidebar is visible in its expanded state.

---

### Edge Cases

- What happens when the user resizes the browser window to mobile width (≤768px) while the sidebar is expanded? The sidebar hides via the existing mobile responsive rules and the bottom navigation appears. The sidebar toggle state is irrelevant on mobile.
- What happens when the user resizes from mobile back to desktop width while the sidebar state is "collapsed"? The sidebar remains collapsed (respecting the persisted preference) and the expand button is visible.
- What happens if localStorage is unavailable or cleared? The sidebar defaults to expanded (the natural default state).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a collapse button in the sidebar header, positioned next to the application logo, that collapses the sidebar when clicked.
- **FR-002**: The system MUST display an expand button at the top-left of the main content area when the sidebar is collapsed, allowing the user to re-expand it.
- **FR-003**: The sidebar MUST slide off-screen with a smooth animation when collapsed (duration ~300ms).
- **FR-004**: The main content area MUST expand to fill the full viewport width when the sidebar is collapsed, with a smooth transition matching the sidebar animation.
- **FR-005**: The system MUST persist the user's sidebar collapsed/expanded preference across browser sessions.
- **FR-006**: Mobile behavior (viewport ≤768px) MUST remain unchanged — the sidebar stays hidden and the bottom navigation is shown, regardless of the toggle state.
- **FR-007**: The expand button MUST NOT appear on mobile viewports.
- **FR-008**: Both the collapse and expand buttons MUST be keyboard-accessible and include appropriate accessibility labels.

### Key Entities

- **Sidebar State**: A boolean value (collapsed/expanded) representing the current visibility of the sidebar, persisted to local storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can collapse or expand the sidebar with a single click, completing the action in under 0.5 seconds (animation included).
- **SC-002**: Sidebar state preference survives page refreshes and new browser sessions 100% of the time (when local storage is available).
- **SC-003**: Mobile layout remains visually and functionally identical before and after this feature is introduced.
- **SC-004**: The collapse/expand animation is smooth with no visible jank or layout shift (consistent 60fps rendering during transition).

## Assumptions

- The application's icon library (lucide-react) includes PanelLeftClose and PanelLeftOpen icons suitable for the toggle buttons.
- The existing CSS transitions on the sidebar (transform) and main content (margin-left) provide the animation foundation.
- The default sidebar state is "expanded" for first-time users or when localStorage has no saved preference.
- No keyboard shortcut is included in the initial implementation (can be added as a follow-up).
