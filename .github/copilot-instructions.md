# Mshkltk Production-Ready Copilot Instructions

## 1. Mission Overview

**Your primary mission is to transition the "Mshkltk" application from its current state as a high-fidelity frontend prototype into a secure, scalable, and production-ready application.**

-   **Current State:** A feature-complete frontend that looks and feels like a real application.
-   **Backend:** The entire backend is currently simulated on the client-side in `services/mockApi.ts` using IndexedDB (`services/db.ts`) for data persistence. This simulation is your **API contract**.
-   **Primary Goal:** Methodically implement a real backend server, secure the application, and establish a production-grade build and deployment pipeline while preserving the application's core features and user experience.

---

## 2. Roadmap to Production

This is a phased roadmap. You must follow these steps in order, as each phase builds upon the last.

### Phase 1: Foundational Backend & Build Setup

This is the most critical phase. The goal is to replace the mock environment with a real, working backend and a production-ready frontend build process.

#### A. Backend Implementation

Your first task is to build the server-side application.
**Recommended Stack:** Node.js with Express.js or Fastify, and a PostgreSQL database (for its robust geospatial capabilities via PostGIS).

1.  **Database Setup:**
    -   Use the data model documentation in `/docs/data-model/` as the single source of truth for your database schemas.
    -   Create tables/collections for `User`, `Report`, `Comment`, `Notification`, `ReportHistory`, and the dynamic configuration entities (`DynamicCategory`, `DynamicBadge`, `GamificationSettings`).
    -   **Crucially, implement the relationships and cascading logic** described in `/docs/data-model/README.md`. For example, deleting a `Report` must also delete its associated `Comments` and `ReportHistory` entries. Deleting a `User` must anonymize their content, not delete it.

2.  **API Endpoint Implementation:**
    -   Your goal is to create a real API that perfectly matches the contract defined in `/docs/api/`.
    -   The file `services/mockApi.ts` contains the client-side implementation of all business logic. **You must replicate this logic on the server.** This includes:
        -   How `confirmReport` prevents a user from confirming their own report.
        -   How `addComment` creates notifications for all subscribed users.
        -   The logic inside `updateUser` for adjusting points and setting new passwords.
        -   The permission checks for all Portal and Super Admin actions (e.g., verifying `portal_access_level === 'read_write'`).

3.  **Handling Media Uploads:**
    -   The mock API currently accepts base64 data URLs in `photo_urls`. Your backend must be able to handle this.
    -   **Endpoint Logic (`POST /api/reports`):**
        1.  Receive the request with an array of base64 strings.
        2.  For each string, decode it into a binary buffer.
        3.  Upload this buffer to a cloud file storage service (e.g., AWS S3, Google Cloud Storage).
        4.  Receive the permanent, public URL for the uploaded file.
        5.  Replace the base64 string in the `photo_urls` array with this new URL before saving the `Report` object to the database.
        -   **Never store base64 strings in your database.**

#### B. Production Build Process (Vite)

The current CDN-based `importmap` is for prototyping only.

1.  **Install and Configure Vite:** Set up Vite for a React + TypeScript project. Create a `vite.config.ts` file.
2.  **Bundle & Minify:** The default `npm run build` command in Vite will handle this. Ensure it's working correctly.
3.  **Purge Unused CSS:** Your `tailwind.config.js` file must be configured to purge unused utility classes for production builds. This is critical for performance. The `content` array should look like this:
    ```javascript
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    ```
4.  **Implement Route-Based Code Splitting:**
    -   Refactor `App.tsx` to use `React.lazy()` and `<React.Suspense>` for all page-level components. This will dramatically improve initial load time.
    -   **Example:**
        ```tsx
        // Before
        import HomePage from './pages/HomePage';
        // ...
        <Route path={PATHS.HOME} element={<HomePage />} />

        // After
        const HomePage = React.lazy(() => import('./pages/HomePage'));
        // ...
        <Route
          path={PATHS.HOME}
          element={
            <React.Suspense fallback={<Spinner />}>
              <HomePage />
            </React.Suspense>
          }
        />
        ```

---

### Phase 2: Critical Security Hardening

The current prototype has major security vulnerabilities that **must** be fixed.

