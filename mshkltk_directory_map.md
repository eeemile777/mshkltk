# Mshkltk Application Directory Map

This document provides a comprehensive overview of the file and folder structure for the "Mshkltk" civic-tech application.

---

### Root Directory

*   `index.html`: The main HTML file and entry point. It loads external CSS/JS, sets up TailwindCSS, and defines the root div where the app is mounted.
*   `index.tsx`: The root of the React application. It finds the `root` element, renders the main `App` component, and registers the service worker.
*   `metadata.json`: Configuration file for the hosting environment, specifying app name, description, and required device permissions (camera, microphone, geolocation).
*   `App.tsx`: The top-level React component. It sets up context providers, the router, and defines the entire application's route structure, including the citizen app, portal, and super admin areas.
*   `constants.ts`: Central file for application-wide constants: navigation `PATHS`, `translations` for localization, `STATUS_COLORS`, and mappings for `BADGES` and `ICONS`.
*   `types.ts`: Contains all TypeScript type definitions (`User`, `Report`, etc.) and enums (`Language`, `ReportCategory`, etc.) for the application's data models.
*   `sw.js`: The service worker file responsible for caching the app shell for offline use and handling background sync for pending reports.

---

### Directories

#### `assets/`
*Static assets used by the application.*
*   `favicon.svg`: The application's favicon.

#### `components/`
*Reusable UI components used across multiple pages.*

*   `Layout.tsx`: The main application layout for the citizen app, wrapping pages with the `Header` and `BottomNav`.
*   `Header.tsx`: The top header bar, containing the app title, search bar, and links to notifications, community, and profile pages.
*   `BottomNav.tsx`: The main bottom navigation bar with links and a central Floating Action Button (FAB) for creating new reports.
*   `InteractiveMap.tsx`: The core map component using **Leaflet.js**. It renders tiles, handles custom markers, and uses the **`leaflet.markercluster`** plugin for performance.
*   `MapControls.tsx`: Renders floating filter buttons on the map to allow users to filter reports by category, status, and time.
*   `AuthLayout.tsx`, `AuthGate.tsx`, `LandingGate.tsx`: Components that manage the layout and access control for authentication and landing pages.
*   `OnboardingTour.tsx`: The interactive tutorial component that guides new users through the app's features.
*   `AchievementToast.tsx`: A pop-up toast notification that appears when a user earns a new badge.
*   `CategorySelectionModal.tsx`: A modal for selecting a report category and sub-category.
*   `Lightbox.tsx`: A full-screen image viewer component.
*   `SearchSuggestions.tsx`: The dropdown that appears with suggestions when a user types in the main search bar.
*   `ShareModal.tsx`: A modal for social sharing that dynamically generates a shareable image card of a report.
*   `SkeletonLoader.tsx`: A collection of placeholder components used to indicate loading states across the app.
*   `Spinner.tsx`: A simple, reusable loading spinner component.
*   `TutorialModal.tsx`: A modal that explains the steps for submitting a report with or without media.
*   `WizardStepper.tsx`: A visual progress indicator for the multi-step report submission wizard.
*   `portal/`: Sub-directory for components specific to the Municipality Portal.
    *   `PortalLayout.tsx`, `PortalSidebar.tsx`, `PortalAuthGate.tsx`: Core layout and access control for the portal.
    *   `PortalReportFilters.tsx`: Filter UI for the portal's report list page.
    *   `ResolutionProofModal.tsx`: Modal for uploading a photo as proof that a report has been resolved.
*   `superadmin/`: Sub-directory for components specific to the Super Admin Portal.
    *   `SuperAdminLayout.tsx`, `SuperAdminSidebar.tsx`, `SuperAdminAuthGate.tsx`: Core layout and access control for the super admin panel.
    *   `AdminAccountEditModal.tsx`, `BadgeEditModal.tsx`, `CategoryEditModal.tsx`, `CategorySelectionModal.tsx`: Modals for creating and editing various application entities.
    *   `SuperAdminReportCreator.tsx`: A wrapper component that initiates the citizen reporting flow under a temporary anonymous user session for an admin.

