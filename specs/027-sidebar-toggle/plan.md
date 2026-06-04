# Implementation Plan: Sidebar Toggle

**Branch**: `027-sidebar-toggle` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/027-sidebar-toggle/spec.md`

## Summary

Add a collapsible sidebar to the desktop layout. A collapse button in the sidebar header slides it off-screen; an expand button in the main content area brings it back. The preference persists via localStorage. Mobile behavior is unchanged. Implementation uses local state in MainLayout passed as props to Sidebar, leveraging existing CSS transitions.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19.2  
**Primary Dependencies**: lucide-react ^0.564.0, clsx (both already installed)  
**Storage**: Browser localStorage (key: `sidebar-collapsed`)  
**Testing**: Playwright integration tests (manual verification via dev server)  
**Target Platform**: Web browser (desktop ≥769px viewport)  
**Project Type**: Web application (React SPA with Vite)  
**Performance Goals**: 60fps animation during sidebar toggle  
**Constraints**: Animation ≤300ms, no layout shift during transition  
**Scale/Scope**: 4 files modified, ~50 lines added across all files

## Constitution Check

*No constitution principles defined — gate passes by default.*

## Project Structure

### Documentation (this feature)

```text
specs/027-sidebar-toggle/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: state model
├── quickstart.md        # Phase 1: verification guide
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (files to modify)

```text
src/layout/
├── Sidebar.tsx              # Add collapsed prop, collapse button in header
├── Sidebar.module.css       # Add .collapsed, .headerRow, .collapseBtn styles
├── MainLayout.tsx           # Add toggle state, expand button, pass props
└── MainLayout.module.css    # Add .mainContentExpanded, .expandButton styles
```

**Structure Decision**: No new files or directories. All changes are modifications to existing layout components.

## Implementation Details

### Step 1: Sidebar Component (`Sidebar.tsx` + `Sidebar.module.css`)

**Sidebar.tsx changes**:
- Add `collapsed?: boolean` and `onToggleSidebar?: () => void` to `SidebarProps`
- Import `PanelLeftClose` from lucide-react
- Apply `clsx(styles.sidebar, collapsed && styles.collapsed)` to root `<aside>`
- Wrap header content in a flex row div, add collapse button beside logo

**Sidebar.module.css changes**:
- `.collapsed`: `transform: translateX(-100%)` inside `@media (min-width: 769px)`
- `.headerRow`: `display: flex; align-items: center; justify-content: space-between`
- `.collapseBtn`: 28px square, 6px radius, matching `.addProjectBtn` hover pattern (`rgba(0, 0, 0, 0.05)`)

### Step 2: MainLayout Component (`MainLayout.tsx` + `MainLayout.module.css`)

**MainLayout.tsx changes**:
- Import `clsx` and `PanelLeftOpen` from lucide-react
- Add `sidebarCollapsed` state initialized from `localStorage.getItem('sidebar-collapsed') === 'true'`
- Add `toggleSidebar` function that flips state and persists to localStorage
- Pass `collapsed={sidebarCollapsed}` and `onToggleSidebar={toggleSidebar}` to `<Sidebar />`
- Apply `clsx(styles.mainContent, sidebarCollapsed && styles.mainContentExpanded)` to `<main>`
- Render expand button (conditionally visible when collapsed) before `<main>`

**MainLayout.module.css changes**:
- `.mainContentExpanded`: `margin-left: 0` (existing transition handles animation)
- `.expandButton`: fixed position top-left, 36px square, paper background, subtle border/shadow, z-index 999
- Hide `.expandButton` on mobile `@media (max-width: 768px)`

### Key Design Decisions

1. **No Context provider** — sidebar state is consumed only by MainLayout (parent) and Sidebar (direct child). Props suffice. (See research.md R-002)
2. **`transform` over `width`** — reuses existing transition, avoids layout recalculation. (See research.md R-001)
3. **`rgba` hover backgrounds** — works in both light and dark modes without extra overrides. (See research.md R-004)

## Complexity Tracking

No constitution violations to justify.
