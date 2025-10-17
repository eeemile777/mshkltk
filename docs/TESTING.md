# Mshkltk Testing Strategy

This document outlines the proposed strategy for implementing automated testing to ensure the quality, reliability, and maintainability of the Mshkltk application.

While tests are not yet implemented, this plan serves as a roadmap for future development.

---

## 1. Testing Frameworks

-   **Unit & Integration Tests:** **Vitest**
    -   **Why:** It offers a modern, fast, and Jest-compatible API, with first-class support for ES Modules and TypeScript, which aligns with our project's setup.
-   **End-to-End (E2E) Tests:** **Playwright**
    -   **Why:** It provides robust, cross-browser testing capabilities (Chrome, Firefox, Safari) and features like auto-waits, which make tests less flaky. Its ability to simulate different devices and user conditions (like network throttling) is invaluable for a mobile-first, offline-capable PWA.

---

## 2. Testing Layers

### Unit Tests
-   **Scope:** Test individual functions and small, isolated React components in complete isolation.
-   **Examples:**
    -   Testing a utility function in `services/crypto.ts` to ensure password hashing works as expected.
    -   Testing the `getDistance` function to verify its calculations are correct.
    -   Rendering a `StatusPill` component with different props and asserting that it displays the correct text and styles.
    -   Testing the EXIF orientation correction logic for `getCorrectedImageFile`.
-   **Goal:** Verify that the smallest pieces of our code work correctly on their own.

### Integration Tests
-   **Scope:** Test how multiple components work together. This often involves rendering a component that contains several children and simulating user interactions while mocking context providers.
-   **Examples:**
    -   Rendering the `ReportDetailsPage` component, mocking the `AppContext` value, and verifying that all data from the mock report is displayed correctly.
    -   Testing the `ReportFormPage` wizard flow by simulating clicks on "Next" and verifying that the correct step component is rendered and that the `wizardData` in the mock context is updated appropriately.
    -   Testing the `AdminAccountEditModal` to ensure form state is handled correctly and validation messages appear.
-   **Goal:** Ensure that components correctly communicate and integrate with each other.

### End-to-End (E2E) Tests
-   **Scope:** Simulate a complete user journey through the entire application running in a real browser. These tests interact with the app just like a real user would, using the `mockApi` as a simulated backend.
-   **Examples:**
    1.  **Guest Report Submission (Offline):**
        -   Start the browser with network offline.
        -   Click "Continue as Guest".
        -   Navigate to the report form and submit a report with a photo.
        -   Verify the report appears in the "My Reports" list with a "Pending Sync" status.
        -   Bring the network online and verify the report status updates automatically.
    2.  **Municipality Portal - Read-Only User:**
        -   Log in as a Super Admin.
        -   Create a new municipality account with "Read Only" permissions.
        -   Log out and log in as the new read-only user.
        -   Navigate to a report details page.
        -   Assert that the "Update Status" buttons and "Add Comment" form are **not visible**.
    3.  **Super Admin - Impersonation:**
        -   Log in as a Super Admin.
        -   Navigate to the "Citizen Users" page.
        -   Click the "Impersonate" button for a specific user.
        -   Assert that the app redirects to the citizen homepage and an impersonation banner is visible.
        -   Navigate to the profile page and verify the details match the impersonated user.
        -   Exit impersonation and assert that the app returns to the Super Admin panel.
-   **Goal:** Guarantee that critical user flows work from start to finish in a production-like environment.

---

## 3. Implementation Plan

1.  **Setup:** Add `vitest` and `playwright` to the project's development dependencies. Configure them to work with our TypeScript and React setup.
2.  **Unit Tests First:** Begin by writing unit tests for critical utility functions (`crypto.ts`, `mapUtils.ts`) and simple UI components. This builds a strong foundation.
3.  **Component Tests:** Progress to writing integration tests for more complex components and pages, especially those with forms and modals.
4.  **E2E for Critical Paths:** Develop E2E tests for the most important user journeys: login/signup, report submission, and the core workflows for the Municipality and Super Admin portals.
5.  **CI Integration:** Integrate the test suite into a Continuous Integration (CI) pipeline (e.g., GitHub Actions) to automatically run tests on every commit, preventing regressions.
