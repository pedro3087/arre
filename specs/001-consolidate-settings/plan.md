# Implementation Plan: Consolidate Settings into Sidebar Footer

**Branch**: `001-consolidate-settings` | **Date**: 2026-03-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-consolidate-settings/spec.md`

## Summary

Move the Settings navigation entry from the main sidebar nav list to the sidebar footer (replacing the theme cycle button), and relocate the theme toggle control (Light / Dark / System) into the Settings page as a new "Appearance" section rendered before the existing Integrations section.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18
**Primary Dependencies**: React Router v6 (Link/useLocation), lucide-react (icons), CSS Modules
**Storage**: localStorage (theme preference — no change to storage mechanism)
**Testing**: Vitest + React Testing Library
**Target Platform**: Web browser (desktop + mobile responsive)
**Project Type**: Web application (SPA)
**Performance Goals**: Theme change visually applies in under 500ms (already met by existing ThemeProvider)
**Constraints**: No new routes; Settings page URL (`/settings`) must remain unchanged; no backend changes

## Constitution Check

The project constitution file is an unfilled template with no ratified principles. No gates to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/001-consolidate-settings/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal — no new entities)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (files modified by this feature)

```text
src/
├── layout/
│   ├── Sidebar.tsx              # Remove Settings from NAV_ITEMS; replace theme button with settings Link
│   └── Sidebar.module.css       # Rename .settingsButton → .footerLink
├── pages/
│   ├── Settings.tsx             # Add Appearance section with theme selector
│   └── Settings.module.css      # Add theme selector styles
└── features/
    └── theme/
        └── ThemeProvider.tsx    # No changes (read-only dependency)
```

## Phase 0: Research

Complete. See [research.md](./research.md).

All decisions resolved through codebase analysis:
- Theme selector: segmented button group (3 explicit options)
- Footer element: `<Link>` for semantic navigation
- CSS class: rename `settingsButton` → `footerLink`
- Section order in Settings: Appearance before Integrations
- Sidebar cleanup: remove all theme-related logic from Sidebar

## Phase 1: Design & Contracts

### Data Model

No new entities. No schema changes. Theme preference continues to be persisted via the existing `localStorage` key `"vite-ui-theme"` managed by `ThemeProvider`. See [data-model.md](./data-model.md).

### UI Contracts

#### Sidebar Footer — After Change

| Element    | Type  | Target        | Content                  |
|------------|-------|---------------|--------------------------|
| footerLink | Link  | `/settings`   | SettingsIcon + "Settings" text |

The footer renders one interactive element (settings link) plus the dev-only `SeedButton`. The theme button is removed entirely.

#### Settings Page — Appearance Section (new)

| Element          | Type           | Values                    | Behavior                               |
|------------------|----------------|---------------------------|----------------------------------------|
| Section heading  | `<h2>`         | "Appearance"              | Consistent with "Integrations" heading |
| Theme selector   | Button group   | Light / Dark / System     | Active option highlighted; click calls `setTheme(value)` |
| Sun icon         | lucide Sun     | shown in Light button     | 20px, inline                           |
| Moon icon        | lucide Moon    | shown in Dark button      | 20px, inline                           |
| Laptop icon      | lucide Laptop  | shown in System button    | 20px, inline                           |

#### Acceptance contract

- Navigating to `/settings` continues to work (no route changes)
- `data-testid="nav-item-settings"` is removed from sidebar nav
- A new settings link in the sidebar footer navigates to `/settings`
- Selecting a theme option in Settings immediately changes `document.documentElement` class (via ThemeProvider)
- Selected theme option appears visually active (distinct styling from inactive options)
- Theme persists to `localStorage["vite-ui-theme"]` on every selection

### Implementation Steps

#### Step 1 — Sidebar.tsx: Remove Settings from NAV_ITEMS

Remove the Settings entry from the `NAV_ITEMS` constant (line 17):
```
{ path: '/settings', label: 'Settings', icon: SettingsIcon, color: 'text-secondary' }
```

Also remove unused imports: `Moon`, `Laptop`, `useTheme` (if no longer needed in Sidebar). Remove `cycleTheme`, `ThemeIcon`, `themeLabel` local variables.

Add `import { Link } from 'react-router-dom'` is already imported via `{ Link, useLocation }`.

#### Step 2 — Sidebar.tsx: Replace footer theme button with settings Link

Replace:
```tsx
<button className={styles.settingsButton} onClick={cycleTheme} title="Toggle Theme">
  <ThemeIcon size={20} />
  <span>{themeLabel} Mode</span>
</button>
```

With:
```tsx
<Link to="/settings" className={styles.footerLink}>
  <SettingsIcon size={20} />
  <span>Settings</span>
</Link>
```

`SettingsIcon` is already imported from lucide-react (line 2).

#### Step 3 — Sidebar.module.css: Rename class

Rename `.settingsButton` and `.settingsButton:hover` to `.footerLink` and `.footerLink:hover`. Styles remain identical.

#### Step 4 — Settings.tsx: Add Appearance section

Import `useTheme` from `../features/theme/ThemeProvider` and `Sun, Moon, Laptop` from `lucide-react`.

Add a new `<section className={styles.settingsSection}>` **before** the Integrations section:

```tsx
<section className={styles.settingsSection}>
  <h2>Appearance</h2>
  <div className={styles.themeSelector}>
    {[
      { value: 'light', label: 'Light', Icon: Sun },
      { value: 'dark',  label: 'Dark',  Icon: Moon },
      { value: 'system',label: 'System',Icon: Laptop },
    ].map(({ value, label, Icon }) => (
      <button
        key={value}
        className={clsx(styles.themeOption, theme === value && styles.themeOptionActive)}
        onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    ))}
  </div>
</section>
```

Add `import clsx from 'clsx'` if not already present.

#### Step 5 — Settings.module.css: Add theme selector styles

```css
.themeSelector {
  display: flex;
  gap: var(--spacing-2);
  background-color: var(--surface-overlay);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-1);
}

.themeOption {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.875rem;
  flex: 1;
  justify-content: center;
  transition: all 0.15s ease;
}

.themeOption:hover {
  color: var(--text-primary);
  background-color: var(--surface-base);
}

.themeOptionActive {
  background-color: var(--surface-base);
  color: var(--text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
```

### Testing Checklist

- [ ] Settings link in sidebar footer navigates to `/settings`
- [ ] Settings no longer appears as an item in the sidebar nav list
- [ ] Appearance section renders above Integrations in Settings page
- [ ] All three theme buttons (Light, Dark, System) render with correct icons
- [ ] Clicking each theme button immediately applies the correct theme
- [ ] Active theme button is visually distinct from inactive buttons
- [ ] Theme persists across page refresh (localStorage)
- [ ] System mode follows OS preference
- [ ] Sidebar no longer contains any theme toggle functionality
- [ ] Dev SeedButton still renders in footer (DEV only)
- [ ] Mobile layout: BottomNav unaffected (Settings already absent)
