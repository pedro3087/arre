# Research: Settings Page UI Alignment

**Feature Branch**: `026-settings-page-alignment`  
**Created**: 2026-03-09
**Status**: Complete

## Decision Log

### Decision: Theme Selector Border Radius Standard

- **Chosen**: `9999px` (fully rounded pill-shape).
- **Rationale**: Aligns with the energy level filters on the Dashboard and the navigation tabs in the Task Editor Modal.
- **Alternatives considered**: `var(--radius-lg)` (8px). Rejected to avoid mixing rectangular and pill-shaped interactive elements.

### Decision: Primary Action Button Styling

- **Chosen**: `background: var(--accent-purple-neon)` and `border-radius: 9999px`.
- **Rationale**: The `connectButton` is the primary call-to-action in the settings page. Using the purple neon accent matches the "New Task" button on the Inbox and "Create Task" in the modal.
- **Alternatives considered**: Standard blue primary color. Rejected to maintain the "White Paper" brand aesthetic.

### Decision: Integration Card Border Radius

- **Chosen**: `24px` (matching card aesthetic).
- **Rationale**: The app's dashboard uses a larger border-radius for major containers and cards.
- **Alternatives considered**: `var(--radius-lg)` (8px). Rejected as it looks too sharp for the current design direction.

## Best Practices

### Responsive Stacking

**Conclusion**: When the integration card overflows on mobile, items should stack vertically with consistent spacing (`var(--spacing-4)`).

### Active State Feedback

**Conclusion**: Use a subtle glow (`box-shadow`) or strong background contrast to denote active theme options, consistent with the `EnergyFilter` component.
