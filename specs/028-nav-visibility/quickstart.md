# Quickstart: Navigation Visibility Toggles

**Feature**: 028-nav-visibility  
**Date**: 2026-06-08

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install` in `frontend/`)

## Development

```bash
cd frontend
npm run dev
```

## Verification Steps

1. **Settings section visible**: Open `/settings`. A "Navigation" section should appear listing all 8 nav items (Inbox, Today, Upcoming, Anytime, Someday, Logbook, Kanban, AI Briefing), each with a toggle switch. All should be on by default.

2. **Hide a desktop item**: Toggle "Logbook" off. Without refreshing, check the sidebar — the Logbook entry should be gone.

3. **Hide a mobile item**: Keep Logbook off, then resize browser to ≤768px. The bottom navigation bar should not include a Logbook button.

4. **Restore an item**: Toggle "Logbook" back on. It immediately reappears in both sidebar and bottom nav.

5. **Persistence**: Hide "Kanban", then refresh the page. Kanban should still be absent from nav. The Settings toggle should show it as off.

6. **Redirect on hidden active route**: Navigate to `/kanban` directly. Then open Settings and hide Kanban. The app should redirect away from `/kanban` to the first visible nav item.

7. **Settings always reachable**: Hide all 8 items. `/settings` should remain accessible (it is not in NAV_ITEMS).

## Files Modified

| File | Change |
|------|--------|
| `src/features/navigation/NavVisibilityProvider.tsx` | **New** — context, provider, hook |
| `src/App.tsx` | Wrap app with `<NavVisibilityProvider>`, add `RedirectIfHidden` |
| `src/layout/Sidebar.tsx` | Filter `NAV_ITEMS` via `useNavVisibility()` |
| `src/layout/BottomNav.tsx` | Filter items via `useNavVisibility()` |
| `src/pages/Settings.tsx` | Add "Navigation" section with 8 toggle rows |
| `src/pages/Settings.module.css` | Toggle row styles (if not already covered) |
| `CLAUDE.md` | Update active technologies + recent changes |
