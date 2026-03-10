# Data Model: Settings Page UI State

**Feature Branch**: `026-settings-page-alignment`  
**Created**: 2026-03-09
**Status**: Complete

## UI Entities

The Settings page tracks several UI states related to both local preferences and Firebase-backed integration status.

### ThemeState (Local Preference)

- **Fields**:
  - `theme`: `'light' | 'dark' | 'system'`
- **Validation**: Must be one of the three options.
- **Persistence**: LocalStorage (via `ThemeProvider`).

### IntegrationState (Firebase)

- **Fields**:
  - `isConnected`: `boolean` (checks if `users/{userId}/integrations/googleTasks` exists)
  - `selectedLists`: `string[]` (list of Google Task list IDs to synchronize)
- **State Transitions**:
  - `CONNECTING`: Triggered by `connectGoogleTasks`.
  - `CONNECTED`: Document exists in Firestore.
  - `DISCONNECTING`: Triggered by `disconnectGoogleTasks` (removes Firestore document).
- **Validation**: Selection of task lists requires `isConnected` to be `true`.

### UI Styling Tokens (src/styles/variables.css)

- **Relevant for this feature**:
  - `--accent-purple-neon`: Primary action color.
  - `--surface-overlay`: Card background color.
  - `--border-color`: Standard component borders.
  - `--text-primary`, `--text-secondary`: Font color tokens.
  - `9999px`: Targeted border-radius for "pill-shaped" elements.
  - `24px`: Targeted border-radius for "card-shaped" containers.
