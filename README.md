# Arre - High-Performance Productivity App

**Arre** is a modern, minimalist productivity application designed to help you focus on what matters. Inspired by the "White Paper" aesthetic with vibrant, surprising accents, Arre combines sleek design with deep work analytics.

![Arre Banner](https://via.placeholder.com/1200x600?text=Arre+App+Showcase)
_(Replace with actual screenshot)_

## 🚀 Features

### 🎨 Design & Experience

- **Premium Aesthetic**: Clean "White Paper" look for clarity, matched with a **High-Performance Dark Mode** featuring neon cyan and purple accents.
- **Responsive Layout**: Adaptive design with a collapsible Sidebar for desktop and a native-feel Bottom Navigation for mobile.
- **Theme System**: Robust toggling between Light, Dark, and System preferences.

### ⚡ Work Area (Inbox)

- **Deep Work Dashboard**: A specialized view for your inbox and active work.
- **Productivity Metrics**:
  - **Velocity Chart**: Visualizes your completion rate over the last 7 days.
  - **Daily Focus**: Tracks time spent in deep work with trend indicators.
  - **Task Progress**: Bar charts showing daily throughput.
- **Energy-Based Filtering**: Filter tasks by your current energy level:
  - 🟢 **Low Energy**: For quick wins and administrative tasks.
  - 🟡 **Neutral**: For standard workflow.
  - 🟣 **High Focus**: For "Deep Work" sessions.
- **Magic Import (AI)**:
  - Drag & Drop interface for PDFs and CSVs.
  - Generative AI analysis to extract actionable tasks.
  - One-click import to your task list.

### 📅 Smart Organization

- **Today View**: A focused list of tasks for right now, with a distinct **"This Evening"** section for separating work from personal time.
- **Planning Views**: Dedicated views for **Upcoming**, **Anytime**, and **Someday** to keep your roadmap clear.

### 📁 Project Management

- **Create/Edit/Delete Projects**: Full CRUD with a curated 10-color palette (Emerald, Sapphire, Ruby, Lavender, Gold, Cyan, Rose, Amber, Teal, Indigo).
- **Sidebar Projects List**: Real-time project list below nav items with color dots and hover-to-edit.
- **Assign Tasks to Projects**: Dropdown in task creation/edit modal.
- **Project Badges**: Tasks show their project with a color dot throughout all views.
- **Grouped Views**: Anytime and Someday views group tasks by project with color-coded section headers and task counts. Unassigned tasks appear under "Single Actions" / "Loose Ideas".

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite (TypeScript)
- **Styling**: CSS Modules + CSS Custom Properties (Variables)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

## 🧩 Application Structure

```mermaid
mindmap
  root((Arre App))
    Layout & UI
      Sidebar Desktop
        Nav Items
        Projects List
      BottomNav Mobile
      Theme Toggler Light/Dark

    Work Area Inbox
      Metrics
        Velocity Chart
        Focus Ring
      Energy Filters
        Low Energy
        High Focus Deep Work
      Task List
      Task Editor Modal
        Manual Entry
        Magic Import AI Analysis
        Project Selector

    Dashboard Today
      Current Tasks
      This Evening Section

    Planning
      Upcoming
      Anytime Grouped by Project
      Someday Grouped by Project

    Projects
      Project CRUD Modal
      Color Picker 10 colors
      Task Assignment
      Sidebar Listing

    Core Features
      TaskItem
        Toggle State
        Tags & Project Badge
        Notes
        Edit & Delete
      Firebase Firestore
```

## 📦 Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/arre.git
    cd arre
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Run the development server**

    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🗺️ Roadmap

### ✅ Completed

| Phase | Name                   | Highlights                                                                      |
| ----- | ---------------------- | ------------------------------------------------------------------------------- |
| 1     | Core App Structure     | Vite + React + TypeScript, Firebase Auth, Theming, Sidebar/BottomNav, All views |
| 2     | AI & Advanced Features | Magic Import (Gemini 1.5 Pro), Upcoming/Anytime/Someday views, Energy filtering |
| 3     | Testing Infrastructure | Playwright E2E, Anonymous auth for tests, 6-browser config, FAB for mobile      |
| 4     | Project Management     | CRUD with 10-color palette, Sidebar listing, Task assignment, Grouped views     |

### 🔜 Phase 5 — Polish, Stability & Deploy

| Priority | Task                                                                                          | Status  |
| -------- | --------------------------------------------------------------------------------------------- | ------- |
| P0 🔴    | **Test stability** — Re-validate all E2E tests against current UI, add project-specific tests | ✅ Done |
| P1 🟡    | **Code cleanup** — Upgrade Node.js 22.12+, remove inline styles, consolidate New Task buttons | ✅ Done |
| P2 🟢    | **Logbook view** — Completed tasks archive at `/logbook`, grouped by date                     | Pending |
| P3 🟡    | **Security & data integrity** — Firestore rules review, project deletion cascade              | ✅ Done |
| P4 🔵    | **Deployment** — Firebase Hosting + Functions deploy, CI/CD pipeline, PWA support             | Pending |

### 🔮 Future (Backlog)

- **Drag & Drop**: Reorder tasks within project groups
- **Project Filtering**: Click sidebar project → filter all views to that project
- **Recurring Tasks**: Weekly/monthly repeat patterns
- **Tags System**: Cross-cutting labels beyond projects
- **Keyboard Shortcuts**: Quick-add, view navigation, sidebar toggle
- **Mobile Native**: React Native / Expo version

## 🔥 Backend & Services

Arre uses **Firebase** for its backend infrastructure.

### Setup (Local Development)

To run the full stack locally (including Auth and Database emulators):

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Start the Emulators**:

    ```bash
    npm run emulators
    ```

    _This starts Auth (port 9099), Firestore (8080), and Functions (5001)._

3.  **Start the Frontend**:

    ```bash
    npm run dev
    ```

4.  **Open the App**:
    - Go to `http://localhost:5173`.
    - You will be redirected to `/login`.
    - Use the "Continue with Google" button (simulated) to create a local account.

### 📚 Backend Architecture

For a detailed breakdown of the Firestore schema, Security Rules, and Cloud Functions logic, please refer to:
[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)

### 🧪 Automated Testing

We use Playwright for E2E testing to ensure stability across all platforms. Current status:

- **Core Tests Passing**: Verified critical paths (Task Lifecycle, Magic Import).
- **Environment Handling**:
  - Desktop browsers (Chromium, Firefox, Webkit) enabled.
  - Mobile emulation temporarily disabled for stability.
  - Advanced flows (Project Management) skipped due to local emulator latency, but code is complete.
- Verified scenarios: Magic Import flow, Task Lifecycle, Cross-view Synchronization.

See the [Testing Guide](./TESTING.md) for instructions on running tests locally.

## 🛡️ Security & Reliability

- **Secret Management**: AI integration uses Firebase Secret Manager for GEMINI_API_KEY.
- **Granular Rules**: Firestore and Storage rules enforce strict per-user data isolation.
- **Hook Reliability**: State management via `useTasks` is optimized for real-time Firestore sync and consistent view state.

---

_Built with ❤️ for Deep Work._
