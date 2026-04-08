# Implementation Plan: Fix Project Modal Centering and Button Visibility

**Branch**: `001-fix-project-modal` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-fix-project-modal/spec.md`

## Summary

The "New Project" modal renders off-center and clips the footer (hiding the "Create" button) because Framer Motion's animated `transform` overrides the CSS `transform: translate(-50%, -50%)` centering rule, and `overflow: hidden` clips the footer on short viewports. The fix moves centering into Framer Motion's own style system and makes the modal a flex column so the footer is always anchored.

## Technical Context

**Language/Version**: TypeScript 5.9 + React 19.2  
**Primary Dependencies**: Framer Motion 12.34 (animation), CSS Modules (styling)  
**Storage**: N/A  
**Testing**: Playwright (e2e)  
**Target Platform**: Web (desktop + mobile browsers)  
**Project Type**: Web application  
**Performance Goals**: Animation must run at 60 fps, no visual jump on open  
**Constraints**: Fix must be isolated to `ProjectModal.tsx` and `ProjectModal.module.css`; no new dependencies  
**Scale/Scope**: Single modal component used in 2 modes (create + edit)

## Constitution Check

Constitution file is a blank template — no project-specific gates defined. No violations to check.

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-project-modal/
├── plan.md              ✅ this file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output
├── quickstart.md        ✅ Phase 1 output
└── tasks.md             ⬜ Phase 2 output (/speckit.tasks)
```

### Source Code (affected files only)

```text
src/
└── features/
    └── projects/
        ├── ProjectModal.tsx            ← animation fix (style prop, remove y offset)
        └── ProjectModal.module.css     ← layout fix (flex column, scrollable body)
```

**Structure Decision**: Single project layout. Only 2 files change. No new files, no new directories.

## Implementation Steps

### Step 1 — Fix CSS (`ProjectModal.module.css`)

**File**: `src/features/projects/ProjectModal.module.css`

Changes:
1. Remove `transform: translate(-50%, -50%)` from `.modal` — centering moves to Framer Motion's `style` prop.
2. Add `display: flex; flex-direction: column;` to `.modal` — enables footer anchoring.
3. Add `overflow-y: auto; flex: 1;` to `.body` — body scrolls on short viewports; footer stays visible.

### Step 2 — Fix Animation (`ProjectModal.tsx`)

**File**: `src/features/projects/ProjectModal.tsx`

Changes to the `motion.div` with `className={styles.modal}`:
1. Add `style={{ x: '-50%', y: '-50%' }}` — Framer Motion now owns the centering translation and composes it with other transforms correctly.
2. Remove `y: 10` from `initial` — the `y` offset is no longer used (mixing pixel offsets with percentage centering causes misalignment).
3. Remove `y: 0` from `animate`.
4. Remove `y: 10` from `exit`.

### Step 3 — Verify

Run `npm run dev` and manually verify:
- Modal is centered on open
- Footer buttons visible on small viewports
- Edit Project mode works identically
- Run `npm test` to confirm existing Playwright tests pass
