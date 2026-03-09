# Implementation Plan: Land on New Task & UI Alignment

**Branch**: `025-new-task-alignment` | **Date**: 2026-03-09 | **Spec**: [specs/025-new-task-alignment/spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-new-task-alignment/spec.md`

## Summary

This feature aligns the task creation experience with the core "Inbox" aesthetic by defaulting to the manual task entry form and standardizing UI shapes/colors (specifically pill-shaped buttons and energy filters) across the modal and main application pages.

## Technical Context

**Language/Version**: TypeScript / Node.js
**Primary Dependencies**: React 19, Vite, Firebase, Framer Motion, Lucide React
**Storage**: N/A for this UI-only change (leverages existing Firebase state)
**Testing**: Playwright
**Target Platform**: Web
**Project Type**: Web Application
**Performance Goals**: Instant modal display, smooth 60fps animations
**Constraints**: Adhere to "White Paper" aesthetic
**Scale/Scope**: Selective UI refinement in `TaskEditorModal` and `Inbox` components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
