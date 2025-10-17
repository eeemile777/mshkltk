# API Endpoint Documentation

This section provides a complete contract for the backend API that needs to be built for the Mshkltk application. The `services/mockApi.ts` file in the frontend source code serves as a client-side implementation of this contract and can be used as a reference for business logic.

## Endpoint Categories

-   **[Authentication](./authentication.md):** User registration, login for all roles, and session management.
-   **[Reports](./reports.md):** Creating, fetching, and interacting with civic issue reports.
-   **[Comments](./comments.md):** Managing comments on reports.
-   **[Users](./users.md):** Fetching user profiles and leaderboards.
-   **[Gamification](./gamification.md):** Managing points rules and achievement badges (Super Admin).
-   **[Categories](./categories.md):** Managing report categories and sub-categories (Super Admin).
-   **[Super Admin](./superadmin.md):** Endpoints for high-level administrative actions like deleting users or impersonating accounts.
-   **[Validation Rules](./validation.md):** A summary of all data validation constraints that the backend must enforce.