#### `contexts/`
*React Context providers for managing global and scoped state.*

*   `AppContext.tsx`: The primary context for the citizen app. Manages global state like user session, language/theme, reports, notifications, and the report wizard state.
*   `PortalContext.tsx`: Manages state specifically for the Municipality Portal, including scoped reports and portal-specific user data.
*   `SuperAdminContext.tsx`: Manages state for the Super Admin Portal, providing access to all users, reports, and configuration settings.

#### `data/`
*Static data for mocking a backend and generating assets.*

*   `mockData.ts`: Contains logic to procedurally generate a large set of mock `Report`, `User`, `Comment`, and `Notification` data.
*   `mockImages.ts`: Includes functions to generate SVG avatars and canvas-based placeholder images for reports.
*   `dynamicConfig.ts`: Holds the initial, default configuration for dynamic entities like categories, badges, and gamification points.

#### `hooks/`
*Custom React hooks for reusable stateful logic.*

*   `useGeolocation.ts`: A hook that abstracts the browser's Geolocation API to get the user's current coordinates.

#### `lib/`
*General-purpose library functions.*

*   `urls.ts`: A utility for constructing shareable, absolute URLs for specific reports.

#### `pages/`
*Components representing distinct pages/views, organized by application area.*

*   `LandingPage.tsx`: The initial animated entry page for the application.
*   `HomePage.tsx`: The default landing page for authenticated users, which renders the full-screen `InteractiveMap`.
*   `MapPage.tsx`: An alternative route that also renders the `InteractiveMap`.
*   `TrendingPage.tsx`: Displays a ranked list of the most-confirmed reports.
*   `ReportFormPage.tsx`: The main component that orchestrates the report submission wizard.
*   `ReportDetailsPage.tsx`: Shows a detailed view of a single report.
*   `NotificationsPage.tsx`: Lists the current user's notifications.
*   `AchievementsPage.tsx`: The "Community" page, containing the user leaderboard and badge collection.
*   `ProfilePage.tsx`: The user profile screen.
*   `AboutPage.tsx`: Static page with information about the app.
*   `DemoPage.tsx`: A sandboxed page to demonstrate the Gemini AI analysis flow.
*   `auth/`: Sub-directory for authentication-related pages (`LoginPage`, `SignupPage`, etc.).
*   `report/`: Sub-directory for the multi-step report submission wizard steps (`Step1_Type`, `Step2_Photo`, etc.).
*   `portal/`: Sub-directory for Municipality Portal pages (`PortalDashboardPage`, `PortalReportsListPage`, etc.).
*   `superadmin/`: Sub-directory for Super Admin Portal pages (`SuperAdminDashboardPage`, `SuperAdminUsersPage`, etc.).

#### `services/`
*Modules for external communication and business logic.*

*   `crypto.ts`: Utility functions for client-side password hashing and salt generation.
*   `db.ts`: Manages the entire IndexedDB database, including schema setup, seeding, and CRUD operations.
*   `mockApi.ts`: Simulates a complete backend API, using `db.ts` for data persistence. This is the contract for the future backend.

#### `utils/`
*Miscellaneous utility functions.*

*   `mapUtils.ts`: A helper that creates custom HTML-based icons for Leaflet markers.

#### `docs/`
*All project documentation.*

*   `README.md`: Main project documentation entry point.
*   `STYLE_GUIDE.md`: Outlines the application's design system, including colors and typography.
*   `TESTING.md`: Defines the strategy for future implementation of automated tests.
*   `api/`: Folder containing markdown files for each set of API endpoints (authentication, reports, etc.).
*   `data-model/`: Folder containing markdown files for each data model schema (User, Report, etc.).
*   `frontend/`: Folder containing markdown files explaining the frontend architecture, state management, and offline support.