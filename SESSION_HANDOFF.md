# Arre App — Session Handoff (2026-02-15)

## 🏗 Project Overview

**Arre** is a task management web app inspired by **Things 3** by Cultured Code, built with:

- **Frontend**: React 19 + Vite 7 + TypeScript + CSS Modules + Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Testing**: Playwright (E2E)
- **Location**: `c:\repos\pipe0.1\arre-app`

---

## ✅ Things Done (Completed)

### Phase 1 — Core App Structure

- [x] Project scaffolding with Vite + React + TypeScript
- [x] Firebase initialization (`src/lib/firebase.ts`) with emulator connections
- [x] Authentication system (`AuthContext.tsx`, `ProtectedRoute.tsx`, `Login.tsx`)
- [x] Theming system (light/dark/system via `ThemeProvider.tsx` + CSS variables)
- [x] MainLayout with Sidebar (desktop) + BottomNav (mobile)
- [x] Pages: Dashboard (Today), Inbox, Upcoming, Anytime, Someday, Login
- [x] Task management hook (`useTasks.ts`) with Firestore read/write
- [x] TaskItem and NewTaskModal components
- [x] DashboardStats + EnergyFilter components
- [x] CSS Variables design system (`styles/variables.css`)
- [x] SeedButton for dev data seeding

### Phase 2 — AI & Advanced Features

- [x] Cloud Function `processMagicImport` (`functions/index.js`) — parses PDF/CSV/text via Gemini 1.5 Pro
- [x] "Magic Import" tab in NewTaskModal connected to Cloud Function
- [x] "Someday" status added to `TaskStatus` type and `TaskDocument` interface
- [x] Date & Someday fields in NewTaskModal manual creation form
- [x] TaskItem shows due dates and "Someday" badge
- [x] Upcoming view groups tasks by date
- [x] Anytime view shows non-date tasks
- [x] Someday view shows `status: 'someday'` tasks with "Activate" action

### Phase 3 — Testing Infrastructure & Auth for E2E

- [x] **Anonymous auth support**: Added `signInAnonymously` to `AuthContext.tsx`
- [x] **Dev Login button**: Login page shows "Dev Login (Anonymous)" button in DEV mode (`data-testid="dev-login-button"`)
- [x] **Test utility**: `tests/utils.ts` — `login()` function clicks the dev-login-button
- [x] **NewTaskModal lifted to MainLayout**: Modal + `addTask` logic moved to `MainLayout.tsx` so it's accessible from any page
- [x] **Sidebar "New Task" button**: Added `onNewTask` prop to `Sidebar.tsx` with `data-testid="btn-new-task-sidebar"`
- [x] **FAB (Floating Action Button)**: Added in `MainLayout.tsx` for mobile viewports (`data-testid="btn-new-task-fab"`), hidden on desktop via CSS
- [x] **BottomNav aria-labels**: Added `aria-label={item.label}` to all BottomNav links
- [x] **Playwright config**: Tests run on chromium, firefox, webkit, Pixel 5, iPhone 12, iPad Pro 11
- [x] **Test files created**: `tests/new-task.spec.ts`, `tests/full-flow.spec.ts`, `tests/task-actions.spec.ts`

### Phase 4 — Project Management (Advanced Organization)

- [x] **`useProjects` hook** (`src/features/projects/hooks/useProjects.ts`): Full Firestore CRUD with real-time `onSnapshot` for `users/{uid}/projects` collection
- [x] **`ProjectModal` component** (`src/features/projects/ProjectModal.tsx`): Create/edit/delete projects with 10-color palette picker (Emerald, Sapphire, Ruby, Lavender, Gold, Cyan, Rose, Amber, Teal, Indigo)
- [x] **Sidebar Projects section**: Color dots + project names listed below nav items, hover-to-edit, "New Project" button
- [x] **Task-Project assignment**: Project selector dropdown in `TaskEditorModal` with color indicator dot
- [x] **Project badges on tasks**: `TaskItem` shows project badge (color dot + name) in meta row
- [x] **Anytime view grouped by project**: Tasks partitioned by project with color-coded section headers and task counts; unassigned tasks under "Single Actions"
- [x] **Someday view grouped by project**: Same grouping pattern; unassigned tasks under "Loose Ideas"
- [x] **Shared types**: `PROJECT_COLORS` constant and `ProjectColor` type in `shared/types/task.ts`
- [x] **`MainLayout` integration**: `useProjects` hook, `ProjectModal` state management, projects passed via Outlet context

