# Implementation Plan: Google Calendar Daily Import

**Branch**: `001-gcal-import` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gcal-import/spec.md`

## Summary

Import today's Google Calendar events as high-priority tasks into the Arre Today tab. The feature extends the existing Google OAuth2 integration pattern (already in use for Google Tasks) to support Google Calendar read access. On app open, a new Cloud Function fetches today's calendar events and writes them as native Firestore tasks tagged with their source event ID for deduplication. The Task data model gains a `priority` field (used to mark imported events as high-priority) and calendar-source fields. The Settings page gains a Google Calendar connection card alongside the existing Google Tasks card.

## Technical Context

**Language/Version**: TypeScript 5.9 (frontend) / Node.js CommonJS (Firebase Functions)
**Primary Dependencies**: React 19.2, Firebase 12.9 (Firestore + Functions), `googleapis` npm package (already used for Google Tasks)
**Storage**: Firestore — `users/{uid}/tasks` (extended with priority + calendar fields), `users/{uid}/integrations/googleCalendar` (new)
**Testing**: Playwright (existing e2e)
**Target Platform**: Web SPA (Vite) + Firebase Cloud Functions (Node.js)
**Project Type**: Web application with serverless backend
**Performance Goals**: Today's calendar events visible within 30 seconds of app open
**Constraints**: Zero duplicate tasks per calendar event per day; one-directional import (tasks are independent once created)
**Scale/Scope**: Single authenticated user per session; all calendars in primary Google account

## Constitution Check

The project constitution file is an unfilled template — no project-specific gates are defined. No violations to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/001-gcal-import/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── exchangeGoogleCalendarAuthCode.md
│   └── importGoogleCalendarEvents.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
src/
├── shared/types/
│   └── task.ts                          # Add: priority, calendarEventId, isCalendarImport
├── lib/auth/
│   └── AuthContext.tsx                  # Add: connectGoogleCalendar, disconnectGoogleCalendar
├── features/integrations/               # New directory
│   └── useGoogleCalendarImport.ts       # New hook: triggers import on mount, exposes status
└── pages/
    └── Settings.tsx                     # Add: Google Calendar integration card

functions/
└── index.js                             # Add: exchangeGoogleCalendarAuthCode, importGoogleCalendarEvents
```

**Structure Decision**: Single-project web application (Option 2 pattern). All new frontend code lives under `src/features/integrations/`. New cloud functions added to existing `functions/index.js` file to match the established pattern.

## Complexity Tracking

> No constitution violations — section not required.
