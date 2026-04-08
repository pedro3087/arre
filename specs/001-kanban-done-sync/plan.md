# Implementation Plan: Kanban Done Sync

**Branch**: `001-kanban-done-sync` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-kanban-done-sync/spec.md`

## Summary

When a task is dragged to the "Done" kanban column it must be marked as completed **and remain visible** in that column. Inbox and Logbook already sync correctly via Firestore real-time listeners — their queries filter on `status === 'todo'` and `status === 'completed'` respectively, so any write to the task document propagates automatically. The only work is in `useKanbanBoard.ts`: stop deleting `kanbanStatusId` on completion, stop filtering completed tasks out of the board, and fix the optimistic update to keep the card in the Done column instead of removing it. An additional grouping-logic fix is needed to place any task with `status === 'completed'` in the final column regardless of its stored `kanbanStatusId` (handles tasks completed via checkbox in other views).

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19.2  
**Primary Dependencies**: Firebase 12.9 (Firestore real-time `onSnapshot`), @dnd-kit/core + @dnd-kit/sortable (drag-and-drop), React Router 7.13, Lucide React  
**Storage**: Firestore — `users/{uid}/tasks` (Task documents with `status`, `completedAt`, `kanbanStatusId`), `users/{uid}/kanbanStatuses` (KanbanStatus documents with `isFinal` flag)  
**Testing**: `npm test`  
**Target Platform**: Web (desktop + mobile browsers)  
**Project Type**: Web application — React frontend + Firebase BaaS  
**Performance Goals**: Completion state visible in all views within 2 seconds of drag action  
**Constraints**: Firestore query uses single `where('projectId', '==', projectId)` to avoid composite index — completed-task filtering is done client-side  
**Scale/Scope**: Standard single-user task management app; Firestore real-time listeners handle cross-view propagation automatically

## Constitution Check

No project-specific constitution rules are defined (`constitution.md` is an unfilled template). No gates to evaluate. No complexity violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-kanban-done-sync/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── checklists/
│   └── requirements.md
└── tasks.md             ← Phase 2 output (/speckit.tasks)
```

### Source Code (affected files)

```text
frontend/
└── src/
    ├── features/
    │   └── kanban/
    │       └── hooks/
    │           └── useKanbanBoard.ts   ← ONLY file that needs changes
    └── shared/
        └── types/
            └── task.ts                 ← Reference only (no changes needed)
```

**Structure Decision**: Single file change. All cross-view sync already works through Firestore real-time listeners. No new files, components, hooks, or services are required.
