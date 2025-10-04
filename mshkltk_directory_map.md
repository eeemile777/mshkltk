# Mshkltk Application Directory Map

This document provides a comprehensive overview of the file and folder structure for the "Mshkltk" civic-tech application.

---

### Root Directory

*   `index.html`: The main HTML file and entry point. It loads external CSS/JS, sets up TailwindCSS, and defines the `<div id="root">` where the app is mounted.
*   `index.tsx`: The root of the React application. It finds the `root` element and renders the main `App` component.
*   `metadata.json`: Configuration file for the hosting environment, specifying app name, description, and required permissions (e.g., camera, microphone).
*   `App.tsx`: The top-level React component. It sets up `AppProvider` for state, `HashRouter` for routing, and defines the overall route structure (protected vs. auth routes).
*   `constants.ts`: Central file for constants: navigation paths, localization strings (`translations`), theme colors, and icon mappings.
*   `types.ts`: Contains all TypeScript type definitions (`User`, `Report`) and enums (`Language`, `ReportCategory`) for the application's data models.

---

### Directories

#### `components/`
*Reusable UI components used across multiple pages.*

*   `AuthGate.tsx`: A wrapper component that protects routes by checking for an authenticated user. Redirects to login if the user is not logged in.
*   `AuthLayout.tsx`: A specific layout for authentication pages (Login, Signup), providing a simplified header.
*   `BottomNav.tsx`: The main bottom navigation bar with links and a central Floating Action Button (FAB) for creating new reports.
*   `Header.tsx`: The top header bar, displaying the app title, language toggle, notifications, and user profile link.
*   `InteractiveMap.tsx`: The core map component using `maplibre-gl`. It renders vector tiles and handles high-performance data layers like GeoJSON clustering and heatmaps.
*   `Layout.tsx`: The main application layout for authenticated views, wrapping pages with the `Header` and `BottomNav`.
*   `MapControls.tsx`: Renders floating filter buttons on the map to allow users to filter reports by category and status.
*   `ShareModal.tsx`: A modal for social sharing. It dynamically generates a shareable image card of a report using the Canvas API.
*   `Spinner.tsx`: A simple, reusable loading spinner component.
*   `WizardStepper.tsx`: A visual progress indicator for the multi-step report submission wizard.

#### `contexts/`
*React Context providers for managing global state.*

*   `AppContext.tsx`: The primary context provider. Manages global state like user session, language/theme, reports, notifications, and map filters. Exposes functions to interact with this state.

#### `data/`
*Static data for mocking a backend.*

*   `mockData.ts`: Contains initial arrays of mock `Report` and `Notification` data to populate the app on first load.

#### `hooks/`
*Custom React hooks for reusable stateful logic.*

*   `useGeolocation.ts`: A hook that abstracts the browser's Geolocation API to get the user's current coordinates.

#### `pages/`
*Components representing distinct pages/views.*

*   `AboutPage.tsx`: Static page with information about the app's mission.
*   `AchievementsPage.tsx`: Displays all available badges and indicates which ones the user has earned.
*   `HomePage.tsx`: The default landing page, which renders the full-screen `InteractiveMap`.
*   `LeaderboardPage.tsx`: (Currently empty) A placeholder file for a future user leaderboard feature.
*   `MapPage.tsx`: An alternative route that also renders the `InteractiveMap`.
*   `NotificationsPage.tsx`: Lists the current user's notifications.
*   `ProfilePage.tsx`: The user profile screen, showing stats, user's reports, and settings.
*   `ReportDetailsPage.tsx`: Shows a detailed view of a single report with its photos, map location, and a confirmation button.
*   `TrendingPage.tsx`: Fetches and displays a ranked list of the most-confirmed reports.
*   `auth/`: Sub-directory for authentication-related pages.
    *   `AnonymousRedirect.tsx`: A utility component that logs in a user as a guest and redirects them.
    *   `LoginPage.tsx`: The user login form.
    *   `Logout.tsx`: A utility component that logs the user out and redirects.
    *   `SignupPage.tsx`: The user registration form.
*   `report/`: Sub-directory for the multi-step report submission wizard.
    *   `ReportWizardPage.tsx`: The main component that orchestrates the wizard, managing state and flow between steps.
    *   `Step1_Type.tsx`: The first step where the user chooses to report with or without media.
    *   `Step2_Photo.tsx`: The second step, for uploading a photo/video of the issue (if chosen).
    *   `Step3_Location.tsx`: The third step, for pinning the location on a map.
    *   `Step4_Details.tsx`: The final step, for reviewing AI-generated details (if media was provided) and submitting the report.

#### `services/`
*Modules for external communication and business logic.*

*   `crypto.ts`: Utility functions for client-side password hashing (`SHA-256`) and salt generation.
*   `mockApi.ts`: Simulates a backend API using `localStorage` for data persistence. Manages users, reports, and notifications in the browser's storage.

#### `utils/`
*Miscellaneous utility functions.*

*   `mapUtils.ts`: A helper that creates custom icon images on a canvas and adds them to a MapLibre instance, enabling high-performance, data-driven markers.