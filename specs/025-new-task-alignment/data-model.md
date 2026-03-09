# Data Model: Task Creation

## Core Entities

### Task (Existing)

- **title**: string
- **notes**: string?
- **energy**: 'low' | 'neutral' | 'high'
- **status**: 'todo' | 'someday' | 'completed'
- **date**: string? (ISO 8601 date string)
- **projectId**: string? (Reference to Project ID)
- **isGoogleTask**: boolean (Internal sync flag)
- **googleTaskListId**: string?
- **tags**: string[]
- **createdAt**: string (ISO 8601 timestamp)

### Project (Existing)

- **id**: string
- **title**: string
- **color**: string (emerald, sapphire, ruby, lavender, gold, cyan, purple-neon)

## UI State

### TaskEditorModal State

- **activeTab**: 'manual' | 'ai' (DEFAULT: 'manual' for both new AND edit)
- **initialData**: Task? (Determines Edit vs Create mode)
- **projects**: Project[] (Loaded for selection)
