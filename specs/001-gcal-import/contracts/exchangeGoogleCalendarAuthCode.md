# Contract: exchangeGoogleCalendarAuthCode (Cloud Function)

**Type**: Firebase Callable Function (HTTPS)
**Location**: `functions/index.js`
**Authentication**: Required (Firebase Auth)

## Purpose

Exchanges a Google OAuth2 authorization code for a refresh token scoped to Google Calendar read access. Saves the refresh token to the user's `googleCalendar` integration document in Firestore.

This function mirrors the existing `exchangeGoogleAuthCode` function but targets the Calendar API scope and a separate Firestore document.

---

## Request

```typescript
{
  code: string   // OAuth2 authorization code from Google Identity Services popup
}
```

### Validation rules
- `code` must be a non-empty string.
- Caller must be authenticated (Firebase Auth token required).

---

## Response (success)

```typescript
{
  success: true
}
```

---

## Errors

| Code | Condition |
|------|-----------|
| `unauthenticated` | No valid Firebase Auth token in request |
| `invalid-argument` | `code` is missing or empty |
| `failed-precondition` | Google did not return a refresh token (user may need to revoke prior access) |
| `internal` | Unexpected error during token exchange or Firestore write |

---

## Side Effects

Writes to Firestore: `users/{uid}/integrations/googleCalendar`
```
{
  refreshToken: "<refresh token>",    // sensitive — server-only
  connectedAt: <server timestamp>,
  lastSyncDate: null
}
```
Uses `set(..., { merge: true })` so subsequent re-authorizations update the token without clearing `lastSyncDate`.

---

## OAuth2 Scope Required (frontend)

The frontend must request this scope when initiating the OAuth2 code flow:
```
https://www.googleapis.com/auth/calendar.readonly
```

The Google Identity Services code client must be initialized with `access_type: 'offline'` and the authorization request must include `prompt: 'consent'` to ensure Google returns a refresh token (not just an access token).

---

## Notes

- The authorization code is one-time use. Do not retry with the same code if the exchange fails.
- Google only returns a `refresh_token` on the first authorization or after the user revokes access. If no refresh token is returned, throw `failed-precondition`.
- The `postmessage` redirect URI must be used with the Google Identity Services popup flow (same as existing Google Tasks auth).
