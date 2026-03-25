# UI Component Contracts: Project Kanban Board

**Branch**: `001-project-kanban` | **Phase**: 1 | **Date**: 2026-03-24

These contracts define the props and behavior boundaries for new components. They are technology-agnostic descriptions; TypeScript interfaces are illustrative.

---

## KanbanBoard

**Purpose**: Top-level kanban view. Renders the project selector and the board of columns. Orchestrates data loading and drag-and-drop context.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| — | — | — | No external props; reads projects and kanban statuses from internal hooks |

**Behavior**:
- On mount, loads the user's projects and kanban statuses.
- Displays a project picker (list or dropdown of project names with color dots).
- When a project is selected, loads all non-completed tasks for that project and renders them in columns.
- Wraps all columns in a DnD context provider.
- Handles drag-end events: determines source column, destination column, and dispatches the appropriate update.
- If no projects exist, renders an empty state with a link/button to create a project.

---

## KanbanColumn

**Purpose**: Renders one status column with its header and droppable task card area.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `statusId` | string | yes | ID of the KanbanStatus this column represents |
| `label` | string | yes | Display name for the column header |
| `isFinal` | boolean | yes | Whether this is the auto-complete column (shows visual indicator) |
| `tasks` | Task[] | yes | Ordered array of tasks currently in this column |
| `isOver` | boolean | yes | Whether a card is currently being dragged over this column (for drop-zone highlighting) |

**Behavior**:
- Renders column header with `label`.
- If `isFinal` is true, shows a subtle "Done" icon or badge on the header.
- Renders each task in `tasks` as a `KanbanCard`.
- When `isOver` is true, applies a visual highlight to the column drop zone.
- Empty columns show a faint empty-state indicator (not a full empty state component).

---

## KanbanCard

**Purpose**: Draggable task card rendered within a KanbanColumn.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `task` | Task | yes | The task to display |
| `isDragging` | boolean | yes | Whether this card is currently being dragged (for visual feedback) |
| `onEditRequest` | (taskId: string) => void | yes | Called when user clicks the edit action on the card |

**Behavior**:
- Displays task title.
- Displays tags, energy level, and date if present (consistent with TaskItem metadata display).
- When `isDragging` is true: renders with reduced opacity and a shadow/elevation effect at original position; a drag preview follows the cursor.
- Clicking the card's edit icon calls `onEditRequest` which opens the existing `TaskEditorModal`.
- Does NOT support inline text editing.

---

## KanbanStatusManager (Settings Section)

**Purpose**: UI section in Settings for managing kanban columns globally.

**Props**:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| — | — | — | No external props; reads/writes from `useKanbanStatuses` hook |

**Behavior**:
- Lists all current kanban statuses in order.
- Each row shows: drag handle (for reordering), editable label, "Final" toggle, delete button.
- "Add Column" button appends a new status with a default label ("New Column").
- Renaming: clicking the label makes it inline-editable; pressing Enter or blurring saves.
- Reordering: drag handle allows dragging rows to change column order (uses same @dnd-kit sortable).
- Deleting: disabled (greyed out) when the status has tasks assigned; tooltip explains why.
- The "Final" toggle is a radio-style control (only one column can be final at a time); toggling another column to final automatically un-sets the previous one.
- Changes persist to Firestore immediately (no "Save" button needed).

---

## Hook Contracts

### useKanbanStatuses()

**Returns**:

| Field | Type | Description |
|-------|------|-------------|
| `statuses` | KanbanStatus[] | All statuses for the user, ordered by `order` ascending |
| `loading` | boolean | True while initial data is loading |
| `error` | string \| null | Error message if load failed |
| `addStatus` | (label: string) => Promise<void> | Adds a new status at the end |
| `updateStatus` | (id: string, changes: Partial<KanbanStatus>) => Promise<void> | Updates label, order, or isFinal |
| `deleteStatus` | (id: string) => Promise<void> | Deletes status; throws if tasks are assigned |
| `reorderStatuses` | (orderedIds: string[]) => Promise<void> | Batch-updates all `order` fields |
| `seedDefaults` | () => Promise<void> | Creates default statuses if none exist |

### useKanbanBoard(projectId: string)

**Returns**:

| Field | Type | Description |
|-------|------|-------------|
| `tasksByColumn` | Record<string, Task[]> | Tasks grouped by `kanbanStatusId`; tasks with undefined `kanbanStatusId` grouped under first column's ID |
| `loading` | boolean | True while tasks or statuses are loading |
| `moveTask` | (taskId: string, toStatusId: string) => Promise<void> | Moves task to new column; if destination `isFinal`, completes the task |

---

## Firestore Security (informational)

All new collections follow the existing pattern: scoped under `users/{uid}/`, readable and writable only by the authenticated owner. No new security rules paradigm is introduced.
