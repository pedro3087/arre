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

## 🔴 Known Bugs / Blockers (Must Fix)

### 1. `full-flow.spec.ts` has TWO `catch` blocks (syntax error)

**File**: `tests/full-flow.spec.ts`, lines 109–122  
**Problem**: There are two consecutive `catch (e)` blocks — invalid JavaScript syntax.  
**Fix**: Remove the first `catch` block or restructure the try/catch. The intent is:

```typescript
try {
  await expect(page.getByText("Tasks Generated")).toBeVisible({
    timeout: 20000,
  });
  await page.getByTestId("btn-import-all").click();
  await expect(page.getByText("Imported via Magic Import")).toBeVisible();
} catch (e) {
  console.log("AI step timed out or failed", e);
}
```

### 2. `full-flow.spec.ts` has duplicate comments/lines

**File**: `tests/full-flow.spec.ts`  
**Lines**: 13-14 (duplicate "Navigate to Upcoming"), 19-20 (duplicate "Create a task"), 50-51 (duplicate "Navigate to Someday"), 56-57 (duplicate "Create a Someday task"), 75-78 (duplicate `page.goto('/inbox')`)  
**Fix**: Remove the duplicate comment/code lines.

### 3. `full-flow.spec.ts` — unused `path` and `fs` imports

**File**: `tests/full-flow.spec.ts`, lines 3-4  
**Problem**: `import path from 'path'` and `import fs from 'fs'` cause lint errors because `@types/node` aren't resolved in the Playwright test context, and they're not actually used.  
**Fix**: Remove both imports.

### 4. `full-flow.spec.ts` — `Buffer.from()` not recognized

**File**: `tests/full-flow.spec.ts`, line 89  
**Problem**: `Buffer` is a Node.js global not available without proper types. Also, Playwright's `setInputFiles` accepts `Buffer` natively in Node.js context.  
**Fix**: Either add `/// <reference types="node" />` at the top, or use a simpler file upload approach.

### 5. `new-task.spec.ts` — `.catch()` on Locator (line 52)

**File**: `tests/new-task.spec.ts`, line 52  
**Problem**: `page.getByText('high', { exact: true }).catch(...)` — Playwright Locators don't have `.catch()`.  
**Fix**: Use proper try/catch or just click directly:

```typescript
await page.getByText("High").click();
```

### 6. `new-task.spec.ts` — login() redirects to `/` but test expects `/inbox`

**File**: `tests/utils.ts` line 7, and `tests/new-task.spec.ts` line 11  
**Problem**: `login()` asserts `toHaveURL('/')` (dashboard). Then `beforeEach` navigates to `/inbox`. If anonymous auth with emulator doesn't work, login will fail here.  
**Fix**: Ensure Firebase Auth emulator is running and anonymous auth is enabled. The emulator must be started with `npm run emulators` which includes `auth`.

### 7. Node.js Version Warning

**Problem**: Current Node.js is 22.10.0, but Vite 7 requires 20.19+ or **22.12+**.  
**Fix**: Upgrade Node.js to at least 22.12 (e.g., `nvm install 22.12` or download from nodejs.org).

### 8. Sidebar styling uses inline `<style>` tag

**File**: `src/layout/Sidebar.tsx`, lines 83-119  
**Problem**: The new "New Task" button and action group styles are injected via an inline `<style>` tag with CSS Module class references. This works but is not ideal — the styles should be in `Sidebar.module.css`.  
**Fix**: Move the styles from the inline `<style>` block into `src/layout/Sidebar.module.css` as proper CSS Module classes.

---

## 🟡 Tests Status — ALL 30 FAILING

| Test File           | Tests                     | Status     | Root Cause                                                                      |
| ------------------- | ------------------------- | ---------- | ------------------------------------------------------------------------------- |
| `new-task.spec.ts`  | 3 tests × 6 browsers = 18 | ❌ Failing | Login not working (anonymous auth not reaching emulator), `.catch()` on locator |
| `full-flow.spec.ts` | 2 tests × 6 browsers = 12 | ❌ Failing | Same login issue + syntax errors (double catch) + unused imports                |

### Why Tests Are Failing — Root Cause Analysis

1. **Primary**: The `login()` function clicks `dev-login-button` which calls `signInAnonymously(auth)` via Firebase Auth. For this to work **Firebase Auth emulator must be running** (`npm run emulators`) AND the app must be configured to connect to the auth emulator. Check `src/lib/firebase.ts` — verify `connectAuthEmulator(auth, 'http://localhost:9099')` is present and active.

2. **Secondary**: Even if login succeeds, the test files have syntax/type bugs listed in "Known Bugs" above.

3. **Mobile tests**: On mobile viewports (Pixel 5, iPhone 12), the sidebar is hidden. Tests try `btn-new-task-sidebar` first, fall back to `btn-new-task-fab`. The FAB is in MainLayout with `display: none` default, `display: flex` at `max-width: 768px`. This logic should work if the CSS is correct.

