# Implementation Plan: Task Drag and Drop

**Branch**: `002-task-drag-drop` | **Date**: 2026-03-07 | **Spec**: [specs/002-task-drag-drop/spec.md](spec.md)
**Input**: Feature specification to implement drag-and-drop task reordering.

## Summary

Implement generic drag-and-drop to reorder tasks within project groups using `framer-motion`. Changes include updating the data model, adding a bulk update method to `useTasks.ts`, formatting UI with `Reorder.Group`, and sorting tasks locally based on their newly-added `order` property.

## Technical Context

**Language/Version**: React (TypeScript)  
**Primary Dependencies**: `framer-motion`, `firebase/firestore`  
**Storage**: Firestore (users/{userId}/tasks/{taskId})

## Project Structure

### Documentation (this feature)

```text
specs/002-task-drag-drop/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code

```text
src/
├── shared/types/task.ts      # Add order?: number
├── features/tasks/hooks/useTasks.ts  # Add reorderTasks function
├── pages/
│   ├── Anytime.tsx           # Add Reorder.Group and Reorder.Item
│   ├── Someday.tsx           # Add Reorder.Group and Reorder.Item
```

**Structure Decision**: Code resides inside the existing pages and data hooks. No new major components are needed, though `Reorder` requires lists to be wrapped differently.

## Technical Details

We'll use `framer-motion`'s `Reorder` component.

1. `Task` interface: add `order?: number`.
2. `useTasks.ts`: add `reorderTasks(tasks: Task[])` which executes a batch update in Firestore to update the `order` field for each task in the new order.
3. `Anytime.tsx` and `Someday.tsx`: change `<div className={styles.taskList}>` to `<Reorder.Group>` and wrap `<TaskItem>` in `<Reorder.Item value={task}>`.
4. Ensure `grouped` tasks are sorted by `order` locally before display, defaulting to `createdAt` for tasks without an `order`.
