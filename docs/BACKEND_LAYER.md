# Backend Layer: Serverless Infrastructure with Firebase

This document details the backend architecture of the Arre application, which is built entirely on the Google Firebase platform. It covers the business rationale for this choice, the services used, and the implementation of the data schema, security, and server-side logic.

## 1. Business Case

Choosing a serverless architecture with Firebase was a strategic decision driven by the following business objectives:

- **Accelerate Time-to-Market:** Firebase's integrated suite of tools (database, authentication, functions) eliminates the need for manual server setup and management, allowing the development team to focus exclusively on building user-facing features.
- **Scalability & Reliability:** The platform automatically scales to meet user demand, ensuring the app remains fast and responsive during peak usage without requiring manual intervention. This is critical for a growing user base.
- **Reduce Operational Overhead:** With no servers to manage, patch, or monitor, the ongoing operational and maintenance costs are significantly lower compared to a traditional backend infrastructure.
- **Enable Real-Time Features:** Cloud Firestore's native support for real-time data synchronization is the cornerstone of Arre's "live" user experience, where changes are reflected across all devices instantly. This is a key differentiator for a modern productivity tool.

## 2. Services & Technology

Arre's backend is a composition of several managed services from the Firebase ecosystem.

| Service | Purpose & Application |
| :--- | :--- |
| **Cloud Firestore** | The primary database. It's a NoSQL, document-based database that stores all application data (user profiles, tasks, projects). Its key feature is the real-time listener (`onSnapshot`) that powers the live UI updates. |
| **Firebase Authentication** | Provides a secure and easy-to-implement identity solution. It manages user sign-up, sign-in, and session persistence. Arre is configured to use Google Sign-In and Anonymous authentication. |
| **Cloud Functions** | Provides the server-side logic layer. Used for operations that are either insecure or too complex to run on the client. The primary use case is the "Magic Import" AI feature. |
| **Firebase Storage** | Used for object storage, specifically for handling user file uploads (PDFs, CSVs) for the Magic Import feature. Files are securely stored per-user. |
| **Google Generative AI (Gemini 1.5 Pro)**| Integrated via a Cloud Function, this powerful AI model is used to analyze document content and intelligently extract actionable tasks, forming the core of the "Magic Import" feature. |
| **Firebase Hosting** | Hosts the static assets of the compiled React application. It's configured to support a Single Page Application (SPA), ensuring client-side routing works correctly. |

## 3. Implementation Details

### a. Data Schema & Multi-Tenancy (Firestore)

The Firestore database is designed for strict data isolation, ensuring no user can ever access another user's data.

- **Structure:** All user-specific data is nested under a document corresponding to their unique user ID: `/users/{userId}`.
- **Sub-collections:** Within each user's document, `tasks` and `projects` are stored in dedicated sub-collections (e.g., `/users/{userId}/tasks/{taskId}`). This is a scalable and performant way to organize data in Firestore.
- **Data Models:** The schema for each document is defined in `BACKEND_ARCHITECTURE.md`, specifying the fields and data types for tasks, projects, and user profiles.

### b. Security & Validation (`firestore.rules`, `storage.rules`)

Security is enforced at the database level, not on the client.

- **Ownership Enforcement:** The core security rule is `allow read, write: if request.auth.uid == userId;`. This rule, applied to the `/users/{userId}` path and all its sub-collections, guarantees that an authenticated user can only ever access their own data tree.
- **Schema Validation:** The rules go beyond just ownership. They also validate the shape of the data being written. For example, when creating a task, the rules ensure that the `title` is a non-empty string and the `status` is one of the allowed values ('todo', 'completed', etc.). This prevents data corruption and adds a powerful layer of server-side validation.
- **Storage Security:** `storage.rules` applies the same ownership principle, ensuring users can only upload and access files within their own designated folder in the Firebase Storage bucket.

### c. Server-Side AI Logic (`functions/index.js`)

The most significant piece of backend logic is the `processMagicImport` Cloud Function.

- **Type:** It's an `onCall` (Callable) function, which means it's invoked directly by the frontend and can return data, making it suitable for request/response workflows.
- **Process Flow:**
    1.  **Authentication:** The function first verifies that the request is coming from a logged-in user.
    2.  **File Parsing:** It receives a base64-encoded file, determines its type (PDF, CSV, or text), and parses it into raw text content.
    3.  **Secure AI Call:** It constructs a detailed prompt for the Gemini 1.5 Pro model, instructing it to extract actionable tasks. The `GEMINI_API_KEY` is securely accessed via Firebase's built-in secret management, not hardcoded in the function.
    4.  **Response Handling:** It receives the AI-generated list of tasks, cleans the response to ensure it's valid JSON, and returns the array of task strings to the client.
- **Client-Side Responsibility:** The client is then responsible for presenting these suggestions to the user, who gives the final approval to save them to the database.
