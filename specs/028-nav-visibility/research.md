# Research: Navigation Visibility Toggles

**Feature**: 028-nav-visibility  
**Date**: 2026-06-08

## R-001: State Management Approach

**Decision**: React Context (`NavVisibilityProvider`) backed by localStorage.

**Rationale**: Unlike the sidebar-collapsed boolean (consumed only by MainLayout→Sidebar), the visibility map must be consumed by three independent components: `Sidebar`, `BottomNav`, and `Settings`. Props would require threading the state through `MainLayout` to `Sidebar` and separately to `BottomNav`, while `Settings` lives on a separate route entirely. Context cleanly provides shared state to any consumer. This exactly mirrors how `ThemeProvider` works in the codebase: a context that reads/writes localStorage and exposes a setter, consumed by unrelated components (`Settings` for writing, all themed components for reading).

**Alternatives considered**:
- Props drilling through MainLayout: Rejected — `Settings` is a top-level page routed independently; it cannot receive props from `MainLayout`.
- Firestore: Rejected — the existing sidebar-collapsed and theme preferences use localStorage. Firestore would add latency and complexity for a UI preference that doesn't need cross-device sync.
- URL state: Rejected — visibility preferences are persistent UI state, not navigational state.

## R-002: Storage Format

**Decision**: JSON object in localStorage under key `nav-visibility`. Shape: `Record<string, boolean>` where keys are route paths (`"/logbook"`, `"/kanban"`, etc.).

**Rationale**: Using route paths as keys means the map can be checked with a simple `visibility[item.path] !== false` in both Sidebar and BottomNav, which already have access to the path from `NAV_ITEMS`. Omitted keys default to `true` (visible), so new items added in future are visible by default without migration.

**Alternatives considered**:
- Array of hidden paths: An array of strings for hidden items. Slightly more compact, but checking membership is `includes()` vs `!== false` — minimal difference; the object form is cleaner and more explicit.
- Separate key per item: `nav-visibility-logbook`, etc. Unnecessarily verbose; harder to enumerate.

## R-003: Redirect Strategy for Hidden Routes

**Decision**: A `useEffect` in `App.tsx` (or a small `RedirectIfHidden` wrapper) that watches `location.pathname` and `visibility`. If the current path is in `NAV_ITEMS` and its visibility is `false`, redirect to the first visible item in `NAV_ITEMS` order.

**Rationale**: Cleanest place to intercept is at the router level. Using a small component rendered once inside the router keeps redirect logic co-located with routing rather than scattered in each page.

**Alternatives considered**:
- Per-page redirect in each route component: Redundant — duplicates the check in 8 files.
- Protected route wrapper: Possible, but existing `ProtectedRoute` is for auth; mixing nav visibility would conflate concerns.

## R-004: Toggle UI in Settings

**Decision**: Reuse the existing toggle/switch visual pattern already present in the Settings page (the Google Tasks list checkboxes or a similar row pattern from `Settings.module.css`).

**Rationale**: The Settings page already has styled rows. Adding a new section follows the established pattern. No new third-party toggle component needed.

**Alternatives considered**:
- Checkboxes: Less visually polished than toggle switches for an on/off preference.
- Select/dropdown: Overkill for boolean state.

## R-005: BottomNav Item Set

**Decision**: `BottomNav` uses a subset of `NAV_ITEMS` (it already omits AI Briefing). The same `NavVisibilityProvider` is consumed; the visibility filter simply filters whatever array `BottomNav` currently uses.

**Rationale**: Both nav components read from the same shared context. No separate mobile-only settings needed.

## R-006: Testing

**Decision**: Manual verification via dev server; no new automated tests.

**Rationale**: Consistent with the approach in 027-sidebar-toggle. The feature is purely UI/interaction. Existing Playwright tests do not test nav item visibility and will be unaffected (nav items default to visible).
