# API: Users

Endpoints for fetching and managing user-related data.

---

### Get a Specific User's Profile

-   **Endpoint:** `GET /api/users/:id`
-   **Description:** Fetches the public profile of a specific user.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns a public-safe `User` object (omitting sensitive fields like `password_hash`, `salt`).
-   **Error Response (404 Not Found):**
    -   Returned if a user with the given `id` does not exist.
    ```json
    { "error": "not_found", "message": "User not found." }
    ```
---

### Get the Leaderboard

-   **Endpoint:** `GET /api/leaderboard`
-   **Description:** Fetches a list of top citizen users, sorted by points.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    ```json
    [
      { "...Public User Object..." },
      { "...Public User Object..." }
    ]
    ```

---

### Update Current User's Avatar

-   **Endpoint:** `PUT /api/users/me/avatar`
-   **Description:** Updates the avatar for the currently authenticated user.
-   **Authentication:** Required.
-   **Request Body:**
    ```json
    {
      "avatarUrl": "data:image/png;base64,..."
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the updated `User` object.

---
---

## Super Admin Endpoints

The following endpoints require `super_admin` role.

### List All Users

-   **Endpoint:** `GET /api/users`
-   **Description:** Fetches a list of all users in the system (citizens and admins).
-   **Authentication:** Required (Super Admin role).
-   **Success Response (200 OK):**
    -   Returns an array of `User` objects.

---

### Update Any User

-   **Endpoint:** `PUT /api/users/:id`
-   **Description:** Allows a super admin to update any user's profile information, including sensitive fields.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** A partial `User` object.
    ```json
    {
      "display_name": "Updated Name",
      "points": 150, // Can set points directly
      "is_active": false, // Suspend a user
      "portal_access_level": "read_only" // Change portal permissions
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the updated `User` object.

---

### Create Admin User

-   **Endpoint:** `POST /api/users/admin`
-   **Description:** Creates a new administrative user (municipality, utility, etc.).
-   **Authentication:** Required (Super Admin role).
-   **Request Body:**
    ```json
    {
      "role": "municipality",
      "username": "beirut_new_admin",
      "display_name": "Beirut Municipality (New)",
      "password": "strongpassword123",
      "municipality_id": "beirut",
      "portal_access_level": "read_write"
    }
    ```
-   **Success Response (201 Created):**
    -   Returns the newly created admin `User` object.
-   **Error Response (409 Conflict):**
    -   Returned if the username or the municipality ID (for `municipality` role) is already assigned.

---

### Delete Any User

-   **Endpoint:** `DELETE /api/users/:id`
-   **Description:** Permanently deletes a user and anonymizes their associated content (reports, comments).
-   **Authentication:** Required (Super Admin role).
-   **Success Response (204 No Content):**
