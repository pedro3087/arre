# Implementation Tasks: Task Drag and Drop

**Branch**: `002-task-drag-drop` | **Date**: 2026-03-07 | **Spec**: [specs/002-task-drag-drop/spec.md](spec.md) | **Plan**: [specs/002-task-drag-drop/plan.md](plan.md)

## Phase 1: Data Model & Backend API

- [x] **1.1 Update Task Type**: Add `order?: number` to `Task` interface in `src/shared/types/task.ts`.
- [x] **1.2 Add `reorderTasks` to `useTasks`**: Add a new function in `useTasks.ts` that takes an array of tasks and updates their `order` fields in Firestore using a batched write. Filter out Google Tasks prior to running the batch update.

## Phase 2: Anytime View Integration

- [x] **2.1 Sort tasks by `order`**: In `Anytime.tsx` and `Someday.tsx`, update the `grouped` array to sort tasks within each project group based on the `order` property, falling back to `createdAt` if `order` is missing.
- [x] **2.2 Implement `framer-motion` Reorder**: Wrap the project group list with `Reorder.Group` and individual task items with `Reorder.Item` in `Anytime.tsx`.
- [x] **2.3 Wire up `onReorder`**: Hook up the `onReorder` event from `framer-motion` to the `reorderTasks` function. Provide a local state or direct state update mechanism for immediate visual feedback before the Firestore write resolves.
- [x] **2.4 Handle rapid reordering**: Ensure rapid drags don't result in overlapping batches, possibly ignoring drags that occur while a batch write is pending or using latest state tracking.

## Phase 3: Someday View Integration (and others)

- [x] **3.1 Implement Reorder in Someday**: Apply the same `Reorder.Group/Item` setup to `Someday.tsx` group lists.
- [x] **3.2 Test multi-project support**: Verify dragging works well within project bounds and doesn't get messed up across projects. Since we are doing `Reorder.Group` per project, cross-project dragging is not enabled.

## Phase 4: Final Testing & Polish

- [x] **4.1 Test newly added tasks**: Ensure new tasks get an order or fall to the top/bottom properly.
- [x] **4.2 Edge case checks**: Check Google Tasks integration doesn't break.
