# Tasks: Land on New Task & UI Alignment

**Input**: Design documents from `/specs/025-new-task-alignment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are NOT explicitly requested in the specification, so focusing on implementation and manual verification per `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify feature branch `025-new-task-alignment` is active
- [x] T002 [P] Review `src/styles/variables.css` for current accent color and border-radius tokens

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 [P] Audit `src/features/dashboard/EnergyFilter.module.css` for pill design patterns to replicate

---

## Phase 3: User Story 1 - Default to Manual Creation (Priority: P1) 🎯 MVP

**Goal**: Land on the manual task entry form by default when opening the new task modal from any page.

**Independent Test**: Open the app, click 'New Task' from the Inbox, then from the Dashboard. In both cases, the "New Task" form (manual) should be visible first, not "Magic Import".

### Implementation for User Story 1

- [x] T004 Update `activeTab` default state in `src/features/tasks/TaskEditorModal.tsx` from `'ai'` to `'manual'` for new task flows.

**Checkpoint**: User Story 1 functional. Modal defaults to manual entry.

---

## Phase 4: User Story 2 - UI Alignment with Inbox (Priority: P2)

**Goal**: Align modal buttons and inputs with the Inbox page design (pill shapes, neon purple).

**Independent Test**: Open the modal; the "Create Task" button should be neon purple and fully rounded (pill shape).

### Implementation for User Story 2

- [x] T005 [P] Update `.createButton` in `src/features/tasks/TaskEditorModal.module.css` to use `var(--accent-purple-neon)` and `9999px` border-radius.
- [x] T006 Update `.projectSelect`, `.dateInput`, and `.titleInput` in `src/features/tasks/TaskEditorModal.module.css` to use standardized border-radius (aligned with Inbox search bar/pills).

**Checkpoint**: Modal buttons and inputs visually match the Inbox page.

---

## Phase 5: User Story 3 - Energy Level Pill Alignment (Priority: P2)

**Goal**: Align energy level selectors with the Dashboard's `EnergyFilter` pills.

**Independent Test**: Select energy levels in the modal; they should look like the pills on the dashboard (rounded, high-energy glow).

### Implementation for User Story 3

- [x] T007 [P] Update `.pill` in `src/features/tasks/TaskEditorModal.module.css` to `border-radius: 9999px` to match `EnergyFilter.tsx`.
- [x] T008 [P] Align `.highActive` state in `src/features/tasks/TaskEditorModal.module.css` with the dashboard's energy filter glow effect.

**Checkpoint**: Energy level selectors match dashboard pill aesthetics.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T009 [P] Remove any unused legacy styles or `TODO` comments related to task creation landing in `src/features/tasks/TaskEditorModal.tsx`.
- [x] T010 Run `quickstart.md` validation on all pages (Inbox, Dashboard, Sidebar).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 - Auditing existing styles is required before alignment.
- **User Story 1 (Phase 3)**: High priority MVP. Can be done immediately after Phase 2.
- **User Stories 2 & 3 (Phases 4 & 5)**: Depend on Phase 2. Can be done in parallel with each other.
- **Polish (Final Phase)**: Depends on all stories being complete.

---

## Parallel Example: UI Alignment

```bash
# Update multiple style classes in parallel:
Task: "Update .createButton in src/features/tasks/TaskEditorModal.module.css"
Task: "Update .pill in src/features/tasks/TaskEditorModal.module.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3 (Task T004).
2. **STOP and VALIDATE**: Verify modal defaults to manual entry.

### Incremental Delivery

1. Add User Story 2 → Verify purple pill buttons.
2. Add User Story 3 → Verify energy level pill shapes.
3. Final polish and verification across app.