---

## 📁 Key Files Reference

### App Source (`src/`)

| File                                        | Purpose                                                              |
| ------------------------------------------- | -------------------------------------------------------------------- |
| `main.tsx`                                  | App entry, routing setup                                             |
| `App.tsx`                                   | Root component with providers                                        |
| `lib/firebase.ts`                           | Firebase init + emulator connections                                 |
| `lib/auth/AuthContext.tsx`                  | Auth context with Google + Anonymous sign-in                         |
| `lib/auth/ProtectedRoute.tsx`               | Route guard for authenticated users                                  |
| `layout/MainLayout.tsx`                     | Layout shell: Sidebar + Content + BottomNav + FAB + NewTaskModal     |
| `layout/Sidebar.tsx`                        | Desktop nav + "New Task" button                                      |
| `layout/BottomNav.tsx`                      | Mobile bottom nav                                                    |
| `pages/Login.tsx`                           | Login page with Google + Dev buttons                                 |
| `pages/Dashboard.tsx`                       | Today view                                                           |
| `pages/Inbox.tsx`                           | Inbox view (has its own "New Task" button too — `btn-new-task-main`) |
| `pages/Upcoming.tsx`                        | Groups tasks by date                                                 |
| `pages/Anytime.tsx`                         | Tasks without specific dates                                         |
| `pages/Someday.tsx`                         | Parked/someday tasks                                                 |
| `features/tasks/NewTaskModal.tsx`           | Create task modal (Manual + AI tabs)                                 |
| `features/tasks/TaskItem.tsx`               | Single task row component                                            |
| `features/tasks/hooks/useTasks.ts`          | Firestore CRUD hook                                                  |
| `shared/types/task.ts`                      | `TaskStatus`, `Project`, `PROJECT_COLORS`, `ProjectColor`            |
| `lib/types/firestore.ts`                    | Firestore document interfaces                                        |
| `features/projects/hooks/useProjects.ts`    | Firestore CRUD hook for projects (real-time)                         |
| `features/projects/ProjectModal.tsx`        | Create/edit/delete project modal with color picker                   |
| `features/projects/ProjectModal.module.css` | Styles for the project modal                                         |
| `pages/ProjectView.module.css`              | Shared styles for project-grouped views (Anytime, Someday)           |

### Functions (`functions/`)

| File           | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `index.js`     | `processMagicImport` Cloud Function (Gemini AI) |
| `package.json` | Node.js engine, dependencies                    |

### Tests (`tests/`)

| File                | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `utils.ts`          | `login()` helper — clicks dev-login-button                            |
| `new-task.spec.ts`  | 3 tests: open/close modal, create manual task, verify magic import UI |
| `full-flow.spec.ts` | 2 tests: full lifecycle across views, magic import file upload        |

### Config

| File                   | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `playwright.config.ts` | 6 browser configs, webServer on port 5173                             |
| `firebase.json`        | Emulator ports and config                                             |
| `package.json`         | Scripts including `emulators` with `auth,firestore,storage,functions` |

---

## 📋 What To Do Next (Priority Order)

### P0 — Fix Broken Tests

1. **Fix `full-flow.spec.ts` syntax**: Remove duplicate catch block, remove duplicate comments, remove unused `path`/`fs` imports
2. **Fix `new-task.spec.ts` line 52**: Replace `.catch()` on Locator with proper click
3. **Verify emulator auth**: Ensure `src/lib/firebase.ts` connects to auth emulator so anonymous login works
4. **Run tests with emulators**: Start emulators (`npm run emulators`), then run `npx playwright test` — ideally focus on chromium first: `npx playwright test --project=chromium`

### P1 — Clean Up Code

5. **Move Sidebar inline styles** to `Sidebar.module.css`
6. **Consolidate "New Task" buttons**: Inbox has its own `btn-new-task-main`; MainLayout also has the modal. Decide if Inbox should keep its own button or use the global one from Sidebar/FAB
7. **Upgrade Node.js** to 22.12+ for Vite compatibility

### P2 — Feature Completion

8. **Firestore security rules**: Verify rules allow read/write for authenticated users
9. **Magic Import E2E**: The AI test depends on a `GEMINI_API_KEY` secret. In emulator mode, either mock the function response or skip the AI assertion gracefully
10. ~~**Task editing/deletion**: Not yet implemented~~ ✅ Done (TaskEditorModal supports edit mode)
11. ~~**Project grouping**: Tasks can belong to projects (`projectId` field) but no project CRUD UI exists yet~~ ✅ Done (Phase 4)
12. **Logbook view**: Completed tasks archive grouped by date (route `/logbook`)
13. **Drag & drop**: Kanban-style reordering within project groups

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
