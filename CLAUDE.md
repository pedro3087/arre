# arre-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-09

## Active Technologies
- TypeScript / React 19 + Lucide React, clsx, Firebase (auth/firestore/functions) (026-settings-page-alignment)
- Firestore (user integration state) (026-settings-page-alignment)
- TypeScript 5.9 + React 19.2 + @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (new); Framer Motion 12.34 (existing, for animations); Firebase 12.9 (existing); React Router 7.13 (existing); Lucide React (existing) (001-project-kanban)
- Firebase Firestore — new sub-collection `users/{uid}/kanbanStatuses`; extended `Task` document with `kanbanStatusId` field (001-project-kanban)
- TypeScript 5.9 / React 19.2 + Firebase 12.9 (Firestore real-time `onSnapshot`), @dnd-kit/core + @dnd-kit/sortable (drag-and-drop), React Router 7.13, Lucide React (001-kanban-done-sync)
- Firestore — `users/{uid}/tasks` (Task documents with `status`, `completedAt`, `kanbanStatusId`), `users/{uid}/kanbanStatuses` (KanbanStatus documents with `isFinal` flag) (001-kanban-done-sync)
- TypeScript 5.9 / React 19.2 + @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (all installed); Firebase 12.9 Firestore; React Router 7.13; Lucide React (001-project-drag-ordering)
- Firestore — `users/{uid}/projects`, `users/{uid}/kanbanStatuses`, `users/{uid}/tasks` (001-project-drag-ordering)
- TypeScript 5.9 (frontend) / Node.js CommonJS (Firebase Functions) + React 19.2, Firebase 12.9 (Firestore + Functions), `googleapis` npm package (already used for Google Tasks) (001-gcal-import)
- Firestore — `users/{uid}/tasks` (extended with priority + calendar fields), `users/{uid}/integrations/googleCalendar` (new) (001-gcal-import)

- TypeScript / Node.js + React 19, Vite, Firebase, Framer Motion, Lucide React (025-new-task-alignment)
- TypeScript 5.x + React 18 + React Router v6 (Link/useLocation), lucide-react (icons), CSS Modules (001-consolidate-settings)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript / Node.js: Follow standard conventions

## Recent Changes
- 001-gcal-import: Added TypeScript 5.9 (frontend) / Node.js CommonJS (Firebase Functions) + React 19.2, Firebase 12.9 (Firestore + Functions), `googleapis` npm package (already used for Google Tasks)
- 001-project-drag-ordering: Added TypeScript 5.9 / React 19.2 + @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities (all installed); Firebase 12.9 Firestore; React Router 7.13; Lucide React
- 001-kanban-done-sync: Added TypeScript 5.9 / React 19.2 + Firebase 12.9 (Firestore real-time `onSnapshot`), @dnd-kit/core + @dnd-kit/sortable (drag-and-drop), React Router 7.13, Lucide React


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
