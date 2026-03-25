# Research: Project Kanban Board

**Branch**: `001-project-kanban` | **Phase**: 0 | **Date**: 2026-03-24

---

## Decision 1: Drag-and-Drop Library

**Decision**: Add **@dnd-kit** (`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`) as the drag-and-drop solution for the kanban board.

**Rationale**: Framer Motion's `Reorder` component (already in use) is designed exclusively for single-axis list sorting within one container. Cross-column kanban drag-and-drop requires dragging items between sibling containers — a use case Framer Motion's `Reorder` does not support. `@dnd-kit` is the current React ecosystem standard for this pattern: it is lightweight, fully accessible (ARIA attributes, keyboard navigation), has excellent TypeScript support, and is purpose-built for sortable lists and droppable containers. It integrates cleanly alongside Framer Motion (which can still handle card animations via CSS transitions or layout animations).

**Alternatives considered**:
- **Framer Motion `drag` + custom drop zones**: Possible, but requires manual pointer-tracking, hit-testing logic, and scroll handling — significant complexity for a solved problem.
- **react-beautiful-dnd**: Mature but officially in maintenance-only mode (no new features); poor support for horizontal columns.
- **Custom HTML5 drag-and-drop API**: Unreliable on touch devices, no smooth animations out of the box.

---

## Decision 2: Kanban Status Storage

**Decision**: Store kanban workflow statuses as a user-owned Firestore sub-collection: `users/{uid}/kanbanStatuses`. Each document represents one column.

**Rationale**: Kanban statuses are user-configurable (add/rename/reorder) and must persist across sessions. Firestore is the existing persistence layer for all user data. A sub-collection gives each status a stable ID, supports real-time updates, and allows ordered queries. The `order` field (integer) controls column sequence. One status document is flagged `isFinal: true` to designate the auto-completion trigger.

Default statuses are seeded on first Kanban page visit if no `kanbanStatuses` documents exist:
| order | label | isFinal |
|-------|-------|---------|
| 0 | To Do | false |
| 1 | In Progress | false |
| 2 | Done | true |

**Alternatives considered**:
- **App-level config doc** (`users/{uid}/config.kanbanStatuses`): Array field — simpler but makes atomic reordering writes harder; no stable IDs per status.
- **Hardcoded statuses**: Rejected because the spec requires user configurability.

---

## Decision 3: Task Status Field Strategy

**Decision**: Add a new optional field `kanbanStatusId?: string` to the existing `Task` type. This field stores the ID of the `KanbanStatus` document the task is currently assigned to. The existing `status: TaskStatus` field (`'todo' | 'completed' | 'canceled' | 'someday'`) is **not replaced**.

**Rationale**: Decoupling kanban workflow state from the task lifecycle status avoids breaking all existing views (Today, Inbox, Upcoming, Logbook, Someday). Tasks retain their current `status` for all existing filtering logic. On the kanban board, tasks with a `projectId` matching the selected project AND with a `kanbanStatusId` are shown. When dropped into the final column, the task's `status` is set to `'completed'` and `kanbanStatusId` is cleared — the existing Logbook picks it up automatically.

Tasks with no `kanbanStatusId` assigned to a project appear in the first (default) column on the kanban board, so they are still visible and actionable.

**Alternatives considered**:
- **Reuse existing `status` field**: Kanban needs arbitrary user-defined stages, but `status` is a union type tied to specific app behaviors. Mixing concerns would break Today/Inbox/Logbook filtering.
- **Separate `kanbanTasks` collection**: Unnecessary duplication; Firestore costs increase and sync complexity grows.

---

## Decision 4: New Route and Navigation Placement

**Decision**: Add a new `/kanban` route and a Kanban entry in the existing `Sidebar` and `BottomNav` components. Use a `Kanban` page component (`src/pages/Kanban.tsx`) following the existing page pattern.

**Rationale**: All existing views follow a Page Component + Route pattern. Kanban is a top-level navigation destination. Adding it to the sidebar keeps navigation consistent. The sidebar already lists: Today, Inbox, Upcoming, Anytime, Someday, Logbook — Kanban fits naturally after Anytime/Someday.

---

## Decision 5: Kanban Column Settings UI

**Decision**: Kanban column management (add/rename/reorder) is a new section within the existing **Settings page** (`src/pages/Settings.tsx`), not a separate settings page.

**Rationale**: The app already has a Settings page used for theme and other preferences. Adding a "Kanban Columns" section there is consistent with the existing pattern and avoids creating another top-level route. The section allows: adding a new column, renaming any column by clicking its label, dragging to reorder, and toggling which column is "final". Deleting a column is allowed only if it has no tasks currently assigned to it.

---

## Decision 6: Empty kanbanStatusId Handling

**Decision**: Tasks belonging to the selected project that have `kanbanStatusId === undefined` (not yet assigned to a kanban column) are displayed in the **first column** (lowest `order` value) on the kanban board.

**Rationale**: Ensures no tasks are "lost" or invisible when first viewing the kanban board after the feature is added. It also means no migration is needed — all existing project tasks immediately show up in the first column.
