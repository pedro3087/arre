```mermaid
graph TD
    subgraph Frontend ["Frontend (Vite + React)"]
        UI[UI Components]
        Layout[Layout & Routing]
        Hooks[Custom Hooks]
        AuthCtx[Auth Context]

        UI --> Layout
        UI --> Hooks
        Layout --> AuthCtx
    end

    subgraph Firebase ["Firebase Backend (Emulators/Cloud)"]
        Auth[Authentication]
        Firestore[(Firestore Database)]
        Storage[Storage Buckets]
        Functions[Cloud Functions]

        AuthCtx --> Auth
        Hooks --> Firestore
        Hooks --> Storage
        Hooks --> Functions
    end

    subgraph AI_Layer ["AI Processing"]
        OCR[Document OCR]
        LLM[Gemini 1.5 Pro]

        Functions --> OCR
        Functions --> LLM
    end

    %% Data Flow Connections
    classDef frontend fill:#eef2ff,stroke:#4f46e5,stroke-width:2px;
    classDef backend fill:#fff7ed,stroke:#f97316,stroke-width:2px;
    classDef ai fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;

    class UI,Layout,Hooks,AuthCtx frontend;
    class Auth,Firestore,Storage,Functions backend;
    class OCR,LLM ai;

    %% Specific Interactions
    Note1[User Uploads PDF] --> UI
    UI -- "1. Upload File" --> Storage
    UI -- "2. Call processMagicImport" --> Functions
    Functions -- "3. Read File" --> Storage
    Functions -- "4. Extract Text" --> OCR
    Functions -- "5. Analyze & Generate Tasks" --> LLM
    Functions -- "6. Return JSON Tasks" --> UI
    UI -- "7. User Reviews & Saves" --> Firestore
    Firestore -- "8. Real-time Sync" --> Hooks
```

## detailed Layer Breakdown

### 1. Presentation Layer (Frontend)

- **Framework**: React 19 + TypeScript + Vite
- **State Management**:
  - **Auth**: `AuthContext` (User session)
  - **Data**: `useTasks` (Real-time Firestore listeners)
  - **UI**: Local state using `useState` and `useReducer`
- **Styling**: CSS Modules with CSS Variables (`variables.css`) for theming.

### 2. Service Layer (Firebase SDK)

- **Authentication**: Google Sign-In via Firebase Auth.
- **Database**: Firestore queries wrapped in custom hooks.
- **Storage**: Direct upload from client.
- **Functions**: Callable Cloud Functions for complex logic (AI).

### 3. Backend Logic (Cloud Functions)

- **Environment**: Node.js runtime.
- **Triggers**: HTTPS Callable (for direct UI interaction) and Firestore Triggers (for background cleanups).
- **Security**: Admin SDK access, validated input.

### 4. Intelligence Layer (AI)

- **Gemini 1.5 Pro**: Used for understanding context, parsing PDFs/CSVs, and generating structured Task JSON.
- **Document AI (Optional)**: For specialized OCR if needed, though Gemini Multimodal is primary.
