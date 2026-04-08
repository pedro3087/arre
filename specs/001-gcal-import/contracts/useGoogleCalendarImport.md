# Contract: useGoogleCalendarImport (Frontend Hook)

**Type**: React Hook
**Location**: `src/features/integrations/useGoogleCalendarImport.ts`

## Purpose

Triggers the Google Calendar import on mount (when the user opens the app) and exposes the connection/import status to the component tree. Consumed by the root layout or Today tab so that calendar events are imported automatically each time the app is opened.

---

## Signature

```typescript
function useGoogleCalendarImport(): {
  isConnected: boolean;        // true if googleCalendar integration doc exists
  isImporting: boolean;        // true while the import Cloud Function is in progress
  importError: string | null;  // error message if import failed, null otherwise
  lastSyncDate: string | null; // YYYY-MM-DD of last successful import, null if never
}
```

---

## Behavior

### On mount
1. Reads `users/{uid}/integrations/googleCalendar` from Firestore to determine connection state.
2. If not connected → sets `isConnected: false` and returns early (no import attempted).
3. If connected → calls the `importGoogleCalendarEvents` Cloud Function.
4. Sets `isImporting: true` while the function is in flight.
5. On success → sets `lastSyncDate` from the response; clears `importError`.
6. On error → sets `importError` with a user-facing message; does not throw.

### Re-mount behavior
Hook re-runs on every mount. The Cloud Function handles deduplication server-side — duplicate calls within the same day return `imported: 0` harmlessly.

---

## Usage

```tsx
// In MainLayout or Dashboard
const { isConnected, isImporting, importError } = useGoogleCalendarImport();
```

---

## Notes

- This hook does not expose a manual "re-import" trigger. Refresh is achieved by re-mounting (navigating away and back).
- The hook does not show UI directly — it returns state for the consuming component to render.
- `importError` should be surfaced as a non-blocking notification, not a full-page error.
