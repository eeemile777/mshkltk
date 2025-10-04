# Frontend Architecture

This document provides a high-level overview of the frontend architecture of the Mshkltk application.

## Core Technologies

-   **Framework:** React 18
-   **Language:** TypeScript
-   **Styling:** TailwindCSS
-   **Mapping:** Leaflet.js with MarkerCluster
-   **State Management:** React Context API (`AppContext`)
-   **Routing:** React Router (`HashRouter`)
-   **AI Integration:** `@google/genai` for Gemini API calls.

## Project Structure

The application follows a standard React project structure:

-   `src/components/`: Contains reusable UI components (e.g., `Header`, `InteractiveMap`).
-   `src/contexts/`: Home to the global state provider, `AppContext`.
-   `src/pages/`: Contains components that represent full-page views, mapped to routes.
-   `src/services/`: Includes `mockApi.ts` which simulates the backend, and `db.ts` which manages IndexedDB.
-   `src/hooks/`: Custom hooks for reusable logic (e.g., `useGeolocation`).
-   `src/types.ts`: Central repository for all TypeScript type definitions.
-   `src/constants.ts`: Stores application-wide constants like routes, colors, and translations.

## State Management

Global application state is managed via `AppContext` (`src/contexts/AppContext.tsx`). This provider holds critical information such as:

-   Current authenticated user (`currentUser`).
-   All `Report` and `Notification` data for the user.
-   UI state like language (`en`/`ar`) and theme (`light`/`dark`).
-   Map filter state (`activeCategories`, `activeStatuses`).
-   Functions to interact with the mock API and update state (e.g., `login`, `submitReport`).

## Offline Support

The application is designed to be offline-first. Key features include:

-   **Service Worker (`sw.js`):** Caches the application shell and assets for offline access.
-   **IndexedDB:**
    -   `db.ts`: Manages the application's entire dataset (users, reports, etc.) for the mock API.
    -   `AppContext.tsx`: Uses a separate IndexedDB store (`pending-reports`) to queue new reports created while the user is offline.
-   **Background Sync:** The service worker uses the `sync` event to trigger synchronization of pending reports once the network connection is restored. See `docs/frontend/offline-support.md` for more details.
