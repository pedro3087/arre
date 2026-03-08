# Testing Guide for Arre App

We use **Playwright** for End-to-End (E2E) testing to ensure the application's critical user flows work as expected across different devices and browsers.

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js installed and dependencies are up to date:

```bash
npm install
```

### Install Browsers

Playwright needs to install its own browser binaries to run tests:

```bash
npx playwright install
```

---

## 🏃‍♂️ Running Tests

### 1. Run All Tests (Headless)

This will run all test files across all configured projects (Chromium, Firefox, WebKit, Mobile Chrome, etc.).

```bash
npx playwright test
```

_or via npm script:_

```bash
npm test
```

### 2. Interactive UI Mode (Recommended for Debugging)

This opens a visual interface where you can run tests, see each step, inspect the DOM, and view network requests.

```bash
npx playwright test --ui
```

_or via npm script:_

```bash
npm run test:ui
```

### 3. Run Specific Tests

**Run a specific project (e.g., Desktop Chrome only):**

```bash
npx playwright test --project=chromium
```

**Run Mobile tests only:**

```bash
npx playwright test --project="Mobile Chrome"
```

**Run a specific test file:**

```bash
npx playwright test tests/new-task.spec.ts
```

**Run tests matching a grep pattern:**

```bash
npx playwright test -g "manual task"
```

---

## 📱 Test Configuration

The configuration is located in `playwright.config.ts`. It includes:

- **Base URL**: `http://localhost:5173` (ensure your dev server is running, or Playwright will start it automatically).
- **Projects**:
  - **Desktop**: Chromium, Firefox, WebKit
  - ~~**Mobile**: Pixel 5 (Chrome), iPhone 12 (Safari)~~ (Disabled for MVP stability)
  - ~~**Tablet**: iPad Pro 11~~ (Disabled for MVP stability)

## ✍️ Writing Tests

We encourage using `data-testid` attributes for robust selectors that don't break when styles change.

**Example:**

```tsx
// In Component
<button data-testid="submit-btn">Submit</button>;

// In Test
await page.getByTestId("submit-btn").click();
```

### Key Test Files

- `tests/new-task.spec.ts`: Covers the "New Task" modal flows (Manual creation, Magic Import simulation).
- `tests/global-project-filtering.spec.ts`: Covers activating projects in the sidebar and verifying the global filter applied across views.
- `tests/task-drag-drop.spec.ts`: Covers the manual reordering of tasks within project groups.

---

## 📋 Test Scenario Inventory

For a comprehensive list of all test scenarios in BDD format (Given/When/Then), please refer to:
👉 [TEST_SCENARIOS.md](./TEST_SCENARIOS.md)

This section outlines the critical test scenarios for each major view and feature of the application. Use this as a checklist for manual testing or a roadmap for expanding automated test coverage.

### 1. **Dashboard (Today View)**

- **Load State**: Verify the page loads with the correct current date header.
- **Task Display**:
  - Verify "Today" tasks are listed.
  - Verify "This Evening" section appears only if evening tasks exist.
  - Verify empty state message ("No tasks for today") when lists are empty.
- **Interactions**:
  - Click task checkbox -> Monitor console/state for toggle event.

### 2. **Inbox (Work Area)**

- **Metrics Header**: Check visibility of Velocity Chart and Focus stats.
- **Filtering**:
  - Click "Low Energy" pill -> Verify list filters to only low energy tasks.
  - Click "High Focus" pill -> Verify list filters to only high energy tasks.
  - Click "All" (implied default) -> Verify all active tasks are shown.
- **New Task Trigger**:
  - Click "New Task" button -> Verify Modal opens.

### 3. **New Task Modal (Critical Path)**

- **Manual Entry Flow**:
  1. Open Modal -> Select "Manual" tab.
  2. Input Title: "Buy Milk".
  3. Input Notes: "2% Organic".
  4. Select Energy: "Low".
  5. Click "Create Task" -> Verify Modal closes -> Verify "Buy Milk" appears in Inbox list.
- **Magic Import Flow (AI Simulation)**:
  1. Open Modal -> Verify "Magic Import" tab is active.
  2. Click Drag & Drop Zone.
  3. Verify "Analyzing..." state appears.
  4. Wait for results -> Verify "3 Tasks Generated" message.
  5. Click "Import All Tasks" -> Verify Modal closes -> Verify batch of tasks appears in Inbox list.
- **Responsiveness**:
  - Resize viewport to mobile (<768px).
  - Verify Modal takes up full screen.
  - Verify Sidebar navigation moves to top/horizontal layout.

### 4. **Navigation & Layout**

- **Desktop Sidebar**:
  - Verify links to Inbox, Upcoming, Anytime, Someday work correctly.
  - Verify Logo and Branding are visible.
  - Verify Theme Toggle switches between Light/Dark/System modes.
- **Mobile Bottom Nav**:
  - Switch to mobile viewport.
  - Verify Sidebar disappears.
  - Verify Bottom Navigation bar appears.
  - Verify navigation tabs work correctly.

### 5. **Project Management Views**

- **Upcoming / Anytime / Someday**:
  - Verify routes load correctly.
  - Verify tasks are grouped by Project (or Date for Upcoming).
  - Verify "No Project" / "Single Actions" sections for unassigned tasks.
- **Project CRUD**:
  - Verify creation of new projects via sidebar.
  - Verify editing/deleting projects.
  - Verify task assignment to projects.
- **Global Filtering**:
  - Verify clicking a sidebar project applies `activeProject` state.
  - Verify task lists only show items for the active project.
  - Verify "Inbox" navigation clears the active project filter.
  - Verify visual feedback ("• Filtered" indicator) in view headers.
