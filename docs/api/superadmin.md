# API: Super Admin

Endpoints for high-level administrative actions available only to users with the `super_admin` role.

---

### Impersonate a User

-   **Endpoint:** `POST /api/users/:id/impersonate`
-   **Description:** Generates a temporary, short-lived JWT that grants access as the specified user. This allows a super admin to view the application exactly as that user would.
-   **Authentication:** Required (Super Admin role).
-   **Success Response (200 OK):**
    ```json
    {
      "token": "impersonation_jwt_token",
      "user": { "...Impersonated User Object..." }
    }
    ```
-   **Error Response (404 Not Found):**
    -   Returned if the user to be impersonated does not exist.

---

### Audit Trail

-   **Endpoint:** `GET /api/audit-logs`
-   **Description:** Fetches a list of all audit log entries, showing actions performed by administrators across the system.
-   **Authentication:** Required (Super Admin role).
-   **Success Response (200 OK):**
    -   Returns an array of `AuditLog` objects, sorted from newest to oldest.
    ```json
    [
        {
            "id": "log-1664380800000",
            "timestamp": "2025-09-28T16:00:00.000Z",
            "actorId": "user-super-admin",
            "actorName": "Super Admin",
            "actorRole": "super_admin",
            "message": "updated report \"Large Pothole\" (ID: report-1)."
        }
    ]
    ```
