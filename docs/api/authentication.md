# API: Authentication

Endpoints for handling user registration, login (for citizens, portals, and super admins), and session management.

---

### Create Citizen User

-   **Endpoint:** `POST /api/users`
-   **Description:** Registers a new citizen user.
-   **Authentication:** None.
-   **Request Body:**
    ```json
    {
      "first_name": "Nader",
      "last_name": "H",
      "username": "nader",
      "password": "password123",
      "avatarUrl": "data:image/svg+xml;base64,..."
    }
    ```
-   **Success Response (201 Created):**
    -   Returns the newly created `User` object (without password details).
-   **Error Response (409 Conflict):**
    -   Returned if the `username` already exists.
    ```json
    { "error": "username_taken", "message": "Username is already taken." }
    ```
-   **Error Response (400 Bad Request):**
    -   Returned if validation fails (e.g., password too short). See `docs/api/validation.md`.
    ```json
    { "error": "validation_failed", "message": "Password must be at least 8 characters." }
    ```

---

### User Login (Citizen, Portal, Super Admin)

-   **Endpoint:** `POST /api/login`
-   **Description:** Authenticates a user and returns a JWT. The backend must differentiate the login type to ensure the user has the correct role for the target application area.
-   **Authentication:** None.
-   **Request Body:**
    ```json
    {
      "username": "nader_h",
      "password": "password123",
      "type": "citizen" // or "portal" or "superadmin"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "token": "your_jwt_token",
      "user": { "...User Object..." }
    }
    ```
-   **Error Response (401 Unauthorized):**
    ```json
    { "error": "invalid_credentials", "message": "Invalid username or password." }
    ```
-   **Error Response (403 Forbidden):**
    -   Returned if a user tries to access the wrong portal (e.g., a citizen trying to log into the municipality portal).
    ```json
    { "error": "access_denied", "message": "This user does not have portal access." }
    ```

---

### Create Anonymous (Guest) User

-   **Endpoint:** `POST /api/users/anonymous`
-   **Description:** Creates a temporary anonymous user profile and returns a session token.
-   **Authentication:** None.
-   **Success Response (200 OK):**
     ```json
    {
      "token": "your_jwt_token",
      "user": { "...Anonymous User Object..." }
    }
    ```

---

### Upgrade Anonymous User to Registered User

-   **Endpoint:** `POST /api/users/upgrade`
-   **Description:** Converts the current anonymous user (identified by their token) into a full registered user, migrating their points, reports, etc.
-   **Authentication:** Required (Anonymous User's JWT).
-   **Request Body:**
    ```json
    {
      "first_name": "Nader",
      "last_name": "H",
      "username": "nader_new",
      "password": "password123",
      "avatarUrl": "data:image/svg+xml;base64,..."
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the newly created `User` object and a new JWT.
-   **Error Response (409 Conflict):**
    -   Returned if the requested `username` is already taken.
    ```json
    { "error": "username_taken", "message": "Username is already taken." }
    ```