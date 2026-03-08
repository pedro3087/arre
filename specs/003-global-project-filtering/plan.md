# Implementation Plan: Global Project Filtering

## Phase 1: Context & Layout Setup

- Update `MainLayoutContext` type and `MainLayout` component to include `activeProjectId: string | null` and `setActiveProjectId` state updater.
- Pass this state down through `Outlet`.
- Update `Sidebar.tsx` props / consumption to recognize the active project.
- Modify `Sidebar.tsx` to clear the `activeProjectId` when navigating to `Inbox` (or clicking the same active project again to toggle off).

## Phase 2: Sidebar Visual Indication

- Highlight the active project in `Sidebar.tsx`. Add a selected background color or bold font indicating it is globally filtering the current view.
- Ensure the `ul > li` elements for projects are clickable, triggering `setActiveProjectId(project.id)`.

## Phase 3: Task Filtering Logic in `useTasks`

- Modify `src/features/tasks/hooks/useTasks.ts` to accept a second argument `filterProjectId`.
- In the `useEffect` handling Firestore queries, dynamically append `where('projectId', '==', filterProjectId)` if it's set and not null.
- Add local logic inside the Google Tasks fetch `useEffect` to completely hide Google Tasks if an internal project filter is currently active, since they do not share internal project references.

## Phase 4: Consuming Context in Views

- For `Inbox.tsx`, `Today.tsx`, `Upcoming.tsx`, `Anytime.tsx`, `Someday.tsx`, and `Logbook.tsx` views:
  - Destructure `activeProjectId` from `useOutletContext<MainLayoutContext>()`.
  - Pass `activeProjectId` down into the `useTasks(viewName, activeProjectId)` hook invocation.
- Optional UX: Display a subtitle or visual indicator inside the view's Header (e.g. "Today - Website Redesign Phase 2") so users know they are in a filtered list.

## Phase 5: Firestore Indexes & QA

- Check browser console during manual QA. Filtering with composite queries like `status == 'todo' AND projectId == xyz ORDER BY createdAt DESC` will require new exact composite indexes.
- Click the provided Firebase error index links to build the indexes.
- Update `firestore.indexes.json` via `firebase-tools` or manual copy paste to keep it checked into the repository.
