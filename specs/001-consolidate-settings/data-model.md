# Data Model: Consolidate Settings into Sidebar Footer

**Branch**: `001-consolidate-settings` | **Date**: 2026-03-08

## Overview

This feature involves no new data entities and no schema changes. It is a pure UI relocation of existing functionality.

## Existing Entity: Theme Preference

| Attribute    | Value                                  |
|--------------|----------------------------------------|
| Name         | Theme Preference                       |
| Storage      | Browser localStorage                   |
| Key          | `"vite-ui-theme"`                      |
| Type         | String enum: `'light'` \| `'dark'` \| `'system'` |
| Default      | `'system'`                             |
| Managed by   | `src/features/theme/ThemeProvider.tsx` |
| Changed by   | (before) Sidebar footer button — (after) Settings page Appearance section |

No structural change to this entity. Only the UI control that writes to it changes location.
