# Quickstart: Fix Project Modal Centering and Button Visibility

**Branch**: `001-fix-project-modal` | **Date**: 2026-04-08

## What Changed

Two files are modified to fix the modal positioning and button visibility:

1. **`src/features/projects/ProjectModal.module.css`** — CSS layout fix
2. **`src/features/projects/ProjectModal.tsx`** — Animation fix

## How to Verify

1. Run the dev server: `npm run dev` from the repo root
2. Open the app in the browser
3. Click any "New Project" button
4. **Check**: Modal appears centered on screen from the very first frame of the animation
5. **Check**: "Cancel" and "Create" buttons in the footer are fully visible
6. Resize the browser to a small height (e.g., 500px) — footer must still be visible
7. Repeat with "Edit Project" (click on an existing project) — same result expected

## How to Test

```bash
npm test
```

Existing Playwright tests cover the `[data-testid="project-modal"]`, `[data-testid="btn-save-project"]` selectors — these should pass without modification.
