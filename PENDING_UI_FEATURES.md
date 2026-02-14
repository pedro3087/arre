# Pending UI Features (Post-Backend)

This document outlines the UI views and features that have been deferred until after the Backend Data Layer implementation.

**Reason for Deferral**: These views rely heavily on complex data filtering, sorting, and grouping (e.g., by Date, by Project). Building them with static mock data would require writing temporary logic that would be immediately discarded and rewritten once Firestore queries are available. Implementing them against the real database is significantly more efficient.

## 1. Upcoming View

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

## 2. Anytime View

**Route**: `/anytime`

### Design Requirements

- **Layout**: Tasks that act as a "Backlog" - they have no specific date but are actionable.
- **Input**: Should likely allow quick entry of tasks without dates.
- **Grouping**:
  - **By Project/Area**: Needs visual separators for "Work", "Personal", etc.
  - **No Project**: A "Single Actions" list for miscellaneous tasks.
- **Backend Query Needed**:
  - `tasks.where('date', '==', null).where('status', '!=', 'completed').orderBy('projectId')`

## 3. Someday View

**Route**: `/someday`

### Design Requirements

- **Layout**: Low-priority ideas and "maybe" items.
- **Visuals**: often slightly desaturated or visually distinct to indicate lack of urgency.
- **Actions**:
  - **"Activate"**: Quick way to move a task to "Inbox" or "Today".
  - **Review**: Drag and drop to organize priority.
- **Backend Query Needed**:
  - `tasks.where('status', '==', 'someday')` OR `tasks.where('list', '==', 'someday')`

## 4. Logbook (Completed)

**Route**: `/logbook` (Optional/Future)

### Design Requirements

- **Layout**: Reverse chronological list of all completed items.
- **Grouping**: By "Date Completed".
- **Backend Query Needed**:
  - `tasks.where('status', '==', 'completed').orderBy('completedAt', 'desc')`
