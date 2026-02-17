# State Management Layer: Data Flow and Synchronization

This document describes the state management architecture of the Arre application. It explains the strategy for handling data, the tools and patterns used, and how it ensures a real-time, consistent, and reliable user experience.

## 1. Business Case

For a real-time productivity app, state management is the central nervous system. A robust state layer is critical for:

- **User Trust:** Data must be consistent everywhere. When a user marks a task as complete in the `Today` view, it must instantly be reflected in the `Project` view and be correctly archived in the backend. Inconsistencies erode user trust.
- **Real-Time Experience:** The app must feel "live." Changes made on one device should appear nearly instantaneously on another. This requires a tight coupling between the backend and the frontend state.
- **Developer Velocity & Maintainability:** A clear, predictable state management pattern prevents bugs and makes the application easier to scale. By centralizing data-fetching logic, we avoid redundant code and ensure components remain simple and focused on presentation.

## 2. Tooling & Architectural Patterns

Arre employs a modern, hooks-based approach to state management, leveraging core React features and custom abstractions.

| Pattern / Tool | Purpose & Application |
| :--- | :--- |
| **Custom Hooks** | This is the **core architectural pattern**. Complex logic for fetching, subscribing to, and manipulating data is encapsulated within reusable hooks (e.g., `useTasks`, `useProjects`). This provides a clean, single-line API for components to consume application state and actions, completely abstracting away the complexities of interacting with the database. |
| **React Context** | Used to provide global, app-wide state that doesn't change frequently. In Arre, it is used for `AuthContext` (to provide the current user object everywhere) and `ThemeContext` (to provide the current theme). This avoids "prop drilling." |
| **React Hooks (`useState`, `useEffect`)** | The fundamental building blocks. `useState` is used within our custom hooks to hold the state (e.g., the array of tasks), and `useEffect` is the critical piece that connects the component's lifecycle to the external Firebase backend, setting up and tearing down real-time data subscriptions. |
| **Firebase `onSnapshot`**| This is the key to Arre's real-time functionality. Our custom hooks use this Firestore client SDK method to open a persistent connection to the database. Whenever data changes on the server (e.g., a task is added or updated), Firestore automatically pushes the new data to the client, the `onSnapshot` callback fires, and our state is updated via `useState`, triggering a UI re-render. |

## 3. Implementation Details

### a. Authentication State (`src/lib/auth/AuthContext.tsx`)

The authentication state is the foundation upon which all user-specific data is built.

- **`AuthProvider`:** This component wraps the entire application. It uses Firebase's `onAuthStateChanged` listener to monitor the user's login status.
- **`AuthContext`:** The provider exposes the `user` object and a `loading` flag via a React Context.
- **`useAuth()` Hook:** This custom hook provides a simple and declarative way for any component in the tree to access the current user's information (`const { user } = useAuth();`). This is crucial, as the `user.uid` is required for all other data-fetching hooks to query the correct data.

### b. Task Management (`src/features/tasks/hooks/useTasks.ts`)

This is the most critical and complex state management hook in the application.

- **Real-Time Subscription:** The hook takes an optional `view` parameter (e.g., 'today', 'inbox'). Inside a `useEffect`, it uses the `user.uid` and the `view` to construct a specific Firestore query. It then establishes a real-time listener using `onSnapshot`.
- **Automatic UI Updates:** When the listener is attached, it fetches the initial data. From then on, any change to the queried data on the server (from any client) will cause Firestore to send a new snapshot. The hook processes this snapshot, updates its internal state with `setTasks()`, and React automatically re-renders any component using the hook.
- **Data Modification:** The hook returns functions like `addTask`, `updateTask`, and `deleteTask`. These functions perform the write operations to Firestore. Because the app has an active `onSnapshot` listener, the UI updates automatically as soon as the write operation is confirmed by the server. We don't need to manually add the new task to the local state; Firestore's real-time push does it for us.

**Example Usage:**
```tsx
// In a component for the "Today" view
const { tasks, loading, addTask } = useTasks('today');
// 'tasks' will always be the real-time list of today's tasks
```

### c. Project Management (`src/features/projects/hooks/useProjects.ts`)

This hook follows the exact same pattern as `useTasks` but for the `projects` collection.

- **Real-Time Subscription:** It establishes an `onSnapshot` listener to the current user's `projects` collection in Firestore.
- **Data Integrity:** The `deleteProject` function demonstrates a key state management principle: data integrity. It uses a Firestore `writeBatch` to atomically perform two operations:
    1. It queries for all tasks associated with the project being deleted and updates them to have `projectId: null`.
    2. It deletes the project document itself.
  This batch operation ensures the database is never left in an inconsistent state (e.g., tasks pointing to a non-existent project).
- **Centralized Logic:** Components don't need to know about this complex deletion logic. They simply call `deleteProject(id)`, and the hook handles the rest.
