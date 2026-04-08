# Tasks: Google Calendar Daily Import

**Input**: Design documents from `/specs/001-gcal-import/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story ([US1]–[US4]) the task belongs to
- Exact file paths included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm prerequisites and create new directory structure

- [x] T001 Verify `googleapis` package is present in `functions/package.json` (already v171 — no install needed) and create `src/features/integrations/` directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model extension and backend auth infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Extend `Task` interface in `src/shared/types/task.ts` with three optional fields: `priority?: 'high' | 'normal'`, `isCalendarImport?: boolean`, `calendarEventId?: string`
- [x] T003 [P] Extend `TaskDocument` interface in `src/lib/types/firestore.ts` with the same three fields: `priority`, `isCalendarImport`, `calendarEventId`
- [x] T004 [P] Add `connectGoogleCalendar()` and `disconnectGoogleCalendar()` to the `AuthContextType` interface and `AuthProvider` implementation in `src/lib/auth/AuthContext.tsx` — `connectGoogleCalendar` opens a GIS popup with scope `https://www.googleapis.com/auth/calendar.readonly`, `access_type: 'offline'`, and `prompt: 'consent'`; on success calls new CF `exchangeGoogleCalendarAuthCode`; `disconnectGoogleCalendar` deletes `users/{uid}/integrations/googleCalendar` from Firestore
- [x] T005 [P] Add `exchangeGoogleCalendarAuthCode` callable Cloud Function and `getGoogleCalendarClient(uid)` helper to `functions/index.js` — the function exchanges an OAuth2 code for a refresh token and stores it at `users/{uid}/integrations/googleCalendar` (`{ refreshToken, connectedAt: serverTimestamp(), lastSyncDate: null }`); the helper builds an `oauth2Client` from that refresh token and returns `google.calendar({ version: 'v3', auth: oauth2Client })`

**Checkpoint**: Foundation ready — Task types updated, AuthContext has calendar methods, backend has auth exchange and calendar client helper

---

## Phase 3: User Story 1 — Connect Google Calendar Account (Priority: P1) 🎯 MVP

**Goal**: Users can link and unlink their Google Calendar account from the Settings page

**Independent Test**: Navigate to `/settings`, click "Connect Google Calendar", complete the OAuth popup, verify the button changes to "Disconnect" and the connection persists on page refresh; then click "Disconnect" and verify the card resets

- [x] T006 [US1] Add Google Calendar connection state management to `src/pages/Settings.tsx` — add `isCalendarConnected` and `loadingCalendarState` state; add a `useEffect` that reads `users/{uid}/integrations/googleCalendar` from Firestore on mount and sets `isCalendarConnected` accordingly (mirrors the existing Google Tasks connection state pattern)
- [x] T007 [US1] Add Google Calendar integration card UI to `src/pages/Settings.tsx` — render a card in the Integrations section (below the Google Tasks card) with a Google Calendar logo, description, and a Connect/Disconnect button wired to `connectGoogleCalendar` / `disconnectGoogleCalendar` from `useAuth()`; show loading state while connecting; show inline error text on failure

**Checkpoint**: User Story 1 fully functional — Google Calendar can be connected and disconnected from Settings

---

## Phase 4: User Story 2 — Today Tab Shows Imported Events as High-Priority Tasks (Priority: P1)

**Goal**: When a user with Google Calendar connected opens the app, today's calendar events appear as high-priority tasks in the Today tab

**Independent Test**: Connect Google Calendar (US1 must be complete), ensure there are events in the primary calendar for today, open the app and navigate to Today — verify each today event appears as a task with `priority: 'high'` and a priority indicator visible in the task row

- [x] T008 [US2] Add `importGoogleCalendarEvents` callable Cloud Function to `functions/index.js` — reads refresh token from `users/{uid}/integrations/googleCalendar`, calls `calendar.events.list` with `calendarId: 'primary'`, `timeMin`/`timeMax` bounding today 00:00–23:59:59 local, `singleEvents: true`, `showDeleted: false`, `maxResults: 250`; for each event creates a task document at `users/{uid}/tasks` with `title: event.summary || '(No title)'`, `date: (event.start.dateTime ?? event.start.date).substring(0, 10)`, `status: 'todo'`, `priority: 'high'`, `isCalendarImport: true`, `calendarEventId: event.id`, `createdAt/updatedAt: serverTimestamp()`; returns `{ imported, skipped, date }` (deduplication added in US3)
- [x] T009 [US2] Create `useGoogleCalendarImport` hook in `src/features/integrations/useGoogleCalendarImport.ts` — on mount, reads `users/{uid}/integrations/googleCalendar` to check connection; if connected, calls `importGoogleCalendarEvents` Cloud Function; returns `{ isConnected, isImporting, importError, lastSyncDate }`
- [x] T010 [US2] Mount `useGoogleCalendarImport` in `src/layout/MainLayout.tsx` — call the hook so import triggers on every app load; no UI output needed here (error surface handled in Polish phase)
- [x] T011 [P] [US2] Add priority indicator for `priority: 'high'` tasks to `src/features/tasks/TaskItem.tsx` — render a small colored dot or badge in the task meta area when `task.priority === 'high'`
- [x] T012 [P] [US2] Add CSS styles for the high-priority indicator in `src/features/tasks/TaskItem.module.css`

**Checkpoint**: User Story 2 fully functional — today's calendar events appear in Today tab as high-priority tasks (duplicates possible until US3 is complete)

---

## Phase 5: User Story 3 — Automatic Daily Import with Deduplication (Priority: P2)

**Goal**: Import runs automatically on every app open with no duplicates, regardless of how many times the app is opened in a day

**Independent Test**: Open the app twice on the same day with Google Calendar connected and events for today — verify the second open does not create duplicate tasks; verify events from a previous day are not re-imported on a new day

