# Quickstart Guide: Task Creation Alignment

## Component: `TaskEditorModal.tsx`

- **Goal**: Change default `activeTab` from `'ai'` to `'manual'` for new tasks.
- **Location**: `src/features/tasks/TaskEditorModal.tsx`.
- **Snippet**:
  ```tsx
  // ... current ...
  } else {
    // ...
    setActiveTab('ai'); // CHANGE THIS TO 'manual'
  }
  ```

## Styling: `TaskEditorModal.module.css`

- **Location**: `src/features/tasks/TaskEditorModal.module.css`.
- **Tasks**:
  1.  Update `.createButton`:
      ```css
      background: var(--accent-purple-neon);
      border-radius: 9999px;
      /* ensure layout aligns with Inbox's .newTaskButton */
      ```
  2.  Update `.pill` (energy level) to `border-radius: 9999px`.
  3.  Align `.highActive` with `EnergyFilter.module.css`'s `.active.high` (same box-shadow/glow).
  4.  Update input/SELECT border radii:
      - `.projectSelect`, `.dateInput`, `.titleInput` (if applicable) → standardized border-radius (e.g., 9999px for pills, or consistent 12px for fields).

## Verification

- Click "New Task" from Inbox, Dashboard, and Sidebar.
- Observe: "New Task" tab is active first.
- Observe: Create Task button is purple and pill-shaped.
- Observe: Energy level pills are pill-shaped and match filter style.
