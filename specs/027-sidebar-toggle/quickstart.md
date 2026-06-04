# Quickstart: Sidebar Toggle

**Feature**: 027-sidebar-toggle  
**Date**: 2026-06-04

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)

## Development

```bash
npm run dev
```

## Verification Steps

1. **Collapse sidebar**: Click the collapse button (PanelLeftClose icon) in the sidebar header next to the "Arre" logo. The sidebar should slide left and the main content should expand.

2. **Expand sidebar**: Click the expand button (PanelLeftOpen icon) that appears at the top-left of the main content area. The sidebar should slide back into view.

3. **Persistence**: Collapse the sidebar, then refresh the page. The sidebar should remain collapsed.

4. **Mobile unchanged**: Resize the browser to ≤768px. The sidebar should be hidden (as before), the bottom nav should appear, and no expand button should be visible.

5. **Animation quality**: Toggle the sidebar and verify the animation is smooth (no jank, no layout shift).

## Files Modified

| File | Change |
| ---- | ------ |
| `src/layout/Sidebar.tsx` | Add `collapsed` and `onToggleSidebar` props, collapse button in header |
| `src/layout/Sidebar.module.css` | Add `.collapsed`, `.headerRow`, `.collapseBtn` styles |
| `src/layout/MainLayout.tsx` | Add toggle state with localStorage, expand button, pass props to Sidebar |
| `src/layout/MainLayout.module.css` | Add `.mainContentExpanded`, `.expandButton` styles |
