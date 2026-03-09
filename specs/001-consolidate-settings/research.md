# Research: Consolidate Settings into Sidebar Footer

**Branch**: `001-consolidate-settings` | **Date**: 2026-03-08

## Current State Analysis

### Sidebar Navigation (src/layout/Sidebar.tsx)

- `NAV_ITEMS` array (line 9-18) contains 8 entries including `{ path: '/settings', label: 'Settings', icon: SettingsIcon }` at line 17
- Sidebar footer (lines 137-144) contains a single `<button>` that calls `cycleTheme()` — cycles light → dark → system on click
- Theme state comes from `useTheme()` hook (`src/features/theme/ThemeProvider.tsx`)
- Footer CSS class is named `settingsButton` (Sidebar.module.css line 140) — misleadingly named for a theme toggle

### Bottom Navigation (src/layout/BottomNav.tsx)

- Already **does not include Settings** — only 6 items: Inbox, Today, Upcoming, Anytime, Someday, Logbook
- FR-007 from the spec is already satisfied with no changes required

### Settings Page (src/pages/Settings.tsx)

- Single section: "Integrations" (Google Tasks connect/disconnect + list selection)
- Uses CSS Module `Settings.module.css` with established section/card patterns
- No theme controls present

### Theme System (src/features/theme/ThemeProvider.tsx)

- Provides `useTheme()` hook exposing `{ theme, setTheme }`
- `theme` values: `'light'` | `'dark'` | `'system'`
- Persists to `localStorage` key `"vite-ui-theme"` automatically
- Three lucide icons already imported in Sidebar: `Sun` (light), `Moon` (dark), `Laptop` (system)

## Decisions

### Decision 1: Theme selector UI pattern in Settings

**Decision**: Three explicit selector buttons (segmented control / button group) — not a cycle button
**Rationale**: In Settings, discoverability matters more than brevity. Three labeled buttons (Light / Dark / System) let users see all options at a glance and select directly, unlike a cycle that requires multiple clicks and provides no visual feedback on available choices.
**Alternatives considered**: Radio inputs (more accessible but visually heavy for 3 options), dropdown select (overkill for 3 options), cycle button like the current sidebar (poor for a settings page where all options should be visible)

### Decision 2: Settings footer button element type

**Decision**: Use React Router `<Link to="/settings">` wrapped in the existing footer's button-styled element (or render as a `<Link>` with button CSS)
**Rationale**: Settings navigation is a route change, not an action. Using `<Link>` is semantically correct and provides browser-native navigation behavior (right-click to open in new tab, etc.). The existing `styles.settingsButton` CSS class remains usable for styling.
**Alternatives considered**: `useNavigate()` hook with a `<button onClick>` — works but semantically wrong for navigation

### Decision 3: CSS class rename

**Decision**: Rename `settingsButton` class to `footerLink` in Sidebar.module.css
**Rationale**: The current `settingsButton` class was named for a theme toggle button, not a settings link. Renaming aligns the class name with its new purpose and avoids future confusion.
**Alternatives considered**: Keep `settingsButton` — works but misleading; create new class — creates dead CSS

### Decision 4: Appearance section position in Settings page

**Decision**: Add Appearance section **before** Integrations
**Rationale**: Appearance is a fundamental, always-relevant preference. Integrations are optional and less commonly changed. Leading with Appearance reflects standard settings page conventions (System Preferences, iOS Settings, etc.).
**Alternatives considered**: After Integrations — less prominent placement for a more frequently accessed setting

### Decision 5: Scope of changes to Sidebar theme logic

**Decision**: Remove `cycleTheme`, `ThemeIcon`, `themeLabel`, and `useTheme` import entirely from Sidebar
**Rationale**: Sidebar no longer needs theme knowledge once the theme control moves to Settings. Removing dead code keeps the component clean.
**Alternatives considered**: Keep the theme logic available for future use — YAGNI, dead code complicates maintenance

## No NEEDS CLARIFICATION Items

All decisions resolved via codebase analysis and standard UI conventions. No external research or stakeholder input required.