1.  **Proxy ALL Gemini API Calls:**
    -   **Problem:** The Gemini API key is currently exposed on the client. This is a critical vulnerability.
    -   **Solution:** Create new endpoints on your backend server that act as a proxy.
        -   Create `POST /api/ai/analyze-media`, `POST /api/ai/transcribe-audio`, and `POST /api/ai/detect-municipality`.
        -   Refactor all frontend components that use Gemini (`ReportFormPage.tsx`, `Step3_Location.tsx`) to call these new backend endpoints instead of `ai.models.generateContent`.
        -   Your backend will receive the request, securely attach the secret Gemini API key (from a server environment variable), and then make the call to the Gemini API.
    -   **Example Frontend Refactor in `ReportFormPage.tsx`:**
        ```tsx
        // Before
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent(...);

        // After
        const response = await fetch('/api/ai/analyze-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ mediaParts, langName, categoryList })
        });
        const result = await response.json();
        ```

2.  **Implement Real Authentication (JWT):**
    -   **Password Hashing:** On user registration (`POST /api/users`), you must hash the user's password with a unique salt before storing it in the database. Use a strong algorithm like Argon2 or bcrypt. The logic in `services/crypto.ts` can be used as a reference for the hashing process.
    -   **Login Flow (`POST /api/login`):**
        1.  Find the user by their username.
        2.  Re-hash the provided password with the user's stored salt.
        3.  Compare the result with the stored `password_hash`.
        4.  If they match, generate a signed JSON Web Token (JWT) containing the `user.id` and `user.role`.
        5.  Return this token to the client.
    -   **Authenticated Requests:**
        -   The frontend will store the JWT (e.g., in a secure cookie or local storage) and send it with every subsequent API request in the `Authorization: Bearer <token>` header.
        -   Your backend must have middleware that intercepts every protected request, validates the JWT's signature, and extracts the user's ID and role to authorize the action.

---

### Phase 3: Scalability & Performance

1.  **API Pagination:**
    -   All list endpoints (`GET /api/reports`, `GET /api/users`, `GET /api/audit-logs`) **must** support pagination.
    -   A standard approach is `?page=1&limit=50`.
    -   Update the frontend pages (`SuperAdminReportsPage.tsx`, `LeaderboardPage.tsx`, etc.) to fetch data in chunks and implement UI for "Load More" buttons or infinite scrolling.

2.  **Database Indexing:**
    -   Add database indexes to frequently queried columns to ensure fast lookups. Key candidates for indexing include:
        -   `reports.created_by`
        -   `reports.municipality`
        -   `reports.category`
        -   `reports.status`
        -   `comments.report_id`
        -   `users.username`

---

### Phase 4: Testing & Deployment

1.  **Implement the Testing Strategy:**
    -   Refer to `docs/TESTING.md` for the full strategy.
    -   **Unit Tests (Vitest):** Prioritize testing utility functions and logic-heavy components.
    -   **Integration Tests (Vitest + React Testing Library):** Test form handling, modal interactions, and components that rely on context.
    -   **End-to-End Tests (Playwright):** Write E2E tests for the most critical user flows, such as offline report submission, user impersonation, and the full portal report resolution workflow.

2.  **Set Up CI/CD:**
    -   Create a Continuous Integration/Deployment pipeline using a service like GitHub Actions.
    -   The pipeline should, on every push to the main branch:
        1.  Install dependencies (`npm install`).
        2.  Run all tests (`npm test`).
        3.  Create a production build of the frontend (`npm run build`).
        4.  Deploy the static frontend assets to a hosting provider (like Vercel or Netlify) and deploy the backend server (to a service like Heroku or Fly.io).

---

## 4. Core Architectural Principles to Maintain

As you refactor and build, you **must** preserve these core architectural pillars:

-   **Offline-First Functionality:** The Service Worker (`sw.js`) and its interaction with `AppContext.tsx` for background sync is a non-negotiable feature. Ensure this flow continues to work seamlessly with the new backend. The logic is detailed in `docs/frontend/offline-support.md`.
-   **State Management Isolation:** The strict separation of concerns between `AppContext` (Citizen), `PortalContext` (Portal), and `SuperAdminContext` (Super Admin) is crucial for maintainability. Do not introduce dependencies between them.
-   **UI/UX and Design System:** All new UI must strictly adhere to the color palette, typography, and component styles defined in `docs/STYLE_GUIDE.md`. The application's aesthetic quality is a top priority.
-   **Bilingual (RTL/LTR) Support:** Continue to use the `translations` object in `constants.ts` for all user-facing strings. All new UI must be tested in both English (LTR) and Arabic (RTL) modes.
-   **Component Architecture:** Respect the component structure and logic detailed in `docs/frontend/component-architecture.md`, especially the complex state machine of the Report Wizard.

By following this comprehensive roadmap, you will successfully transform the Mshkltk prototype into a robust, secure, and scalable production application.
