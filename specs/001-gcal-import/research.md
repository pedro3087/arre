# Research: Google Calendar Daily Import

**Branch**: `001-gcal-import` | **Date**: 2026-04-08

## Decision Log

### 1. Google Calendar API — Fetching Today's Events

**Decision**: Use `google.calendar({ version: 'v3', auth: oauth2Client }).events.list()` with `timeMin`/`timeMax` bounding today's date range.

**Key parameters**:
```
calendarId: 'primary'
timeMin: <today 00:00:00 local as RFC 3339 ISO string>
timeMax: <today 23:59:59.999 local as RFC 3339 ISO string>
singleEvents: true          // expands recurring events into individual instances
orderBy: 'startTime'        // requires singleEvents: true
showDeleted: false          // omit cancelled instances at API level
maxResults: 250
```

**Event object shape** (relevant fields):
```
id: string                    // Unique event ID — used for deduplication
summary: string               // Event title (may be absent for untitled events)
status: 'confirmed' | 'tentative' | 'cancelled'
start: { dateTime?: string, date?: string, timeZone?: string }
end:   { dateTime?: string, date?: string, timeZone?: string }
```

**All-day events**: When `start.date` is present (and `start.dateTime` is absent), the event is all-day. Use `start.date` directly as the task date (YYYY-MM-DD). Note: `end.date` is exclusive — a single-day event on April 8 has `end.date = "2026-04-09"`. Use `event.start.dateTime ?? event.start.date` to safely extract the date for either type.

**Cancelled events**: Using `showDeleted: false` in the API call excludes cancelled events at the source. No post-filter needed.

**Rationale**: `singleEvents: true` is critical — without it, recurring event rules are returned as a single object and individual instances are not enumerated, making daily filtering unreliable.

**Alternatives considered**: Fetching all events and filtering client-side — rejected, as it wastes bandwidth and makes pagination logic more complex.

---

### 2. OAuth Scope for Google Calendar

**Decision**: Add `https://www.googleapis.com/auth/calendar.readonly` as a separate Google authorization — stored in a new Firestore document `users/{uid}/integrations/googleCalendar`, independent from the existing `googleTasks` document. A finer-scoped alternative (`calendar.events.readonly`) is available but `calendar.readonly` is used for simplicity.

**Rationale**: Keeping integrations separate means:
- Existing Google Tasks users are not forced to re-authorize.
- Calendar access can be revoked independently.
- The existing `exchangeGoogleAuthCode` function is unchanged (no risk of breaking it).

**Token sharing**: Google issues refresh tokens per OAuth2 client + scope combination. Combining both scopes in a single authorization is technically possible but would require existing Google Tasks users to re-authorize. The separate-document approach avoids this breaking change.

**Frontend OAuth requirements**: The frontend must pass `access_type: 'offline'` and `prompt: 'consent'` to the Google Identity Services code client to ensure a refresh token is returned. Without `prompt: 'consent'`, Google only returns a refresh token on the very first authorization.

**Alternatives considered**:
- Combined scope in existing auth flow — technically valid (a single refresh token can cover both `tasks` and `calendar.readonly` scopes if requested together). Rejected because existing Google Tasks users would need to re-authorize — a breaking UX change.
- Using a `scope` parameter in `exchangeGoogleAuthCode` — viable but adds complexity to an already-working function. Separate function is simpler and safer.

---

### 3. "High Priority" Representation in Task Model

**Decision**: Add a new `priority?: 'high' | 'normal'` field to the `Task` interface and `TaskDocument`.

**Rationale**: The existing model has `energy?: 'low' | 'neutral' | 'high'` (representing mental effort, not urgency) and `tags` (freeform, including `'urgent'`). Neither maps cleanly to "high priority" as a first-class concept. A dedicated `priority` field is unambiguous and extensible.

**Impact**: The `priority` field is optional and backwards-compatible. Existing tasks without this field are treated as normal priority. The field is surfaced visually in `TaskItem` (e.g., colored indicator) specifically when `task.isCalendarImport === true`.

**Alternatives considered**:
- Using `energy: 'high'` — rejected: energy measures effort, not urgency. Semantically incorrect.
- Using `tags: ['urgent']` — rejected: tags are user-managed strings. Automating their presence would create confusion.

---

### 4. Deduplication Strategy

**Decision**: Store the Google Calendar event ID as `calendarEventId` on the task Firestore document. Before creating a new task, query `users/{uid}/tasks` where `calendarEventId == eventId` to check for an existing import.

**Rationale**: This is the simplest approach that doesn't require a separate tracking collection. Each event has a stable, unique ID from the Google Calendar API. The query is a single equality filter on an indexed field.

**Index requirement**: A Firestore composite index on `calendarEventId` (or relying on single-field auto-index) enables efficient deduplication queries.

**Import scope**: Deduplication checks only active (non-completed) tasks. If a user completes and deletes a calendar-imported task, the event can be re-imported on the next app open.

**Alternatives considered**:
- Storing imported event IDs in `users/{uid}/integrations/googleCalendar.importedEventIds` array — rejected: arrays in Firestore have a 1MB document size limit and are expensive to query/update.
- Using `calendarEventId` as the Firestore document ID — rejected: Cloud Functions would need to use `setDoc` with a specific ID, complicating batch writes and the existing `addDoc` pattern.

---

### 5. Import Trigger Strategy

**Decision**: Import is triggered client-side on app mount via the `useGoogleCalendarImport` hook. The hook calls the `importGoogleCalendarEvents` Cloud Function which handles all deduplication and task creation server-side.

**Rationale**: Server-side import (in the Cloud Function) ensures data integrity — no race conditions from concurrent client sessions. The client-side trigger on app mount satisfies the spec requirement "events visible within 30 seconds of app open."

**Daily re-import guard**: The Cloud Function records `lastSyncDate` (YYYY-MM-DD) in the `googleCalendar` integration document. On each import call, if `lastSyncDate` equals today's date AND at least one task with `isCalendarImport: true` and today's date already exists, the import is skipped. This prevents redundant API calls on repeated app opens within the same day.

**Alternatives considered**:
- Firebase Scheduled Functions (cron at midnight) — rejected: users may not open the app at midnight, cron timing is timezone-sensitive, and it adds infrastructure complexity for an initial implementation.
- Pure client-side fetch + display (no Firestore write) — rejected: breaks integration with the rest of the task system (editing, completion, Kanban, etc.). Tasks must be first-class Firestore documents.

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| OAuth scope for Calendar | `calendar.readonly`, separate auth flow and Firestore doc |
| "High priority" representation | New `priority?: 'high' \| 'normal'` field on Task |
| Deduplication mechanism | `calendarEventId` field + Firestore equality query |
| Import trigger | Client hook on app mount → Cloud Function handles server-side write |
| All-day events | Imported using `start.date` as task date; no time component |
| Cancelled events | Filtered out (`status !== 'cancelled'`) before task creation |
