# Pending UI Features (Post-Backend)

This document outlines the UI views and features that have been deferred until after the Backend Data Layer implementation.

**Reason for Deferral**: These views rely heavily on complex data filtering, sorting, and grouping (e.g., by Date, by Project). Building them with static mock data would require writing temporary logic that would be immediately discarded and rewritten once Firestore queries are available. Implementing them against the real database is significantly more efficient.

## 1. Upcoming View ✅ DONE

**Route**: `/upcoming`

### Design Requirements

- **Layout**: A vertically scrolling list grouped by Date dates.
- **Sections**:
  - **Tomorrow**: Explicit header.
  - **Next 7 Days**: Day-by-day headers (e.g., "Wednesday", "Thursday").
  - **Future**: Month/Year headers for tasks further out.
- **Task Item**: Standard task row, but must show the specific Date/Time if set.
- **Backend Query Needed**:
  - `tasks.where('date', '>', today).orderBy('date', 'asc')`

## 2. Anytime View ✅ DONE (Phase 4: Project Grouping)

**Route**: `/anytime`

### Design Requirements

- **Layout**: Tasks that act as a "Backlog" - they have no specific date but are actionable.
- ~~**Input**: Should likely allow quick entry of tasks without dates.~~ Uses global TaskEditorModal.
- **Grouping**: ✅ **IMPLEMENTED**
  - **By Project**: Tasks grouped under project headings with color-coded dots and task counts.
  - **No Project**: A "Single Actions" list for unassigned tasks.
- **Backend Query Needed**:
  - `tasks.where('date', '==', null).where('status', '!=', 'completed').orderBy('createdAt', 'desc')`

### Implementation Notes

- Uses `ProjectView.module.css` shared styles.
- Groups via `useMemo` partitioning of tasks by `projectId`.
- Projects sourced from `MainLayoutContext` (Outlet context).

## 3. Someday View ✅ DONE (Phase 4: Project Grouping)

**Route**: `/someday`

### Design Requirements

- **Layout**: Low-priority ideas and "maybe" items.
- ~~**Visuals**: often slightly desaturated or visually distinct to indicate lack of urgency.~~
- **Grouping**: ✅ **IMPLEMENTED**
  - **By Project**: Same as Anytime, with color-coded section headers.
  - **No Project**: "Loose Ideas" section for unassigned someday tasks.
- **Actions**:
  - **"Activate"**: Quick way to move a task to "Inbox" or "Today" (toggle sends to `status: 'todo'`).
  - ~~**Review**: Drag and drop to organize priority.~~ Deferred.
- **Backend Query Needed**:
  - `tasks.where('status', '==', 'someday')`

### Implementation Notes

- Shares `ProjectView.module.css` with Anytime view.
- "Activate" action sets `status: 'todo'`, moving task back to Inbox.

## 4. Logbook (Completed) — PENDING

**Route**: `/logbook` (Optional/Future)

### Design Requirements

- **Layout**: Reverse chronological list of all completed items.
- **Grouping**: By "Date Completed".
- **Backend Query Needed**:
  - `tasks.where('status', '==', 'completed').orderBy('completedAt', 'desc')`

## 5. Project Management ✅ DONE (Phase 4)

### What was built:

- **`useProjects` hook**: Full Firestore CRUD at `users/{uid}/projects` with real-time `onSnapshot`.
- **`ProjectModal`**: Create/edit/delete with 10-color palette (Emerald, Sapphire, Ruby, Lavender, Gold, Cyan, Rose, Amber, Teal, Indigo).
- **Sidebar integration**: Projects listed below nav items with color dots and hover-to-edit.
- **Task assignment**: Project selector dropdown in `TaskEditorModal`.
- **Task badges**: `TaskItem` shows project color dot + name.
- **View grouping**: `Anytime` and `Someday` views partition tasks by project.
