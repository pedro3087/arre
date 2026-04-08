# Contract: importGoogleCalendarEvents (Cloud Function)

**Type**: Firebase Callable Function (HTTPS)
**Location**: `functions/index.js`
**Authentication**: Required (Firebase Auth)

## Purpose

Fetches today's events from the user's Google Calendar and creates them as high-priority tasks in Firestore. Handles deduplication (events already imported today are not re-created) and updates the integration's `lastSyncDate`.

---

## Request

```typescript
{
  // No parameters required. The function uses the caller's UID to look up credentials.
}
```

### Validation rules
- Caller must be authenticated.
- User must have a connected Google Calendar integration (`users/{uid}/integrations/googleCalendar` must exist with a valid `refreshToken`).

---

## Response (success)

```typescript
{
  imported: number,   // Count of new tasks created this call
  skipped: number,    // Count of events skipped (already imported or cancelled)
  date: string        // YYYY-MM-DD date for which events were imported
}
```

---

## Errors

| Code | Condition |
|------|-----------|
| `unauthenticated` | No valid Firebase Auth token in request |
| `failed-precondition` | Google Calendar not connected (integration doc missing or no refresh token) |
| `internal` | Unexpected error fetching calendar events or writing tasks |

---

## Processing Logic

```
1. Load refresh token from users/{uid}/integrations/googleCalendar
2. Build OAuth2 client with calendar.readonly scope
3. Determine today's date (YYYY-MM-DD) in UTC
4. Call calendar.events.list:
     calendarId: 'primary'
     timeMin: today 00:00:00 local (RFC 3339 ISO string)
     timeMax: today 23:59:59.999 local (RFC 3339 ISO string)
     singleEvents: true
     orderBy: 'startTime'
     showDeleted: false        // excludes cancelled events at API level
     maxResults: 250
5. (No manual cancellation filter needed — showDeleted: false handles it)
6. For each remaining event:
     a. Check if a task with calendarEventId == event.id already exists
        in users/{uid}/tasks
     b. If exists → skip (increment skipped counter)
     c. If not exists → create task:
          title: event.summary || '(No title)'
          date: event.start.date || event.start.dateTime split to YYYY-MM-DD
          status: 'todo'
          priority: 'high'
          isCalendarImport: true
          calendarEventId: event.id
          createdAt: serverTimestamp()
          updatedAt: serverTimestamp()
7. Update users/{uid}/integrations/googleCalendar.lastSyncDate = today
8. Return { imported, skipped, date }
```

---

## Side Effects

- Writes N new documents to `users/{uid}/tasks` (one per new calendar event).
- Updates `lastSyncDate` in `users/{uid}/integrations/googleCalendar`.

---

## Notes

- All-day events: use `event.start.date` (YYYY-MM-DD) directly. Timed events: use `event.start.dateTime` truncated to YYYY-MM-DD. Safe pattern: `(event.start.dateTime ?? event.start.date).substring(0, 10)`.
- The function does not modify or delete existing tasks. Import is strictly additive.
- If the Google Calendar token is expired, `googleapis` will auto-refresh it using the stored refresh token. No manual token refresh is needed.
- The function does not guard against same-day repeated calls returning `imported: 0` — this is normal behavior (deduplication handles it).
