# Research: Task Creation UI Alignment

## Decision 1: Default Tab

- **Decision**: Default the `activeTab` state to `'manual'` when the `TaskEditorModal` is opened for a new task.
- **Rationale**: User request to "land on New Task instead Magic import". This reduces friction for the majority of manual entries.
- **Alternatives Considered**: Remember last used tab (dismissed for predictability).

## Decision 2: Button Styling

- **Decision**: Update `.createButton` in `TaskEditorModal.module.css` to use `background: var(--accent-purple-neon)` and `border-radius: 9999px`.
- **Rationale**: Direct alignment with the `inboxStyles.newTaskButton` which uses the neon purple and pill shape.
- **Alternatives Considered**: Keeping current dark theme (dismissed for consistency).

## Decision 3: Energy Level Pills

- **Decision**: Update `.pill` in `TaskEditorModal.module.css` to match the styling of `.pill` in `EnergyFilter.module.css`.
- **Details**:
  - `border-radius: 9999px` (vs current `10px`).
  - Use the same hover and active states (glow for 'high').
- **Rationale**: Ensures the same "objects" look "very similar on shape/form/colors" as requested.

## Decision 4: Project Selector & Inputs

- **Decision**: Update `.titleInput`, `.projectSelect`, `.dateInput` to have standard padding and border radii consistent with the `Inbox` search bar.
- **Rationale**: General alignment request for "shape/form/colors".
