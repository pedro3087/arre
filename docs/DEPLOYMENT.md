# Arre App — Deployment & Operations Guide

This guide covers how to manage the Arre App deployment, troubleshoot authentication, and our strategy for production.

## 1. Firebase Console Status

To check the status of the deployed application, authentication, and database:

1.  **Access the Console**: Go to [Firebase Console - Arre App Dev](https://console.firebase.google.com/project/arre-app-dev).
2.  **Hosting Status**:
    - Navigate to **Build** > **Hosting**.
    - Here you can see the **Release History**, current version, and deployed files.
    - You can also roll back to previous versions if a deployment fails.
3.  **Functions Logs**:
    - Navigate to **Build** > **Functions**.
    - Click on the `processMagicImport` function and select "Logs" to see execution details and errors.

## 2. Connecting & Troubleshooting Authentication

If you cannot log in on the dev URL (`https://arre-app-dev.web.app`), it is likely due to **Authorized Domains** or missing **Sign-in Providers**.

### Step A: Enable Sign-in Methods

1.  Go to **Build** > **Authentication** > **Sign-in method**.
2.  Ensure the following providers are enabled:
    - **Google**: Enable it. You may need to provide a support email.
    - **Anonymous**: Enable it (used for "Dev Login").

### Step B: Add Authorized Domains

For Google Sign-In and other OAuth providers to work, the hosting domain must be authorized.

1.  Go to **Build** > **Authentication** > **Settings**.
2.  Select the **Authorized domains** tab.
3.  Ensure `arre-app-dev.web.app` and `arre-app-dev.firebaseapp.com` are listed.
    - _Note_: These should be added automatically when you enable Hosting, but verify them if login fails with `auth/unauthorized-domain`.

### Step C: Environment Configuration (Fixed)

We have updated the codebase to use real Firebase configuration instead of placeholders.

- **Local Development**: Uses `.env` file (created locally).
- **Production Build**: Uses the same environment variables.

**Action Required**: If you are building locally, ensure `.env` exists with `VITE_FIREBASE_...` keys.

### Step D: Dev Login Button

The "Dev Login (Anonymous)" button has been enabled in the production build for this phase to facilitate testing. It is no longer restricted to `import.meta.env.DEV`.

## 3. Production Deployment Strategy

Current Status: The app is deployed to the `arre-app-dev` project.

### Recommended Strategy

For a robust production lifecycle, we recommend a **Dual-Project Environment**:

| Feature    | Development (`arre-app-dev`) | Production (`arre-app-prod`) |
| :--------- | :--------------------------- | :--------------------------- |
| **URL**    | `arre-app-dev.web.app`       | `arre.app` (or similar)      |
| **Data**   | Test data, wiped frequently  | Real user data, backed up    |
| **Deploy** | Manual or on every PR merge  | Gated (e.g., on release tag) |

### Roadmap Implementation

1.  **Create Production Project**: Create a new Firebase project `arre-app-prod`.
2.  **CI/CD Pipeline** (for Phase 5):
    - Use **GitHub Actions** to automate deployment.
    - **Workflow**:
      - `push` to `main` -> Deploy to `arre-app-dev` (Preview).
      - `release` tag -> Deploy to `arre-app-prod` (Live).
3.  **Secrets Management**:
    - Store `FIREBASE_SERVICE_ACCOUNT` keys in GitHub Secrets.
    - Store `VITE_FIREBASE_CONFIG` as secrets for the build process.

### Manual Deployment Command

To deploy the current state to the active project:

```bash
# 1. Build the app (uses .env variables)
npm run build

# 2. Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 4. Pending Actions

- [x] ~~Go to Firebase Console > Authentication and enable **Google** and **Anonymous** providers.~~
- [x] ~~Verify `arre-app-dev.web.app` is in Authorized Domains.~~
- [x] ~~Run `npm run build` and `firebase deploy --only hosting` to push the config fix.~~

## 5. Cost Control & Teardown

To stop billing or "pause" the application, you have several options depending on whether you want to keep the data or deleting everything.

### Option A: Pause (Stop Consumption) - Recommended

This removes the active computing resources (Functions) and public access (Hosting), but keeps your database (Firestore) and Authentication users intact.

```bash
# 1. Delete the Cloud Function (Stops AI/Compute costs)
firebase functions:delete processMagicImport --region us-central1

# 2. Disable Hosting (Stops bandwidth costs & access)
firebase hosting:disable
```

### Option B: Downgrade to Free Plan

1. Go to **Project Overview** > **Usage and billing**.
2. Switch from **Blaze (Pay as you go)** to **Spark (No cost)**.
   - _Note_: This will automatically disable the Cloud Functions (Magic Import).

### Option C: Delete Project (Nuclear)

1. Go to **Project Settings**.
2. Scroll to the bottom and click **Delete project**.
   - _Warning_: This enters a 30-day recovery period, after which all data is permanently lost.
