# Quickstart: Settings Page UI Alignment

**Feature Branch**: `026-settings-page-alignment`  
**Created**: 2026-03-09
**Status**: Complete

## Implementation Focus

The main effort for this feature is within the CSS module for the Settings page. Follow these steps to align the UI with the "White Paper" aesthetic.

### 1. Update Core UI Tokens in `Settings.module.css`

Focus on the following selectors:

```css
/* .themeSelector should become a pill-shaped container */
.themeSelector {
  border-radius: 9999px; /* Was var(--radius-lg) */
  padding: var(--spacing-1);
}

/* Individual options are also pills */
.themeOption {
  border-radius: 9999px; /* Was var(--radius-md) */
}

/* Integration cards match our larger standard radius */
.integrationCard {
  border-radius: 24px; /* Align with dashboard cards */
}

/* Primary buttons reflect our purple-neon brand */
.connectButton {
  border-radius: 9999px;
  background-color: var(--accent-purple-neon);
  color: var(--text-base-on-neon); /* Check accessibility */
}

/* Secondary/destructive buttons are still pill-shaped */
.disconnectButton {
  border-radius: 9999px;
}
```

### 2. Verify React Classes in `Settings.tsx`

Ensure the `clsx` logic for active appearance options is consistent with the new visuals:

```tsx
// src/pages/Settings.tsx
className={clsx(styles.themeOption, theme === value && styles.themeOptionActive)}
```

### 3. Check Hover & Active States

Add subtle glows for active pills to match the dashboard's `EnergyFilter`:

```css
.themeOptionActive {
  box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3); /* Add glow */
}
```

## Testing Locally

1.  Run the app: `npm run dev`.
2.  Navigate to `settings` (usually from the sidebar or user menu).
3.  Check both Light and Dark mode appearances.
4.  Test button clickability and the visual response for "Connect Google Tasks".
5.  Verify the list item border-radii when an integration is connected.
