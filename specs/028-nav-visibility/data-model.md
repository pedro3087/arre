# Data Model: Navigation Visibility Toggles

**Feature**: 028-nav-visibility  
**Date**: 2026-06-08

## Entities

### NavVisibility

A map from route path to visibility boolean, representing which navigation items are shown.

| Attribute        | Type                    | Default     | Storage      |
|------------------|-------------------------|-------------|--------------|
| visibility       | `Record<string, boolean>` | `{}` (all visible) | localStorage |

**Storage key**: `nav-visibility`  
**Persistence**: Browser localStorage (per-device, not per-user)  
**Fallback**: If localStorage is unavailable or key is missing, defaults to `{}` which means all items visible (opt-out by default via `visibility[path] !== false`)

### Route → Label Map (source of truth in `Sidebar.tsx`)

| Path       | Label       | Toggleable |
|------------|-------------|------------|
| `/inbox`   | Inbox       | Yes        |
| `/`        | Today       | Yes        |
| `/upcoming`| Upcoming    | Yes        |
| `/anytime` | Anytime     | Yes        |
| `/someday` | Someday     | Yes        |
| `/logbook` | Logbook     | Yes        |
| `/kanban`  | Kanban      | Yes        |
| `/briefing`| AI Briefing | Yes        |

### State Transitions

```
all visible (default)
    ──[toggleItem(path)]──> item hidden

item hidden
    ──[toggleItem(path)]──> item visible

current route hidden
    ──[immediate]──> redirect to first visible NAV_ITEM
```

Each `toggleItem(path)` call:
1. Flips `visibility[path]` (undefined/true → false, false → true)
2. Writes updated map to `localStorage.setItem('nav-visibility', JSON.stringify(visibility))`
3. Context value updates → Sidebar and BottomNav re-render with filtered items

## Context Interface

```typescript
interface NavVisibilityContextValue {
  visibility: Record<string, boolean>;
  toggleItem: (path: string) => void;
  isVisible: (path: string) => boolean; // convenience: visibility[path] !== false
}
```

## Component Prop Changes

No new props are added to `Sidebar` or `BottomNav` — they consume the context directly via `useNavVisibility()`.
