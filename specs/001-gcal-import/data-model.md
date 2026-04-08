# Data Model: Google Calendar Daily Import

**Branch**: `001-gcal-import` | **Date**: 2026-04-08

## Overview

This feature makes two categories of data model changes:
1. **Extended Task model** — adds `priority`, `calendarEventId`, and `isCalendarImport` fields to the existing Task entity.
2. **New GoogleCalendarIntegration entity** — stored in Firestore at `users/{uid}/integrations/googleCalendar`.

---

## Modified Entity: Task

**Existing location**: `src/shared/types/task.ts` and `src/lib/types/firestore.ts`

### New fields added to `Task` interface

```typescript
// In src/shared/types/task.ts
export interface Task {
  // ... existing fields unchanged ...

  // NEW: Priority level. 'high' is set on all calendar-imported tasks.
  priority?: 'high' | 'normal';

  // NEW: Set to true when this task was created from a Google Calendar event.
  isCalendarImport?: boolean;

  // NEW: The Google Calendar event ID this task was created from.
  // Used for deduplication — prevents re-importing the same event.
  calendarEventId?: string;
}
```

### New fields added to `TaskDocument` interface

```typescript
// In src/lib/types/firestore.ts
export interface TaskDocument {
  // ... existing fields unchanged ...
  priority?: 'high' | 'normal';
  isCalendarImport?: boolean;
  calendarEventId?: string;
}
```

### Field validation rules

| Field | Type | Constraints |
|-------|------|-------------|
| `priority` | `'high' \| 'normal'` | Optional. Absent means normal priority. |
| `isCalendarImport` | `boolean` | Optional. Set to `true` only by the import function; never set by UI. |
| `calendarEventId` | `string` | Optional. Must be a non-empty string when `isCalendarImport` is true. Format: Google Calendar event ID (alphanumeric + underscores). |

### Backwards compatibility

All three fields are optional. Existing tasks without these fields behave as before. Queries for the Today tab (`date == today && status == 'todo'`) continue to work without modification — calendar-imported tasks satisfy these constraints.

---

## New Entity: GoogleCalendarIntegration

**Firestore path**: `users/{uid}/integrations/googleCalendar`

Follows the same pattern as the existing `users/{uid}/integrations/googleTasks` document.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `refreshToken` | `string` | Google OAuth2 refresh token for the Calendar scope. Never exposed to the frontend. |
| `connectedAt` | `Timestamp` | Server timestamp when the user first connected Google Calendar. |
| `lastSyncDate` | `string` | YYYY-MM-DD date of the most recent successful import. Used to skip redundant imports on same-day app opens. |

### State transitions

```
Not connected → Connected (user completes OAuth flow in Settings)
Connected      → Disconnected (user clicks Disconnect; document is deleted)
Connected      → Import triggered (frontend calls importGoogleCalendarEvents; lastSyncDate updated)
```

### Security rules

Matches the existing pattern for `integrations/googleTasks`:
- Only the owning user can read/write (`request.auth.uid == userId`).
- Cloud Functions access the document via Firebase Admin SDK (bypasses client rules).

---

## Firestore Index Requirement

To enable efficient deduplication queries, a single-field index on `calendarEventId` is needed in the `users/{uid}/tasks` subcollection.

Firestore auto-indexes all fields by default, so no explicit `firestore.indexes.json` entry is required unless a composite query (e.g., `calendarEventId + status`) is needed. If the deduplication query uses only `calendarEventId == <id>`, the auto-index is sufficient.

---

## Entity Relationship Summary

```
User (Firebase Auth)
 └── tasks/{taskId}                  ← Extended with priority, isCalendarImport, calendarEventId
 └── integrations/
      ├── googleTasks                 ← Existing (unchanged)
      └── googleCalendar              ← New: refresh token + sync state
```
