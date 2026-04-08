# Data Model: Fix Project Modal Centering and Button Visibility

**Branch**: `001-fix-project-modal` | **Date**: 2026-04-08

## No Data Model Changes

This feature is purely a presentational bug fix. No Firestore collections, documents, or fields are created, modified, or removed.

## Affected UI Component

### ProjectModal (existing)

**File**: `src/features/projects/ProjectModal.tsx`  
**Styles**: `src/features/projects/ProjectModal.module.css`

| Property | Current Value | Fixed Value | Reason |
|----------|---------------|-------------|--------|
| `.modal` CSS `transform` | `translate(-50%, -50%)` | _(removed)_ | Replaced by Framer Motion `style` prop |
| `motion.div` `style` prop | _(absent)_ | `{ x: '-50%', y: '-50%' }` | Framer Motion manages centering transform |
| `motion.div` `initial.y` | `10` | _(removed)_ | Conflicts with percentage-based centering |
| `motion.div` `animate.y` | `0` | _(removed)_ | No longer needed |
| `motion.div` `exit.y` | `10` | _(removed)_ | Consistent with removal above |
| `.modal` CSS layout | _(none)_ | `display: flex; flex-direction: column` | Enables footer anchoring |
| `.body` CSS overflow | _(none)_ | `overflow-y: auto; flex: 1` | Prevents footer clipping on short viewports |

## State Transitions

No state changes. The modal's open/close state (`isOpen`) and form state (`title`, `color`) are unchanged.
