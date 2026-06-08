# Feature Specification: Navigation Visibility Toggles

**Feature Branch**: `028-nav-visibility`  
**Created**: 2026-06-08  
**Status**: Draft  
**Input**: User description: "I want to be able to enable/disable menus from the sidebar from the settings, like not able to see the Today, Logbook, Kanban. This should work on desktop and mobile web."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Hide a Menu Item from Settings (Priority: P1)

As a user who never uses Logbook or Kanban, I want to hide those entries from my navigation so my sidebar and bottom nav feel less cluttered.

**Why this priority**: Core value — the entire feature is about reducing navigation noise.

**Independent Test**: Open Settings → Navigation section, toggle "Logbook" off, return to app. Sidebar no longer shows Logbook. Mobile bottom nav no longer shows Logbook.

**Acceptance Scenarios**:

1. **Given** the Settings page is open, **When** the user finds the "Navigation" section and turns off the "Logbook" toggle, **Then** the sidebar on desktop no longer renders the Logbook entry.
2. **Given** the Logbook toggle is off, **When** the user views the app on a mobile viewport, **Then** the bottom navigation bar does not include a Logbook button.

---

### User Story 2 — Re-enable a Hidden Menu Item (Priority: P1)

As a user who previously hid Kanban, I want to re-enable it when I start a new project.

**Why this priority**: Without restore, toggling is a one-way action and users are trapped.

**Independent Test**: Open Settings → Navigation, toggle "Kanban" from off to on. Verify it reappears in sidebar and bottom nav.

**Acceptance Scenarios**:

1. **Given** the Kanban item is hidden, **When** the user turns the "Kanban" toggle on in Settings, **Then** Kanban immediately reappears in the sidebar and bottom nav without a page reload.

---

### User Story 3 — Preference Persists Across Sessions (Priority: P2)

As a user who hid two menu items, I want those items to remain hidden after I close and reopen the app.

**Acceptance Scenarios**:

1. **Given** the user hid Logbook and AI Briefing, **When** the user refreshes the page or reopens the app, **Then** those items are still hidden.

---

### User Story 4 — Navigating to a Hidden Route Redirects (Priority: P2)

As a user who hid Today, I want any attempt to visit `/` directly to redirect me to a sensible default.

**Acceptance Scenarios**:

1. **Given** Today is hidden and the user navigates to `/`, **Then** the app redirects to the next visible route in the nav list (fallback: `/inbox`).

---

### Edge Cases

- All items hidden at once: The navigation sections are empty but the app still functions; the settings page remains accessible via `/settings`.
- Hiding the currently active route: The user is redirected to the next visible route immediately.
- localStorage unavailable: All items default to visible.
- Mobile viewport: Bottom nav items are filtered by the same visibility map; no separate setting needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Settings page MUST include a "Navigation" section listing all 8 nav items (Inbox, Today, Upcoming, Anytime, Someday, Logbook, Kanban, AI Briefing) with individual toggle switches.
- **FR-002**: Toggling an item off MUST immediately remove it from the desktop sidebar and mobile bottom nav without a page reload.
- **FR-003**: Toggling an item on MUST immediately restore it to the desktop sidebar and mobile bottom nav.
- **FR-004**: Visibility preferences MUST persist across browser sessions (localStorage).
- **FR-005**: If the user is currently on a route that gets hidden, the app MUST redirect to the first visible route (priority order: `/inbox`, `/`, or the first visible item).
- **FR-006**: The Settings page itself MUST always remain accessible regardless of nav visibility settings.
- **FR-007**: The feature MUST work on both desktop (sidebar) and mobile (bottom nav) without separate configuration.

### Key Entities

- **NavVisibility**: A map of route paths to boolean visibility values, persisted to localStorage under key `nav-visibility`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Toggling a nav item in Settings reflects in both desktop and mobile nav within the same render cycle (no reload required).
- **SC-002**: Visibility preference survives page refresh 100% of the time (when localStorage is available).
- **SC-003**: No route becomes permanently inaccessible — hidden items can always be re-enabled from Settings.
- **SC-004**: Settings toggle section renders all 8 items with accurate initial state.

## Assumptions

- All 8 nav items are individually toggleable; no items are locked.
- Sync across devices is not required (localStorage is sufficient, matching the sidebar-collapsed and theme patterns).
- The redirect on hidden-route visits is to the first visible item in NAV_ITEMS order, not a hard-coded path.
- Bottom nav and desktop sidebar share the same visibility map (one setting controls both).
