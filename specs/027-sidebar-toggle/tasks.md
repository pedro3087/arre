# Tasks: Sidebar Toggle

**Input**: Design documents from `/specs/027-sidebar-toggle/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No test tasks included — spec does not request TDD. Verification is manual via dev server (see research.md R-006).

**Organization**: Tasks grouped by user story. US1 and US2 share the same implementation (toggle is inherently bidirectional), so they are combined into one phase. US3 (persistence) builds on top.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: No setup needed — all dependencies (lucide-react, clsx) are already installed and no new files are created. This feature modifies 4 existing files only.

*Phase skipped — no tasks required.*

---

## Phase 2: Foundational (CSS Styles)

**Purpose**: Add all CSS classes that the component changes will reference. Styles can be added in parallel since they touch different CSS module files.

- [ ] T001 [P] Add `.collapsed`, `.headerRow`, and `.collapseBtn` styles in `src/layout/Sidebar.module.css` — `.collapsed` applies `transform: translateX(-100%)` inside `@media (min-width: 769px)`; `.headerRow` is a flex row with `justify-content: space-between`; `.collapseBtn` is 28px square, 6px radius, with `rgba(0, 0, 0, 0.05)` hover matching `.addProjectBtn`
- [ ] T002 [P] Add `.mainContentExpanded` and `.expandButton` styles in `src/layout/MainLayout.module.css` — `.mainContentExpanded` sets `margin-left: 0`; `.expandButton` is fixed position (top: 16px, left: 16px), 36px square, `var(--bg-paper)` background, `1px solid var(--border-subtle)` border, `var(--shadow-sm)` shadow, z-index 999, hidden on mobile via `@media (max-width: 768px)`

**Checkpoint**: All CSS classes exist — component changes can now reference them.

---

## Phase 3: User Story 1 & 2 — Collapse and Expand Sidebar (Priority: P1)

**Goal**: Users can collapse the sidebar via a button in the sidebar header, and re-expand it via a button in the main content area. Both actions animate smoothly.

**Independent Test**: Click the collapse button in the sidebar header — sidebar slides away, expand button appears. Click the expand button — sidebar returns.

### Implementation

- [ ] T003 [P] [US1] Update `SidebarProps` interface in `src/layout/Sidebar.tsx` — add `collapsed?: boolean` and `onToggleSidebar?: () => void`; import `PanelLeftClose` from lucide-react; apply `clsx(styles.sidebar, collapsed && styles.collapsed)` to root `<aside>`; restructure `.header` div to wrap logo and collapse button in a `styles.headerRow` flex row; collapse button calls `onToggleSidebar` with `aria-label="Collapse sidebar"`
- [ ] T004 [P] [US2] Add expand button and sidebar state to `src/layout/MainLayout.tsx` — import `clsx` and `PanelLeftOpen` from lucide-react; add `sidebarCollapsed` state with `useState<boolean>(() => false)` (persistence added in US3); add `toggleSidebar` handler that flips state; pass `collapsed={sidebarCollapsed}` and `onToggleSidebar={toggleSidebar}` to `<Sidebar />`; apply `clsx(styles.mainContent, sidebarCollapsed && styles.mainContentExpanded)` to `<main>`; render expand button with `PanelLeftOpen` icon, `aria-label="Expand sidebar"`, `className={styles.expandButton}`, visible only when `sidebarCollapsed` is true

**Checkpoint**: Sidebar toggle works — collapse and expand with smooth animation. State resets on page refresh (persistence not yet added).

---

## Phase 4: User Story 3 — Persist Sidebar State (Priority: P2)

**Goal**: The user's sidebar collapsed/expanded preference survives page refreshes and new browser sessions.

**Independent Test**: Collapse sidebar, refresh the page — sidebar should remain collapsed. Expand, refresh — should remain expanded.

### Implementation

- [ ] T005 [US3] Add localStorage persistence to sidebar state in `src/layout/MainLayout.tsx` — change `useState` initializer from `() => false` to `() => localStorage.getItem('sidebar-collapsed') === 'true'`; update `toggleSidebar` handler to call `localStorage.setItem('sidebar-collapsed', String(next))` when flipping state

**Checkpoint**: Full feature complete — toggle works with persistence across sessions.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and validation across all acceptance scenarios.

- [ ] T006 Run dev server (`npm run dev`) and verify collapse/expand animation is smooth (60fps, no jank)
- [ ] T007 Verify localStorage persistence — toggle sidebar, refresh page, confirm state preserved
- [ ] T008 Verify mobile behavior unchanged — resize to ≤768px, confirm sidebar hidden, expand button not visible, bottom nav works
- [ ] T009 Verify accessibility — tab to collapse/expand buttons, confirm they are focusable and have correct aria-labels
- [ ] T010 Run quickstart.md validation checklist from `specs/027-sidebar-toggle/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Skipped — no setup needed
- **Phase 2 (Foundational CSS)**: No dependencies — start immediately. T001 and T002 run in parallel.
- **Phase 3 (US1 & US2)**: Depends on Phase 2 CSS classes existing. T003 and T004 run in parallel (different files).
- **Phase 4 (US3)**: Depends on T004 (MainLayout state exists to add persistence to)
- **Phase 5 (Polish)**: Depends on all implementation tasks complete

### User Story Dependencies

- **US1 + US2 (P1)**: Combined — collapse and expand are two sides of the same toggle. Can start after Phase 2.
- **US3 (P2)**: Depends on US1/US2 state being implemented in MainLayout (T004)

### Within Each Phase

- Phase 2: T001 ∥ T002 (parallel — different CSS files)
- Phase 3: T003 ∥ T004 (parallel — different TSX files)
- Phase 4: T005 (sequential — modifies T004's output in MainLayout.tsx)

### Parallel Opportunities

- T001 + T002: CSS changes in separate module files
- T003 + T004: Component changes in separate TSX files
- Maximum parallelism: 2 concurrent tasks

---

## Parallel Example: Phase 2 + Phase 3

```text
# Phase 2 — launch both CSS tasks together:
Task: "Add .collapsed, .headerRow, .collapseBtn styles in src/layout/Sidebar.module.css"
Task: "Add .mainContentExpanded, .expandButton styles in src/layout/MainLayout.module.css"

# Phase 3 — launch both component tasks together:
Task: "Update SidebarProps and add collapse button in src/layout/Sidebar.tsx"
Task: "Add expand button and sidebar state in src/layout/MainLayout.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 2: CSS styles (T001, T002 in parallel)
2. Complete Phase 3: Sidebar + MainLayout changes (T003, T004 in parallel)
3. **STOP and VALIDATE**: Toggle works, animation smooth, no mobile regression
4. Deploy/demo if ready — toggle works, just doesn't persist

### Full Feature

1. Complete MVP above
2. Complete Phase 4: Add localStorage persistence (T005)
3. Complete Phase 5: Full validation (T006–T010)

---

## Notes

- Total tasks: 10 (2 CSS, 2 component, 1 persistence, 5 verification)
- Tasks per user story: US1/US2 combined = 2 tasks, US3 = 1 task
- Parallel opportunities: 2 pairs (T001∥T002, T003∥T004)
- MVP scope: Phases 2–3 (T001–T004) deliver working toggle without persistence
- All implementation tasks touch exactly 4 files — no new files created