---

## � What To Do Next — Phase 5: Polish, Stability & Deploy

The app's core feature set is now complete. The next phase is focused on **hardening** — fixing tests, cleaning up code, adding the final view (Logbook), and preparing for deployment.

### P0 — Test Stability (Critical) 🔴

The E2E test suite has accumulated issues across Phases 1–4. Tests must pass before any deployment.

1. **Audit all 3 test files** against the current UI:
   - `tests/new-task.spec.ts` (3 tests): Uses `new-task-modal` testid — verify these still match the TaskEditorModal's testids. The modal heading may have changed from "Magic Import" to something else after the TaskEditorModal rewrite.
   - `tests/full-flow.spec.ts` (2 tests): The magic import test is `test.skip`'d — this is fine. The lifecycle test creates tasks via openNewTaskModal helper — verify testids match.
   - `tests/task-actions.spec.ts` (1 test): Uses `btn-new-task-main` (Inbox-only) — this test only runs from `/inbox`. Verify the edit/delete flow still works. The test looks for `getByTitle('Edit')` and `getByTitle('Delete')` — confirm these title attributes exist on the TaskItem action buttons.

2. **Run tests and fix failures**:

   ```bash
   # Start emulators first
   npm run emulators
   # Run tests (chromium first for speed)
   npx playwright test --project=chromium
   # Then all browsers
   npx playwright test
   ```

3. **Add project-specific tests**: New test file `tests/project-management.spec.ts` covering:
   - Create a project via the ProjectModal
   - Assign a task to a project
   - Verify project badge appears on TaskItem
   - Verify project grouping in Anytime view
   - Edit and delete a project

### P1 — Code Cleanup & Technical Debt 🟡 (MOSTLY DONE ✅)

4. **Node.js version**: Current is 22.10.0, Vite 7 requires 22.12+. Upgrade via `nvm install 22.12` or download from nodejs.org. This causes a warning on every `vite` command but doesn't block functionality. ⏳ _Requires manual system upgrade_

5. ~~**Sidebar inline styles**~~: ✅ No inline `<style>` tags remain in any component.

6. ~~**Consolidate "New Task" buttons**~~: ✅ Inbox uses `openNewTaskModal` from `MainLayoutContext` — no duplicate modal management. The `btn-new-task-main` button in Inbox is intentional for the view's header UX.

7. ~~**TaskEditorModal vs NewTaskModal naming**~~: ✅ Deleted dead `NewTaskModal.tsx`. Renamed CSS module to `TaskEditorModal.module.css`. The `data-testid="new-task-modal"` on the DOM element is unchanged (tests use this).

8. ~~**Dashboard metrics unused imports**~~: ✅ Removed `useRef`, `Battery*`, `BatteryCharging`, `BatteryFull` from EnergyFilter. Removed `useTheme` and `fillColor` from VelocityChart. Properly typed `FilterPill` props (was `any`).

9. ~~**Debug console.logs**~~: ✅ Removed all debug `console.log` from `useTasks.ts` (5 statements). Kept `console.error` for real error handling.

10. ~~**Inline styles in TaskEditorModal**~~: ✅ Moved `<style>` block (metaRow, detailsColumn, dateRow, dateInput, somedayLabel, projectSelector, projectSelect, projectIndicator) into `TaskEditorModal.module.css`.

11. ~~**Fixed Anytime query**~~: ✅ The `anytime` Firestore query was filtering `where('projectId', '!=', null)` — this excluded tasks without a project. Changed to `where('status', 'not-in', ['completed', 'someday'])`.

12. ~~**Inbox hardcoded date**~~: ✅ Replaced "Monday, Oct 24" with dynamic `toLocaleDateString()`.

### P2 — Logbook View (New Feature) 🟢

9. **Route**: `/logbook` — add to `App.tsx` routing
10. **UI**: Reverse chronological list of completed tasks, grouped by "Date Completed"
11. **Query**: `tasks.where('status', '==', 'completed').orderBy('completedAt', 'desc')`
12. **Sidebar/BottomNav**: Add "Logbook" navigation item with appropriate icon (e.g., `BookOpen` from Lucide)
13. **Design**: Use the same `ProjectView.module.css` grouping pattern but group by date instead of project

