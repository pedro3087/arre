# Arre - Backend Architecture & Logic Specification

This document serves as the blueprint for migrating the **Arre** frontend application to a robust **Firebase** backend. It details the data models, business logic, and integration strategies required.

## 1. Technology Stack Selection

- **Database**: **Cloud Firestore** (NoSQL) for flexible, real-time data syncing.
- **Authentication**: **Firebase Auth** (Google, Email/Password).
- **Storage**: **Firebase Storage** (for user uploads like PDFs/CSVs for AI processing).
- **Backend Logic**: **Cloud Functions** (for AI processing and complex aggregations).
- **AI**: **Vertex AI** via Cloud Functions (for task generation).
- **Frontend Data Layer**: **React Query** (TanStack Query) + Firebase Web SDK (v9+).

## 2. Data Models (Firestore Schema)

The database will be structured to support multi-tenancy (each user sees only their data).

### `users` (Collection)

User profiles and global settings.

```typescript
interface UserDocument {
  uid: string; // Document ID
  email: string;
  displayName: string;
  photoURL?: string;
  themePreference: "light" | "dark" | "system";
  createdAt: Timestamp;
}
```

### `tasks` (Collection)

Located at: `/users/{userId}/tasks/{taskId}`
Primary collection for all work items.

```typescript
interface TaskDocument {
  id: string; // Document ID
  title: string;
  notes?: string;

  // Logic: Status Workflow
  status: "todo" | "completed" | "canceled";

  // Logic: "Today" & "This Evening"
  date?: string; // YYYY-MM-DD. If present, it shows in "Today" or "Upcoming".
  isEvening: boolean; // If true AND date === today, shows in "This Evening".

  // Logic: "Work Area" & Energy Filters
  energy?: "low" | "neutral" | "high";

  // Logic: Organization
  tags: string[]; // Array of tag strings
  projectId?: string; // Reference to project ID

  // Metadata
  createdAt: Timestamp;
  completedAt?: Timestamp; // For Velocity Chart calculations
  updatedAt: Timestamp;
}
```

### `projects` (Collection)

Located at: `/users/{userId}/projects/{projectId}`

```typescript
interface ProjectDocument {
  id: string;
  title: string;
  color: string; // e.g., 'emerald', 'sapphire'
  order: number; // For UI sorting
}
```

## 3. Business Logic & Rules

### A. Dashboard & Views Logic

| View             | Query Logic (Firestore)                                                                                    |
| :--------------- | :--------------------------------------------------------------------------------------------------------- |
| **Today**        | `tasks.where('date', '==', today).where('status', '!=', 'completed').orderBy('isEvening', 'asc')`          |
| **This Evening** | Client-side filter from "Today" query OR `tasks.where('date', '==', today).where('isEvening', '==', true)` |
| **Inbox**        | `tasks.where('date', '==', null).where('projectId', '==', null).where('status', '!=', 'completed')`        |
| **Upcoming**     | `tasks.where('date', '>', today).orderBy('date', 'asc')`                                                   |
| **Anytime**      | `tasks.where('date', '==', null).where('projectId', '!=', null)`                                           |
| **Someday**      | `tasks.where('status', '==', 'someday')` (or distinct collection)                                          |
| **Logbook**      | `tasks.where('status', '==', 'completed').orderBy('completedAt', 'desc')`                                  |

### B. Productivity Metrics (Velocity Chart)

**Challenge**: Firestore reads can be expensive if we query all completed tasks every time.
**Solution**:

1.  **Client-Side Aggregation (Simple)**: Query the last 7 days of completed tasks:
    - `tasks.where('status', '==', 'completed').where('completedAt', '>=', last7Days)`
    - Group by day locally to build the chart data.
2.  **Cloud Function (Scalable)**:
    - Trigger: `onUpdate` of a task status to 'completed'.
    - Action: Increment a counter in a `/stats/{userId}/daily/{YYYY-MM-DD}` document.
    - Frontend: Reads just 7 documents from `/stats` instead of potentially hundreds of task documents.

### C. AI Task Generation ("Magic Import")

**Current Flow**: User uploads file -> AI analyzes -> **User Reviews** -> Tasks Saved.

To support the "Review before Save" UI pattern, we will use a **Callable Cloud Function** instead of a background trigger.

1.  **User Action**:
    - User drags & drops a file in the "Magic Import" modal.
    - Frontend reads file (as base64 or text) or uploads to tmp storage if large.
2.  **Request**:
    - Frontend calls `functions.httpsCallable('processMagicImport')` with file data.
3.  **Processing (Server)**:
    - Function sends content to **Vertex AI / Gemini** with a "Task Extraction" prompt.
    - AI returns a structured JSON array of tasks (Title, Notes, suggested Energy level).
4.  **Response**:
    - Function returns this JSON array to the Frontend.
5.  **Review & Save**:
    - Frontend displays "3 Tasks Generated".
    - User clicks "Import".
    - Frontend calls `batch.commit()` to save selected tasks to Firestore `tasks` collection.

## 4. Integration Strategy

The best way to connect this is via a **Custom Hook Layer**.

### Example: `useTasks` Hook

This abstraction allows us to swap the Mock Data for Real Data seamlessly.

```typescript
// features/tasks/hooks/useTasks.ts
export function useTasks(view: 'today' | 'inbox' | 'upcoming') {
  const { user } = useAuth();

  return useQuery(['tasks', view, user?.uid], async () => {
    // 1. Construct Query based on 'view'
    const q = query(
      collection(db, 'users', user.uid, 'tasks'),
      where(...)
    );

    // 2. Fetch
    const snapshot = await getDocs(q);

    // 3. Transform to App Domain Model
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
  });
}
```

## 5. Security Rules (Firestore)

Crucial for data privacy.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      // Users can only read/write their OWN data
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Implementation Roadmap

1.  **Phase 1**: Set up Firebase Project & Auth Config.
2.  **Phase 2**: Create `useAuth` context provider.
3.  **Phase 3**: Migrate `Task` interface to match Firestore types (Strings for dates vs Timestamps).
4.  **Phase 4**: Replace `mockData.ts` with `useTasks` hooks backed by simple Firestore queries.
5.  **Phase 5**: Implement the "Velocity" aggregation logic.