- [x] T013 [US3] Add `calendarEventId` deduplication to `importGoogleCalendarEvents` in `functions/index.js` — before creating a task, query `users/{uid}/tasks` where `calendarEventId == event.id`; if a document already exists, increment `skipped` counter and skip creation
- [x] T014 [US3] Add `lastSyncDate` tracking to `importGoogleCalendarEvents` in `functions/index.js` — after processing all events, update `users/{uid}/integrations/googleCalendar` with `lastSyncDate: todayDateString` (YYYY-MM-DD)
- [x] T015 [US3] Update `useGoogleCalendarImport` hook in `src/features/integrations/useGoogleCalendarImport.ts` to read `lastSyncDate` from the integration document and expose it in the returned state

**Checkpoint**: User Story 3 fully functional — app open is idempotent; same-day repeated opens produce no duplicates

---

## Phase 6: User Story 4 — Visually Distinguish Calendar-Imported Tasks (Priority: P3)

**Goal**: Users can identify which tasks originated from Google Calendar at a glance in the Today tab

**Independent Test**: Import a calendar event (completing US2 first), view it in Today tab alongside a manually created task — verify the imported task shows a calendar icon or badge that the manual task does not show

- [x] T016 [P] [US4] Add calendar origin badge for `isCalendarImport: true` tasks in `src/features/tasks/TaskItem.tsx` — render a calendar icon (Lucide `Calendar` icon) or "Calendar" label in the task meta area when `task.isCalendarImport === true` (alongside the existing `isGoogleTask` "Google Task" badge pattern)
- [x] T017 [P] [US4] Add CSS styles for the calendar import badge in `src/features/tasks/TaskItem.module.css` — style matching the existing `googleTaskTag` pattern for visual consistency

**Checkpoint**: All four user stories fully functional and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling and edge-case resilience affecting multiple user stories

- [x] T018 Surface `importError` from `useGoogleCalendarImport` as a non-blocking inline notification in `src/layout/MainLayout.tsx` — show a dismissible error banner or toast when import fails (mirrors the `error` display pattern used in Dashboard)
- [x] T019 Handle expired/revoked Google Calendar token in `src/pages/Settings.tsx` — when the `importError` indicates `failed-precondition` (token invalid), show a "Reconnect Google Calendar" prompt in the Settings integration card
- [x] T020 Ensure `disconnectGoogleCalendar` in `src/lib/auth/AuthContext.tsx` also clears any locally cached `isCalendarConnected` state in components (verify Settings page resets correctly on disconnect)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 (T004 for AuthContext methods)
- **US2 (Phase 4)**: Depends on Phase 2 (T002/T003 for types, T005 for CF helper); US1 must be complete to test end-to-end
- **US3 (Phase 5)**: Depends on US2 (T008 — extends `importGoogleCalendarEvents` written there)
- **US4 (Phase 6)**: Depends on Phase 2 (T002 for `isCalendarImport` type) — independently implementable in parallel with US2/US3 once Phase 2 is done
- **Polish (Phase 7)**: Depends on US2 (T009/T010 for the hook and mount point) and US1 (T007 for Settings page)

### User Story Dependencies

| Story | Depends On | Independently Testable |
|-------|------------|------------------------|
| US1 (P1) | Phase 2 | ✅ Yes — Settings connect/disconnect works alone |
| US2 (P1) | Phase 2 + US1 to test end-to-end | ✅ Yes — but requires calendar connection to validate |
| US3 (P2) | US2 (extends same CF) | ✅ Yes — open app twice, verify no duplicates |
| US4 (P3) | Phase 2 (type only) | ✅ Yes — can add badge rendering before import is wired |

### Within Each User Story

- Foundation tasks (T002–T005) run in parallel (all different files)
- US2 implementation tasks are sequential: CF (T008) → Hook (T009) → Mount (T010) → Priority UI (T011/T012 parallel)
- US3 tasks are sequential modifications to functions already created in US2
- US4 tasks (T016, T017) are parallel (different files)

---

## Parallel Opportunities

```
# Phase 2 — all four tasks run in parallel (different files):
T002: src/shared/types/task.ts
T003: src/lib/types/firestore.ts
T004: src/lib/auth/AuthContext.tsx
T005: functions/index.js

# Phase 4 — once T008+T009 are done, UI tasks run in parallel:
T011: src/features/tasks/TaskItem.tsx
T012: src/features/tasks/TaskItem.module.css

# Phase 6 — both US4 tasks run in parallel:
T016: src/features/tasks/TaskItem.tsx
T017: src/features/tasks/TaskItem.module.css
```

---

## Implementation Strategy

### MVP (User Stories 1 + 2 only — 12 tasks)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T005, parallelizable)
3. Complete Phase 3: US1 — Connect Google Calendar (T006–T007)
4. Complete Phase 4: US2 — Today tab shows imported events (T008–T012)
5. **STOP and VALIDATE**: Connect calendar, open app, verify today's events appear as high-priority tasks in Today tab
6. Deploy/demo if ready

### Incremental Delivery

1. MVP above → calendar events visible in Today tab as high-priority tasks
2. Add US3 (T013–T015) → deduplication and daily guard; app open is idempotent
3. Add US4 (T016–T017) → calendar badge visible on imported tasks
4. Add Polish (T018–T020) → resilient error handling

---

## Notes

- [P] tasks = different files, no incomplete dependencies — safe to run in parallel
- [Story] label maps each task to a specific user story for traceability
- T013/T014 modify the same function created in T008 — they must run after T008 completes
- Calendar-imported tasks behave as normal Firestore tasks once created — existing edit/complete/delete flows work without modification
- The `priority` field is backwards-compatible — existing tasks without it are treated as normal priority
