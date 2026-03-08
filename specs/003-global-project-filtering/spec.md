# Feature: Global Project Filtering

## 1. Overview

The goal is to allow users to click a project in the sidebar and have that action globally filter all task views (Inbox, Today, Upcoming, Anytime, Someday, Logbook) to show only tasks belonging to the selected project.

## 2. Requirements & Acceptance Criteria

- **Clickable Sidebar Projects:** Sidebar project list items must be clickable, setting the global filter state.
- **Global Filter State:** The application must maintain an active project filter state (`activeProjectId`).
- **View Integration:** All task views (e.g., Today, Anytime) must respect `activeProjectId` and only render tasks that match.
- **Visual Indication:** The sidebar must visually highlight the currently selected project, indicating which project is currently filtering the view.

## 3. Architecture Changes

### Global State Management

We will introduce `activeProjectId` and `setActiveProjectId` to the React Context (`MainLayoutContext`) to persist the currently selected filter across page navigations.

- `src/layout/MainLayout.tsx`: Add `activeProjectId` state and pass it down via `Outlet` context. Add an `setActiveProjectId` function.

### Sidebar Updates

- `src/layout/Sidebar.tsx`:
  - Add `activeProjectId` and `setActiveProjectId` to props or context lookup.
  - Render an active state indicator on the project item if `activeProjectId === project.id`.
  - Provide a way to mutually toggle off the filter if the checked project is clicked again.
  - Clear the `activeProjectId` when navigating to a global top-level menu item like Inbox or Today? _Decision: we will keep the active project filter when jumping between views like Today to Anytime, as it maintains Context, UNLESS they click 'Inbox', since Inbox by definition has no project._

### Task Fetching (`useTasks`)

- `src/features/tasks/hooks/useTasks.ts`:
  - Update signature: `export function useTasks(view?: ViewType, filterProjectId?: string | null)`
  - Query logic: For every Firestore query built in the `switch (view)`, if `filterProjectId` is provided, append a new `where('projectId', '==', filterProjectId)`.
  - Google Tasks: Exclude them from combined results if an internal Arre project filter is active. Wait, do we exclude them or just fetch them and then filter them out? Yes, if `filterProjectId` is present, Google Tasks should be empty or hidden since they have no matching Arre `projectId`.

## 4. Edge Cases & Risks

- **Firestore Composite Indexes:** Filtering by project across various sorts (`createdAt` desc, `date` asc, `isEvening` asc) will strictly require new composite indexes in Firebase. We must update `firestore.indexes.json` or handle the runtime console errors correctly.
- **Inbox Logic:** `Inbox` items implicitly have `projectId == undefined`. If we apply `projectId == "some_id"`, the intersection is 0 tasks. So clicking Inbox could clear the active project filter to improve UX.
