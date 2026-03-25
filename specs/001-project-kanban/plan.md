# Implementation Plan: Project Kanban Board

**Branch**: `001-project-kanban` | **Date**: 2026-03-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-project-kanban/spec.md`

## Summary

Implement a project-scoped kanban board where users select one of their existing projects to view its tasks arranged in draggable status columns. Columns are global (shared across all projects) and user-configurable (add/rename/reorder) via Settings. Dropping a task into the designated final column automatically marks it completed and routes it to the existing Logbook. Built on React 19 + @dnd-kit + Firebase Firestore, following the app's existing hooks-based state pattern and CSS Modules styling.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19.2
**Primary Dependencies**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (new); Framer Motion 12.34 (existing, for animations); Firebase 12.9 (existing); React Router 7.13 (existing); Lucide React (existing)
**Storage**: Firebase Firestore — new sub-collection `users/{uid}/kanbanStatuses`; extended `Task` document with `kanbanStatusId` field
**Testing**: Playwright 1.58 (e2e, existing setup)
**Target Platform**: Web (desktop-first; mobile via BottomNav)
**Project Type**: Web application (React SPA)
**Performance Goals**: Board renders and columns load within 2 seconds; drag interactions feel instantaneous (no perceptible lag)
**Constraints**: No breaking changes to existing task views (Today, Inbox, Logbook, etc.); single-user scope; no per-project column customization in this version
**Scale/Scope**: Up to 50 tasks per project on the board; up to 10 kanban columns; designed for personal productivity use

## Constitution Check

The project constitution is a blank template — no project-specific gates are defined. No violations to evaluate.

*Re-check post-design*: No new complexity introduced beyond adding a new route, a new feature module, and a new Firestore collection. All patterns follow existing conventions.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-kanban/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-contracts.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
frontend/src/
├── features/
│   └── kanban/                          # New feature module
│       ├── KanbanBoard.tsx              # Board: project picker + DnD context + columns
│       ├── KanbanBoard.module.css
│       ├── KanbanColumn.tsx             # One droppable status column
│       ├── KanbanColumn.module.css
│       ├── KanbanCard.tsx               # Draggable task card
│       ├── KanbanCard.module.css
│       ├── KanbanStatusManager.tsx      # Column management UI (used in Settings)
│       ├── KanbanStatusManager.module.css
│       └── hooks/
│           ├── useKanbanStatuses.ts     # Firestore CRUD + real-time listener
│           └── useKanbanBoard.ts        # Board state, task grouping, moveTask
├── pages/
│   └── Kanban.tsx                       # New route page wrapper
└── shared/
    └── types/
        └── task.ts                      # Add KanbanStatus type + kanbanStatusId to Task

# Modified files
src/App.tsx                              # Add /kanban route
src/layout/Sidebar.tsx                   # Add Kanban nav link
src/layout/BottomNav.tsx                 # Add Kanban bottom nav entry
src/pages/Settings.tsx                   # Add "Kanban Columns" section

tests/
└── kanban/                              # New Playwright e2e tests
    ├── kanban-board.spec.ts
    └── kanban-settings.spec.ts
```

**Structure Decision**: Web application option. New code goes into an isolated `features/kanban/` module following the existing feature-module pattern (`features/tasks/`, `features/projects/`). No new backend code — all persistence uses the existing Firebase Firestore integration.
