# Data Model: Sidebar Toggle

**Feature**: 027-sidebar-toggle  
**Date**: 2026-06-04

## Entities

### SidebarState

A single boolean value representing whether the sidebar is collapsed or expanded.

| Attribute   | Type    | Default    | Storage        |
| ----------- | ------- | ---------- | -------------- |
| collapsed   | boolean | false      | localStorage   |

**Storage key**: `sidebar-collapsed`  
**Persistence**: Browser localStorage (per-device, not per-user)  
**Fallback**: If localStorage is unavailable or key is missing, defaults to `false` (expanded)

### State Transitions

```
expanded (default)
    ──[click collapse button]──> collapsed
    
collapsed
    ──[click expand button]──> expanded
```

Both transitions trigger:
1. State update (`setSidebarCollapsed`)
2. localStorage write (`sidebar-collapsed` = `"true"` or `"false"`)
3. CSS class toggle (sidebar transform + main content margin)

### Props Interface Changes

**Sidebar component** gains two new optional props:

| Prop             | Type         | Description                        |
| ---------------- | ------------ | ---------------------------------- |
| collapsed        | boolean      | Whether the sidebar is collapsed   |
| onToggleSidebar  | () => void   | Callback to toggle collapsed state |