### P3 — Firestore Security & Project Deletion 🟡

14. **Firestore rules** (`firestore.rules`): Currently allows any authenticated user to read/write their own `users/{userId}/**` data. This is correct but should be reviewed for the `projects` subcollection specifically. Current rules:

    ```
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    ```

    These wildcard rules already cover `users/{userId}/projects/{projectId}` — this is fine.

15. **Project deletion cascade**: When a project is deleted, tasks with that `projectId` should have their `projectId` cleared. Currently, deleting a project leaves orphaned `projectId` values on tasks. Options:
    - **Client-side**: In `handleDeleteProject`, query all tasks with that `projectId` and batch-update them
    - **Cloud Function**: Trigger on project deletion to clean up tasks
    - **UI tolerance**: The current code safely handles missing projects (badge just won't show)

### P4 — Deployment & CI/CD 🔵

16. **Firebase Hosting**: Deploy the built frontend
    ```bash
    npm run build
    firebase deploy --only hosting
    ```
17. **Cloud Functions**: Deploy the `processMagicImport` function
    ```bash
    firebase deploy --only functions
    ```
18. **CI/CD Pipeline**: GitHub Actions workflow for:
    - Build verification on PR
    - Playwright tests with Firebase emulators
    - Auto-deploy on merge to `main`

19. **PWA**: Add `vite-plugin-pwa` for offline support, service worker, and install prompt

### P5 — Future Enhancements (Backlog) 🔮

20. **Drag & Drop**: Reorder tasks within project groups (use `@dnd-kit/core`)
21. **Sidebar project navigation**: Click a project in sidebar → filter views to show only that project's tasks
22. **Recurring tasks**: Weekly/monthly repeat patterns
23. **Tags system**: Beyond projects — hashtag-style labels for cross-cutting concerns
24. **Keyboard shortcuts**: Quick-add task, navigate views, toggle sidebar
25. **Mobile native**: React Native / Expo version

---

## 🟡 Known Bugs / Issues

### 1. Test suite needs re-validation after Phase 4

**Impact**: Test files reference testids and UI elements from before the TaskEditorModal rewrite and project management additions. Some may fail due to:

- Changed headings/labels in the modal
- New project selector UI interfering with existing test flows
- Sidebar now has a "Projects" section that shifts layout

### 2. Node.js version warning

**Problem**: Node.js 22.10.0, Vite 7 needs 22.12+.
**Impact**: Warning only, not blocking.

### 3. Orphaned task projectIds

**Problem**: Deleting a project doesn't clear `projectId` from associated tasks.
**Impact**: Low — UI gracefully ignores unknown projectIds (badge just doesn't render).

---

## 📁 Key Files Reference

### App Source (`src/`)

| File                                        | Purpose                                                               |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `main.tsx`                                  | App entry, routing setup                                              |
| `App.tsx`                                   | Root component with providers + route definitions                     |
| `lib/firebase.ts`                           | Firebase init + emulator connections                                  |
| `lib/auth/AuthContext.tsx`                  | Auth context with Google + Anonymous sign-in                          |
| `lib/auth/ProtectedRoute.tsx`               | Route guard for authenticated users                                   |
| `layout/MainLayout.tsx`                     | Layout shell: Sidebar + Content + BottomNav + FAB + Modals + Projects |
| `layout/Sidebar.tsx`                        | Desktop nav + Projects list + "New Task" button                       |
| `layout/BottomNav.tsx`                      | Mobile bottom nav                                                     |
| `pages/Login.tsx`                           | Login page with Google + Dev buttons                                  |
| `pages/Dashboard.tsx`                       | Today view                                                            |
| `pages/Inbox.tsx`                           | Inbox view + energy filter + own "New Task" button                    |
| `pages/Upcoming.tsx`                        | Groups tasks by date                                                  |
| `pages/Anytime.tsx`                         | Groups tasks by project ("Single Actions" for unassigned)             |
| `pages/Someday.tsx`                         | Groups tasks by project ("Loose Ideas" for unassigned)                |
| `features/tasks/TaskEditorModal.tsx`        | Create/edit task modal with project selector                          |
| `features/tasks/TaskEditorModal.module.css` | Styles for task editor modal (renamed from NewTaskModal)              |
| `features/tasks/TaskItem.tsx`               | Single task row with project badge, edit/delete actions               |
| `features/tasks/hooks/useTasks.ts`          | Firestore CRUD hook for tasks (real-time)                             |
| `shared/types/task.ts`                      | `TaskStatus`, `Project`, `PROJECT_COLORS`, `ProjectColor`             |
| `lib/types/firestore.ts`                    | Firestore document interfaces                                         |
| `features/projects/hooks/useProjects.ts`    | Firestore CRUD hook for projects (real-time)                          |
| `features/projects/ProjectModal.tsx`        | Create/edit/delete project modal with color picker                    |
| `features/projects/ProjectModal.module.css` | Styles for the project modal                                          |
| `pages/ProjectView.module.css`              | Shared styles for project-grouped views (Anytime, Someday)            |

### Functions (`functions/`)

| File           | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `index.js`     | `processMagicImport` Cloud Function (Gemini AI) |
| `package.json` | Node.js engine, dependencies                    |

### Tests (`tests/`)

| File                   | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `utils.ts`             | `login()` helper — clicks dev-login-button                            |
| `new-task.spec.ts`     | 3 tests: open/close modal, create manual task, verify magic import UI |
| `full-flow.spec.ts`    | 2 tests: full lifecycle across views, magic import file upload (skip) |
| `task-actions.spec.ts` | 1 test: edit and delete a task from Inbox                             |

### Config

| File                   | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `playwright.config.ts` | 6 browser configs, webServer on port 5173                             |
| `firebase.json`        | Emulator ports and config                                             |
| `firestore.rules`      | Security rules (user-scoped read/write)                               |
| `package.json`         | Scripts including `emulators` with `auth,firestore,storage,functions` |

---

## 🧪 How To Run

```bash
# Start Firebase emulators (auth, firestore, storage, functions)
cd c:\repos\pipe0.1\arre-app
npm run emulators

# In another terminal — start dev server
npm run dev

# In another terminal — run tests
npx playwright test

# Run only chromium tests (faster iteration)
npx playwright test --project=chromium

# Show last test report
npx playwright show-report
```

---

## ⚙️ Environment Notes

- **Node.js**: v22.10.0 (needs 22.12+ for Vite 7)
- **OS**: Windows
- **Firebase Emulator Ports**: Auth=9099, Firestore=8080, Storage=9199, Functions=5001
- **Dev Server**: http://localhost:5173
- **`GEMINI_API_KEY`**: Required as Firebase secret for Cloud Functions AI features

---

## 🔑 data-testid Reference

| Test ID                | Component       | Notes                             |
| ---------------------- | --------------- | --------------------------------- |
| `login-button`         | Login.tsx       | Google sign-in button             |
| `dev-login-button`     | Login.tsx       | Anonymous sign-in (DEV only)      |
| `btn-new-task-main`    | Inbox.tsx       | Inbox-specific new task button    |
| `btn-new-task-sidebar` | Sidebar.tsx     | Desktop sidebar new task button   |
| `btn-new-task-fab`     | MainLayout.tsx  | Mobile floating action button     |
| `new-task-modal`       | TaskEditorModal | Modal container                   |
| `btn-close-modal`      | TaskEditorModal | Close modal X button              |
| `tab-manual`           | TaskEditorModal | Switch to manual task creation    |
| `input-title`          | TaskEditorModal | Task title input                  |
| `input-notes`          | TaskEditorModal | Task notes textarea               |
| `select-project`       | TaskEditorModal | Project selector dropdown         |
| `btn-create-task`      | TaskEditorModal | Submit manual task button         |
| `drop-zone`            | TaskEditorModal | Magic Import drop zone            |
| `btn-import-all`       | TaskEditorModal | Import all AI suggestions         |
| `project-modal`        | ProjectModal    | Project modal container           |
| `project-title-input`  | ProjectModal    | Project name input                |
| `color-{name}`         | ProjectModal    | Color swatch (e.g. color-emerald) |
| `btn-save-project`     | ProjectModal    | Save/Create project button        |
| `btn-delete-project`   | ProjectModal    | Delete project button             |
| `btn-new-project`      | Sidebar         | New project button in sidebar     |
| `task-item`            | TaskItem        | Individual task row               |
