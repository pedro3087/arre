# Tasks: Consolidate Settings into Sidebar Footer

**Input**: Design documents from `/specs/001-consolidate-settings/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in each description

---

## Phase 1: Setup

No setup required. No new packages, routes, or infrastructure changes needed for this feature.

---

## Phase 2: Foundational

No blocking prerequisites. User stories can start immediately and independently.

---

## Phase 3: User Story 1 — Access Settings from Sidebar Footer (Priority: P1) 🎯 MVP

**Goal**: Remove Settings from the sidebar nav list and add a settings link to the sidebar footer, replacing the theme cycle button.

**Independent Test**: Open the app, confirm Settings no longer appears in the main sidebar nav list, click the settings icon/link in the sidebar footer, and verify navigation to `/settings` page.

### Implementation for User Story 1

- [x] T001 [US1] Remove Settings entry from NAV_ITEMS, strip all theme logic (cycleTheme, ThemeIcon, themeLabel, useTheme import, Moon, Laptop imports), and replace the footer `<button onClick={cycleTheme}>` with `<Link to="/settings" className={styles.footerLink}><SettingsIcon size={20} /><span>Settings</span></Link>` in `src/layout/Sidebar.tsx`
- [x] T002 [P] [US1] Rename `.settingsButton` and `.settingsButton:hover` to `.footerLink` and `.footerLink:hover` (keeping identical styles) in `src/layout/Sidebar.module.css`

**Checkpoint**: User Story 1 is complete. The sidebar footer shows a "Settings" link; no Settings entry appears in the main nav list. Verify by running the dev server and manually testing navigation.

---

## Phase 4: User Story 2 — Change Theme from Within Settings (Priority: P2)

**Goal**: Add an "Appearance" section to the Settings page with Light / Dark / System theme selector buttons, placed above the existing Integrations section.

**Independent Test**: Navigate to `/settings`, confirm an Appearance section renders above Integrations with three labeled buttons (Light, Dark, System). Click each button and confirm the app theme changes immediately. Refresh the page and confirm the selected theme persists.

### Implementation for User Story 2

- [x] T003 [US2] Add `import { useTheme } from '../features/theme/ThemeProvider'`, `import clsx from 'clsx'`, and `import { Sun, Moon, Laptop } from 'lucide-react'` to `src/pages/Settings.tsx`; call `const { theme, setTheme } = useTheme()` inside the component; insert a new Appearance `<section>` with `.themeSelector` button group (Light/Dark/System, each with icon and label, active state via `clsx(styles.themeOption, theme === value && styles.themeOptionActive)`) immediately before the existing Integrations `<section>` in `src/pages/Settings.tsx`
- [x] T004 [P] [US2] Add `.themeSelector`, `.themeOption`, `.themeOption:hover`, and `.themeOptionActive` CSS rules to `src/pages/Settings.module.css` — themeSelector uses flexbox with `var(--surface-overlay)` background and `var(--border-color)` border; themeOptionActive uses `var(--surface-base)` background and a subtle box-shadow; themeOption buttons share equal width via `flex: 1`

**Checkpoint**: User Story 2 is complete. Navigate to `/settings` and verify the Appearance section renders with all three theme options. Verify each option applies the theme immediately and persists across page refresh.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T005 Full smoke test: confirm sidebar footer link, removed nav entry, theme selector in Settings, theme persistence, and dev SeedButton still visible in footer (DEV mode only)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: N/A
- **User Story 1 (Phase 3)**: No dependencies — start immediately
- **User Story 2 (Phase 4)**: No dependencies on US1 — can start in parallel with US1
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent — touches only `Sidebar.tsx` and `Sidebar.module.css`
- **User Story 2 (P2)**: Independent — touches only `Settings.tsx` and `Settings.module.css`
- No cross-story file conflicts; both stories can be implemented simultaneously

### Within Each User Story

- **US1**: T001 and T002 can run in parallel (different files — `.tsx` vs `.module.css`)
- **US2**: T003 and T004 can run in parallel (different files — `.tsx` vs `.module.css`)

### Parallel Opportunities

```
Phase 3 (US1):
  Parallel: T001 (Sidebar.tsx) ‖ T002 (Sidebar.module.css)

Phase 4 (US2):
  Parallel: T003 (Settings.tsx) ‖ T004 (Settings.module.css)

US1 and US2 phases themselves can run in parallel (no shared files):
  Developer A: T001, T002  →  US1 complete
  Developer B: T003, T004  →  US2 complete
  Both: T005 (Polish)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: T001 + T002 (parallel)
2. **STOP and VALIDATE**: Open dev server, confirm sidebar footer has Settings link, confirm Settings removed from nav list
3. Merge if sufficient standalone value

### Incremental Delivery

1. Complete US1 (T001, T002) → Settings accessible from footer ✅
2. Complete US2 (T003, T004) → Theme control in Settings ✅
3. Complete Polish (T005) → Full smoke test

### Parallel Team Strategy

Single feature, two developers:
- Developer A: T001, T002 → US1 done
- Developer B: T003, T004 → US2 done
- Together: T005 (smoke test)

---

## Notes

- [P] tasks involve different files and have no shared dependencies — safe to run in parallel
- All 4 implementation tasks (T001–T004) are UI-only changes; no backend or data layer touched
- `clsx` is already a dependency in the project (used in Sidebar.tsx)
- `SettingsIcon` import already exists in `Sidebar.tsx` (line 2) — no new imports needed for Step 2
- `Sun`, `Moon`, `Laptop` are already imported in `Sidebar.tsx` — after removal of theme logic these move to `Settings.tsx`
- `useTheme` hook is already battle-tested; no changes to ThemeProvider needed
