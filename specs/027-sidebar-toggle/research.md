# Research: Sidebar Toggle

**Feature**: 027-sidebar-toggle  
**Date**: 2026-06-04

## R-001: Sidebar Animation Approach

**Decision**: Use `transform: translateX(-100%)` to slide the sidebar off-screen when collapsed.

**Rationale**: The codebase already uses this exact technique for mobile (`Sidebar.module.css` line 18-20). The `.sidebar` element already has `transition: transform 0.3s ease-in-out` declared. Reusing this pattern means zero new animation code — just toggling a CSS class.

**Alternatives considered**:
- Icon-only collapsed state (narrow strip): Rejected — requires reworking every sidebar element to conditionally hide labels, significantly more complex for marginal UX benefit.
- `display: none` / `visibility: hidden`: Rejected — no animation possible, abrupt visual change.
- `width: 0` with overflow hidden: Rejected — more complex than transform, doesn't leverage existing transition.

## R-002: State Management Approach

**Decision**: Local `useState` in `MainLayout` with localStorage persistence, passed as props to `Sidebar`.

**Rationale**: Only two adjacent components consume this state (MainLayout and Sidebar as its direct child). The codebase already manages multiple state values in MainLayout (modals, active project, etc.). Adding a Context provider would be over-engineering for a single boolean consumed by parent-child components.

**Alternatives considered**:
- React Context + Provider (like ThemeProvider): Rejected — unnecessary indirection for parent-child state. ThemeProvider uses Context because deeply nested components (Settings page) need to read/write theme. No deeply nested component needs sidebar state.
- URL state / query params: Rejected — sidebar state is a UI preference, not navigation state.

## R-003: Icon Selection

**Decision**: Use `PanelLeftClose` (collapse button in sidebar header) and `PanelLeftOpen` (expand button in main content).

**Rationale**: Both are standard lucide-react icons available in v0.564.0+. They are semantically appropriate — `PanelLeftClose` depicts a panel sliding left (collapse), `PanelLeftOpen` depicts a panel emerging (expand). The codebase already imports many lucide-react icons.

**Alternatives considered**:
- `ChevronLeft` / `ChevronRight`: Less descriptive of panel behavior.
- `Menu` (hamburger): Typically implies mobile menu, not desktop sidebar toggle.

## R-004: Hover Styling Pattern (Dark Mode Compatibility)

**Decision**: Use `rgba(0, 0, 0, 0.05)` for hover backgrounds on toggle buttons, matching existing `.addProjectBtn:hover` and `.projectEditBtn:hover` patterns.

**Rationale**: All hover backgrounds in `Sidebar.module.css` use semi-transparent black overlays (`rgba(0, 0, 0, 0.03)` to `rgba(0, 0, 0, 0.05)`). These work in both light and dark modes without needing separate dark-mode overrides — the opacity layer adapts naturally to any background.

## R-005: Expand Button Placement

**Decision**: Fixed-position button at top-left of viewport (top: 16px, left: 16px), visible only when sidebar is collapsed and on desktop viewports.

**Rationale**: When the sidebar is collapsed, there's no persistent UI element to re-open it. A fixed button at the top-left mirrors where the sidebar header was, making it discoverable. z-index 999 keeps it below the sidebar (z-index 1000) to avoid overlap during animation.

## R-006: Testing Coverage

**Decision**: No new unit tests required; verify manually via dev server.

**Rationale**: The project uses Playwright integration tests (8 spec files in `tests/`). There are no existing unit tests for MainLayout or Sidebar. The feature is purely visual/interactive — CSS transitions and state toggling — best verified by running the app. Existing Playwright tests (e.g., `global-project-filtering.spec.ts`) use sidebar `data-testid` attributes and will continue to work since the sidebar defaults to expanded.
