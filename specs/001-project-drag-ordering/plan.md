# Implementation Plan: Project & Kanban Drag-and-Drop Priority Ordering

**Branch**: `001-project-drag-ordering` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-project-drag-ordering/spec.md`

## Summary

Users need drag-and-drop reordering for projects in the left sidebar and for kanban columns on the board, with task ordering within columns as a follow-on. All three Firestore entities (`Project`, `KanbanStatus`, `Task`) already have `order` fields, and reorder hook methods already exist for kanban statuses and tasks. The implementation adds project reordering to `useProjects`, wires a sortable project list into `Sidebar`, and extends `KanbanBoard` to handle column and intra-column card drags alongside the existing cross-column task drag — all using the already-installed `@dnd-kit` library.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19.2  
**Primary Dependencies**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (all installed); Firebase 12.9 Firestore; React Router 7.13; Lucide React  
**Storage**: Firestore — `users/{uid}/projects`, `users/{uid}/kanbanStatuses`, `users/{uid}/tasks`  
**Testing**: npm test (existing test suite)  
**Target Platform**: Web (desktop-first, same as rest of app)  
**Project Type**: Web application (React SPA + Firebase backend)  
**Performance Goals**: Reorder UI feedback < 100ms; Firestore batch writes < 1s on normal network  
**Constraints**: No new npm dependencies; no Firestore schema changes; must not break existing kanban task drag  
**Scale/Scope**: Single-user data (each user's order is independent); typical project count: 1–30

## Constitution Check

The project constitution file is a blank template (no ratified principles). No gates apply. ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-project-drag-ordering/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── hooks.md         # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (modified files)

```text
frontend/src/
├── features/
│   ├── projects/
│   │   ├── hooks/
│   │   │   └── useProjects.ts            # Add reorderProjects(), fix query sort
│   │   └── DraggableProjectList.tsx      # New: sortable project list component
│   └── kanban/
│       ├── KanbanBoard.tsx               # Extend onDragEnd for column + intra-column drags
│       ├── KanbanColumn.tsx              # Add useSortable + drag handle for column header
│       ├── KanbanCard.tsx                # Switch useDraggable → useSortable
│       └── hooks/
│           └── useKanbanBoard.ts         # Add reorderColumns(), reorderTasksInColumn()
└── layout/
    ├── Sidebar.tsx                       # Replace project map with DraggableProjectList
    └── MainLayout.tsx                    # Pass reorderProjects handler to Sidebar
```

## Complexity Tracking

No constitution violations.

---

## Phase 0: Research

**Status**: Complete — see [research.md](research.md)

All NEEDS CLARIFICATION items resolved. No new npm dependencies required. No Firestore schema changes required.

---

## Phase 1: Design & Contracts

**Status**: Complete

### Artifacts

- **Data model**: [data-model.md](data-model.md) — documents existing `order` fields, state transitions, Firestore rules analysis
- **Hook & component contracts**: [contracts/hooks.md](contracts/hooks.md) — defines `reorderProjects()`, `reorderColumns()`, `reorderTasksInColumn()`, `DraggableProjectList` props, `Sidebar` prop addition
- **Quickstart**: [quickstart.md](quickstart.md)

### Key Design Decisions

1. **One DndContext per surface**: `KanbanBoard` uses a single `DndContext` that handles both column drags and task drags, branching in `onDragEnd` on `active.data.current.type`. Nested contexts cause pointer event conflicts.

2. **Type tagging for drag items**: Column drag handles set `data: { type: 'column', id }`. Task cards set `data: { type: 'task', id }`. This is the @dnd-kit-recommended pattern for mixed drag targets.

3. **Sidebar uses @dnd-kit**: Consistent with the kanban column reordering pattern. Projects get a vertical sortable list with a dedicated drag handle (grabber icon) to avoid conflict with the click-to-navigate behaviour.

4. **No optimistic local state**: The `onSnapshot` real-time listener refreshes state within ~100–200ms of a Firestore write. Optimistic updates are not needed for this latency target.

5. **reorderProjects() uses WriteBatch**: Assigns each project `order = index` in a single atomic batch write. Same pattern as `reorderStatuses()`.

6. **Project query fixed**: `orderBy('createdAt', 'asc')` → `orderBy('order', 'asc')`. Existing projects without contiguous `order` values will display in correct relative order; gaps are harmless.

### Implementation Slices (ordered by FR priority)

| Slice | User Story | Files Changed |
|---|---|---|
| A: Project reorder — hook | US-1 | `useProjects.ts` |
| B: Project reorder — UI | US-1 | `DraggableProjectList.tsx`, `Sidebar.tsx`, `MainLayout.tsx` |
| C: Column reorder on board — hook | US-2 | `useKanbanBoard.ts` |
| D: Column reorder on board — UI | US-2 | `KanbanBoard.tsx`, `KanbanColumn.tsx` |
| E: Task reorder within column — UI | US-3/US-4 | `KanbanBoard.tsx`, `KanbanCard.tsx` |

Slices A and B can be developed and tested independently of C–E. Slice C must precede D. Slice E can be done after D (shares the same `DndContext` extension).
