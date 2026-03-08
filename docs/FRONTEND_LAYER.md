# Frontend Layer: UI, Layout, and User Experience

This document outlines the architecture and philosophy of the Arre application's frontend. It covers the business rationale, the technology stack, and the implementation details that create the app's signature user experience.

## 1. Business Case

For a productivity application like Arre, the user interface is not just a feature; it is the core product. A clean, intuitive, and responsive UI is paramount for user retention and satisfaction. The business objectives for the frontend are:

- **Drive User Adoption:** Create a visually appealing, "premium" aesthetic that makes the app a pleasure to use, encouraging users to integrate it into their daily workflow.
- **Reduce Cognitive Load:** A minimalist design, clear navigation, and focused views help users concentrate on their tasks without distraction.
- **Ensure Accessibility & Reach:** A responsive design that works flawlessly on both desktop and mobile devices allows users to be productive anywhere, expanding the app's utility and market reach.
- **Increase Engagement:** Fluid animations and micro-interactions provide positive feedback and make the app feel alive and responsive, fostering a deeper connection with the user.

## 2. Tooling & Technology

The frontend stack was chosen to prioritize developer experience, performance, and robustness.

| Tool                  | Purpose & Application                                                                                                                                                                                                                       |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React (v19)**       | The foundational library for building the user interface. Arre is built as a tree of reusable components, from atomic elements like buttons to complex views like the Dashboard.                                                            |
| **Vite**              | The build tool and development server. Chosen for its extremely fast startup times and instant Hot Module Replacement (HMR), which dramatically speeds up the development feedback loop.                                                    |
| **React Router (v7)** | Manages all client-side routing. It enables the Single Page Application (SPA) architecture, allowing seamless navigation between views like `/inbox`, `/dashboard`, and `/someday` without full page reloads.                               |
| **CSS Modules**       | The primary styling strategy. Each component's styles are locally scoped by default (e.g., `MainLayout.module.css`), preventing class name collisions and ensuring styles are encapsulated. This is supplemented by a global style system.  |
| **CSS Variables**     | Used extensively in `styles/variables.css` to power the theming system. By defining colors, fonts, and spacing as variables, the entire application's look can be changed by simply switching a `data-theme` attribute on the root element. |
| **Framer Motion**     | A production-ready animation library for React. It is used to create smooth page transitions, subtle micro-interactions, and the **Drag & Drop** reordering experience in task lists via `Reorder.Group` and `Reorder.Item`.                |
| **Lucide React**      | Provides a library of clean, lightweight, and consistent icons that are crucial to Arre's minimalist aesthetic.                                                                                                                             |
| **Recharts**          | A composable charting library used to build the data visualization components in the Dashboard, such as the `VelocityChart`.                                                                                                                |

## 3. Implementation Details

The frontend is structured to be modular, scalable, and easy to maintain.

### a. Application Entrypoint (`src/App.tsx`)

- **Root Component:** `App.tsx` is the entry point.
- **Providers:** It wraps the entire application in essential providers:
  - `ThemeProvider`: Manages the light/dark/system theme.
  - `AuthProvider`: Handles user authentication state.
  - `BrowserRouter`: Enables routing.
- **Route Definitions:** It defines all the application's routes, including the public `/login` page and the `ProtectedRoute` wrapper that guards the main application layout.

### b. Layout System (`src/layout/`)

The core application layout is managed by `MainLayout.tsx` and is designed to be responsive.

- **Desktop View:** On larger screens, it displays a persistent `Sidebar.tsx` on the left, which contains primary navigation and the user's list of projects.
- **Mobile View:** On smaller screens, the sidebar is hidden, and a `BottomNav.tsx` component appears at the bottom, providing a native mobile app feel. A Floating Action Button (FAB) is also present for quickly adding new tasks.
- **Content Display:** The `Outlet` component from React Router is used within `MainLayout` to render the active page's content (e.g., `Dashboard.tsx`, `Inbox.tsx`).

### c. Theming (`src/features/theme/ThemeProvider.tsx`)

Arre's theming system is a key feature, providing user choice and a high-performance dark mode.

- **Mechanism:** `ThemeProvider` is a React Context provider that tracks the current theme (`light`, `dark`, or `system`).
- **Persistence:** The user's theme preference is saved to `localStorage` to be remembered across sessions.
- **Implementation:** The provider applies the current theme by adding a `data-theme` attribute to the `<html>` element. The CSS file `styles/variables.css` contains selectors like `[data-theme='dark']` and `[data-theme='light']` to redefine the values of the CSS color variables, instantly changing the entire UI's color scheme.

### d. Styling (`src/styles/`)

The styling approach is a hybrid of global styles and component-scoped styles.

- **`global.css`:** Sets base styles for the entire application, such as typography, box-sizing, and resets.
- **`variables.css`:** Defines all the CSS Custom Properties (variables) for colors, fonts, spacing, etc. This is the heart of the theming system.
- **CSS Modules (`*.module.css`):** The vast majority of components use CSS Modules for styling. This approach ensures that class names are unique to each component, preventing style conflicts and promoting modularity. The `styles` object imported from a `.module.css` file maps local class names to globally unique ones.
