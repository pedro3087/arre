# Feature Specification: Settings Page UI Alignment

**Feature Branch**: `026-settings-page-alignment`  
**Created**: 2026-03-09
**Status**: Draft  
**Input**: User description: "we need to be able to align the settings page similar to what we did with the New Task modal"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Settings Appearance Alignment (Priority: P1)

The "Appearance" section in Settings should use the same "pill-shaped" multi-select aesthetic as the Energy Filter on the Dashboard or the new Task Modal tabs. This ensures a consistent interactive feel for mode selection.

**Why this priority**: Directly implements the user's request for alignment across the app.

**Independent Test**: Navigate to the Settings page. Verify that the theme selection buttons (Light, Dark, System) are fully rounded (pill-shaped).

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I look at the theme selector, **Then** the options should be fully rounded (9999px border-radius).
2. **Given** I select a theme, **When** it is active, **Then** it should have a clear active state (e.g., matching the accent color or a subtle glow).

---

### User Story 2 - Integrations & Action Buttons Alignment (Priority: P1)

The "Integrations" section and its primary action buttons (Connect/Disconnect) should match the styling of the "Create Task" button in the New Task modal.

**Why this priority**: Action buttons are the most critical functional touchpoints and should be visually distinct and consistent.

**Independent Test**: Compare the "Connect Google Tasks" button with the "Create Task" button in the modal.

**Acceptance Scenarios**:

1. **Given** the Google Tasks integration is not connected, **When** I see the "Connect Google Tasks" button, **Then** it should be fully rounded (9999px) and use `var(--accent-purple-neon)`.
2. **Given** an integration is connected, **When** I see the list of task lists, **Then** the list items should have consistent border-radii aligned with the app's card aesthetic.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The `themeOption` buttons MUST use `border-radius: 9999px`.
- **FR-002**: The `connectButton` MUST use `border-radius: 9999px` and `background: var(--accent-purple-neon)`.
- **FR-003**: The `disconnectButton` MUST use `border-radius: 9999px`.
- **FR-004**: The `integrationCard` MUST have its border-radius updated to match the app's standard for large containers (e.g., 24px or `var(--radius-xl)` if available).
- **FR-005**: The `taskListItem` MUST have its border-radius updated (e.g., to match the project selectors in the modal).
- **FR-006**: The `checkboxLabel` input SHOULD be styled if possible to match the app's aesthetic (or at least ensure consistency with other checkbox-like elements).

### Key Entities

- **SettingsPage**: The main container for application configuration.
- **ThemeSelector**: The component for switching between Light, Dark, and System modes.
- **IntegrationCard**: The UI block for Google Tasks and other future integrations.
- **TaskListSelection**: The list of checkboxes for specific sync targets.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% Alignment Score: All primary action buttons in Settings use `9999px` border radius.
- **SC-002**: Visual Consistency: Theme selection "pills" match the styling of the Dashboard's Energy Filter.
- **SC-003**: Color Harmony: Primary interaction colors (Purple Neon) are consistently applied to the main integration actions.
