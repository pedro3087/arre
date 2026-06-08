# Tasks: Navigation Visibility Toggles

**Input**: Design documents from `/specs/028-nav-visibility/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks generated (manual verification per quickstart.md).

**Organization**: Tasks grouped by user story. US1 (hide item) and US2 (re-enable) share the same implementation phase — the toggle mechanism is inherently bidirectional. US3 (persistence) is delivered by the foundational NavVisibilityProvider. US4 (redirect) is a standalone additive task.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the single prerequisite needed before any story work can begin — exporting `NAV_ITEMS` as a shared constant so both `Settings.tsx` and `App.tsx` can reference it.

- [x] T001 Export `NAV_ITEMS` array as a named export from `src/layout/Sidebar.tsx` (currently only used locally)

**Checkpoint**: `NAV_ITEMS` importable by Settings.tsx, App.tsx, BottomNav.tsx.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the `NavVisibilityProvider` context and mount it in the app. All three user story phases depend on this being in place first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Create `src/features/navigation/NavVisibilityProvider.tsx` — React context with `visibility: Record<string, boolean>`, `toggleItem(path)`, `isVisible(path)` and `useNavVisibility()` hook; read/write `nav-visibility` key in localStorage
- [x] T003 Wrap the authenticated route tree with `<NavVisibilityProvider>` in `src/App.tsx` (inside `<BrowserRouter>`, above `<MainLayout>`)

**Checkpoint**: `useNavVisibility()` hook returns default visibility (all true) from any component in the tree; localStorage key is written on first toggle.

---

## Phase 3: User Stories 1 & 2 — Hide / Re-enable Menu Items (Priority: P1) 🎯 MVP

**Goal**: Sidebar and BottomNav filter their items by the visibility map; Settings has a "Navigation" section with one toggle per item.

**Covers US2 as well**: The toggle in Settings writes `false` (hide) or back to `true`/omitted (show), so US2 (re-enable) is the reverse of US1 with zero additional code.

**Independent Test**: Open Settings → toggle "Logbook" off → sidebar loses Logbook immediately. Toggle it back on → it reappears. Resize to mobile → BottomNav also reflects the setting.

- [x] T004 [P] [US1] Filter `NAV_ITEMS` in `src/layout/Sidebar.tsx` using `isVisible(item.path)` from `useNavVisibility()`
- [x] T005 [P] [US1] Filter items in `src/layout/BottomNav.tsx` using `isVisible(item.path)` from `useNavVisibility()`
- [x] T006 [US1] Add "Navigation" section with a labeled toggle row per NAV_ITEMS entry in `src/pages/Settings.tsx` (import `useNavVisibility`, `toggleItem`, `NAV_ITEMS`; render toggle per item using `isVisible` as checked state)
- [x] T007 [US1] Add `.navToggleRow`, `.navItemInfo`, `.toggleSwitch`, and `.toggleSwitchOn` styles in `src/pages/Settings.module.css` — reuse existing color/spacing tokens from the file; style the toggle as a pill button that flips color on active state

**Checkpoint**: All 8 nav items appear in Settings with working on/off toggles; Sidebar and BottomNav immediately reflect changes; no page reload required.

---

## Phase 4: User Story 3 — Persistence Across Sessions (Priority: P2)

**Goal**: Visibility preferences survive page reload and new browser sessions.

**Note**: Persistence is implemented inside T002 (localStorage read on init, write on toggle). This phase is a validation checkpoint — no new code needed unless a defect is found during verification.

**Independent Test**: Hide "Kanban", reload the page → Kanban is still absent. Settings toggle still shows it as off.

- [x] T008 [US3] Verify `NavVisibilityProvider` initialises `visibility` from `localStorage.getItem('nav-visibility')` on mount and confirm the `toggleItem` function persists each change — fix any defect found in T002

**Checkpoint**: Preference survives hard refresh; new tabs inherit the same preference (shared localStorage).

---

## Phase 5: User Story 4 — Redirect When Active Route is Hidden (Priority: P2)

**Goal**: Navigating to or currently on a hidden route moves the user to the first visible nav item.

**Independent Test**: Navigate to `/kanban`. Open Settings and hide Kanban. App immediately redirects to the first visible nav item (e.g., `/inbox` or `/`).

- [x] T009 [US4] Add a `RedirectIfHidden` component rendered inside the router in `src/App.tsx`: reads `location.pathname` + `isVisible`; if the current path matches a `NAV_ITEMS` entry and `isVisible` returns false, call `navigate` to the first item where `isVisible` is true (fallback `/inbox` if all hidden)

**Checkpoint**: Hiding the active route triggers an immediate redirect; direct-URL navigation to a hidden route redirects on load.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T010 [P] Confirm `CLAUDE.md` reflects `028-nav-visibility` in Active Technologies and Recent Changes (already updated in /speckit.plan run; verify and fix if out of date)
- [ ] T011 Run quickstart.md verification steps end-to-end against the dev server and confirm all 7 checkpoints pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → No dependencies, start immediately
- **Foundational (Phase 2)** → Depends on T001 (NAV_ITEMS export) — BLOCKS phases 3-5
- **Phase 3 (US1/US2)** → Depends on T002 + T003; T004 and T005 can run in parallel; T006 depends on T004/T005 being understood first
- **Phase 4 (US3)** → Depends on T002 (already complete); T008 is a validation step only
- **Phase 5 (US4)** → Depends on T002 + T003; fully independent of Phase 3
- **Polish** → Depends on all phases complete

### User Story Dependencies

- **US1/US2 (P1)**: Start after T002 + T003 — no dependency on US3 or US4
- **US3 (P2)**: Delivered by T002; T008 validates it — can run in parallel with US1 phases
- **US4 (P2)**: Fully independent of US1/US2; only needs the context from T002 — can run in parallel with Phase 3

### Within Phase 3

- T004 and T005 are fully independent (different files) → run in parallel
- T006 reads from `useNavVisibility()` already available → can follow immediately after T004/T005
- T007 (CSS) is independent of T006 logic → can run in parallel with T006

---

## Parallel Opportunities

```bash
# After T001 is done, launch T002+T003 sequentially, then:

# Phase 3 — launch in parallel:
Task T004: Filter NAV_ITEMS in src/layout/Sidebar.tsx
Task T005: Filter items in src/layout/BottomNav.tsx

# Phase 4+5 — launch in parallel after T002+T003:
Task T008: Validate persistence in NavVisibilityProvider
Task T009: Add RedirectIfHidden in src/App.tsx

# After T006+T007 done, run in parallel:
Task T010: Verify CLAUDE.md
Task T011: Run quickstart.md verification
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: T001 (export NAV_ITEMS)
2. Complete Phase 2: T002 + T003 (provider + mount)
3. Complete Phase 3: T004 → T005 → T006 → T007
4. **STOP and VALIDATE**: Toggle items in Settings, verify desktop sidebar and mobile bottom nav update instantly
5. Ship — persistence (US3) and redirect (US4) are polish items

### Incremental Delivery

1. T001 + T002 + T003 → Context wired, feature invisible to users
2. T004 + T005 → Nav items filterable (Settings not yet wired, all visible by default)
3. T006 + T007 → Settings section live — full US1/US2 MVP ✓
4. T008 → Validate persistence (likely already working) ✓
5. T009 → Redirect safety net ✓

---

## Summary

| Phase | Tasks | User Story | Parallelizable |
|-------|-------|------------|----------------|
| Setup | T001 | — | No |
| Foundational | T002, T003 | — | No (sequential) |
| US1/US2 | T004, T005, T006, T007 | US1 + US2 | T004‖T005, T007‖T006 |
| US3 | T008 | US3 | ‖ Phase 5 |
| US4 | T009 | US4 | ‖ Phase 4 |
| Polish | T010, T011 | — | T010‖T011 |

**Total tasks**: 11  
**MVP scope**: T001 → T007 (7 tasks, delivers US1 + US2 in full)
