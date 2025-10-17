# API: Comments

Endpoints for managing comments on reports.

---

### Get Comments for a Report

-   **Endpoint:** `GET /api/reports/:id/comments`
-   **Description:** Fetches all comments associated with a specific report, ordered from newest to oldest. The response should include the author's `User` object for each comment.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    ```json
    [
      {
        "id": "comment-123",
        "report_id": "report-abc",
        "user_id": "user-xyz",
        "text": "This is a serious issue!",
        "created_at": "2025-09-28T12:00:00.000Z",
        "user": { "...Public User Object..." }
      }
    ]
    ```

---

### Add a Comment to a Report

-   **Endpoint:** `POST /api/reports/:id/comments`
-   **Description:** Adds a new comment to a report. The backend should automatically create and send notifications to all subscribed users. For portal users, the backend must verify they have `'read_write'` permissions.
-   **Authentication:** Required.
-   **Request Body:**
    ```json
    {
      "text": "I saw this too, it needs to be fixed."
    }
    ```
-   **Success Response (201 Created):**
    -   Returns the newly created `Comment` object, including the hydrated `user` object.
-   **Error Response (403 Forbidden):**
    -   Returned if a portal user with `read_only` access attempts to comment.

---

### Delete a Comment (Super Admin Only)

-   **Endpoint:** `DELETE /api/comments/:commentId`
-   **Description:** Allows a super admin to permanently delete a comment for moderation purposes.
-   **Authentication:** Required (Super Admin role).
-   **Success Response (204 No Content):**
-   **Error Response (403 Forbidden):**
    -   Returned if a user without the super admin role attempts this action.
-   **Error Response (404 Not Found):**
    -   Returned if the comment does not exist.