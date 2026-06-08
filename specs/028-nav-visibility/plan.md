# Implementation Plan: Navigation Visibility Toggles

**Branch**: `028-nav-visibility` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/028-nav-visibility/spec.md`

## Summary

Add a "Navigation" section to the Settings page where users can toggle individual sidebar menu items on/off. Changes take effect immediately in both the desktop sidebar and mobile bottom nav. Preferences persist via localStorage. Follows the existing `ThemeProvider` pattern: a new `NavVisibilityProvider` context shared by `Sidebar`, `BottomNav`, and `Settings`.

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19.2  
**Primary Dependencies**: lucide-react (existing), clsx (existing) — no new dependencies  
**Storage**: Browser localStorage (key: `nav-visibility`, JSON object)  
**Testing**: Manual verification via dev server (consistent with 027-sidebar-toggle approach)  
**Target Platform**: Web browser — desktop sidebar + mobile bottom nav  
**Project Type**: Web application (React SPA with Vite)  
**Performance Goals**: Instantaneous nav re-render on toggle (single context update)  
**Constraints**: No page reload required; mobile and desktop share one setting  
**Scale/Scope**: 1 new file, 5 files modified, ~100 lines added total

## Constitution Check

*No constitution principles defined — gate passes by default.*

## Project Structure

### Documentation (this feature)

```text
specs/028-nav-visibility/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: state model
└── quickstart.md        # Phase 1: verification guide
```

### Source Code (files to modify)

```text
src/
├── features/navigation/
│   └── NavVisibilityProvider.tsx    # NEW: context, provider, useNavVisibility hook
├── App.tsx                          # Wrap with NavVisibilityProvider, add RedirectIfHidden
├── layout/
│   ├── Sidebar.tsx                  # Filter NAV_ITEMS via useNavVisibility()
│   └── BottomNav.tsx                # Filter items via useNavVisibility()
└── pages/
    ├── Settings.tsx                 # Add "Navigation" section with 8 toggles
    └── Settings.module.css          # Toggle row styles
```

**Structure Decision**: Web application layout. One new file under `src/features/navigation/` (following the existing `src/features/theme/` pattern).

## Implementation Details

### Step 1: NavVisibilityProvider (`src/features/navigation/NavVisibilityProvider.tsx`)

New file following `ThemeProvider` exactly:

```typescript
const STORAGE_KEY = 'nav-visibility';

const NavVisibilityContext = createContext<NavVisibilityContextValue>({...});

export function NavVisibilityProvider({ children }) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  });

  const toggleItem = (path: string) => {
    setVisibility(prev => {
      const next = { ...prev, [path]: prev[path] === false ? true : false };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const isVisible = (path: string) => visibility[path] !== false;

  return <NavVisibilityContext.Provider value={{ visibility, toggleItem, isVisible }}>{children}</NavVisibilityContext.Provider>;
}

export const useNavVisibility = () => useContext(NavVisibilityContext);
```

### Step 2: App.tsx — Provider + Redirect

- Wrap the top-level JSX (inside `BrowserRouter`, outside `MainLayout`) with `<NavVisibilityProvider>`
- Add a small `RedirectIfHidden` component rendered inside the router that:
  - Reads `location.pathname` and `isVisible`
  - If `NAV_ITEMS.some(i => i.path === location.pathname)` and `!isVisible(location.pathname)`, `navigate` to the first item where `isVisible(item.path)` is true
  - Falls back to `/inbox` if all items are hidden

### Step 3: Sidebar.tsx

```typescript
const { isVisible } = useNavVisibility();
// In render:
NAV_ITEMS.filter(item => isVisible(item.path)).map(...)
```

### Step 4: BottomNav.tsx

Same one-liner filter on the existing items array.

### Step 5: Settings.tsx — Navigation Section

Add a new section before or after Appearance:

```tsx
<section>
  <h2>Navigation</h2>
  <p>Choose which items appear in the sidebar and bottom navigation.</p>
  {NAV_ITEMS.map(item => (
    <div key={item.path} className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <item.icon size={16} className={item.color} />
        <span>{item.label}</span>
      </div>
      <button
        role="switch"
        aria-checked={isVisible(item.path)}
        className={clsx(styles.toggle, isVisible(item.path) && styles.toggleOn)}
        onClick={() => toggleItem(item.path)}
      />
    </div>
  ))}
</section>
```

`NAV_ITEMS` is imported from `Sidebar.tsx` (needs to be exported) or duplicated locally.

### Step 6: Settings.module.css

Add `.settingRow`, `.settingInfo`, `.toggle`, `.toggleOn` if not already present (inspect existing styles first — reuse if similar patterns exist).

### Key Design Decisions

1. **Context over props** — `Settings` is a separate route from `MainLayout`; props cannot reach it. Context is necessary. (See research.md R-001)
2. **`visibility[path] !== false` default** — new nav items are visible without migration. (See research.md R-002)
3. **Export `NAV_ITEMS` from `Sidebar.tsx`** — single source of truth for item definitions, consumed by both the filter in Sidebar/BottomNav and the toggle list in Settings.

## Complexity Tracking

No constitution violations to justify.
