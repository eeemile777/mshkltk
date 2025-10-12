# API: Users

Endpoints for fetching user-related data like profiles and leaderboards.

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
-   **Description:** Fetches a list of top users, sorted by points.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    ```json
    [
      { "...User Object..." },
      { "...User Object..." }
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
