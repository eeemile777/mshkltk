# API: Reports

Endpoints for creating, fetching, and interacting with civic issue reports.

---

### Get All Reports

-   **Endpoint:** `GET /api/reports`
-   **Description:** Fetches a list of all reports. For portal users, this should be automatically scoped based on their role and permissions.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    ```json
    [
      { "...Report Object..." },
      { "...Report Object..." }
    ]
    ```

---

### Submit a New Report

-   **Endpoint:** `POST /api/reports`
-   **Description:** Creates a new report. The backend must handle base64 data URLs in `photo_urls`, save them to a file storage service (like S3), and replace them with the final hosted URLs before saving to the database.
-   **Authentication:** Required.
-   **Request Body:**
    ```json
    {
      "title_en": "Large Pothole",
      "title_ar": "حفرة كبيرة",
      "note_en": "...",
      "note_ar": "...",
      "photo_urls": ["data:image/jpeg;base64,..."],
      "lat": 33.8938,
      "lng": 35.5018,
      "area": "Ashrafieh, Beirut",
      "municipality": "beirut",
      "category": "infrastructure",
      "sub_category": "unpaved_roads",
      "severity": "high"
    }
    ```
-   **Success Response (201 Created):**
    -   Returns the newly created `Report` object.
-   **Error Response (400 Bad Request):**
    -   Returned for validation failures. See `docs/api/validation.md`.

---

### Get a Single Report

-   **Endpoint:** `GET /api/reports/:id`
-   **Description:** Fetches details for a specific report.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns the full `Report` object.
-   **Error Response (404 Not Found):**
    -   Returned if a report with the given `id` does not exist.
    ```json
    { "error": "not_found", "message": "Report not found." }
    ```

---

### Confirm a Report

-   **Endpoint:** `POST /api/reports/:id/confirm`
-   **Description:** Increments the confirmation count for a report. The backend must prevent a user from confirming the same report twice or confirming their own report.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns the updated `Report` object.
-   **Error Response (403 Forbidden):**
    -   Returned if the user tries to confirm their own report or a report they've already confirmed.
    ```json
    { "error": "confirmation_failed", "message": "User cannot confirm this report." }
    ```

---

### Toggle Subscription to a Report

-   **Endpoint:** `POST /api/reports/:id/subscribe`
-   **Description:** Subscribes the current user to a report for notifications.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns the updated `Report` object and the updated `User` object.

-   **Endpoint:** `DELETE /api/reports/:id/subscribe`
-   **Description:** Unsubscribes the current user from a report.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns the updated `Report` object and the updated `User` object.

---

### Update Report Status (Portal/Admin Only)

-   **Endpoint:** `PUT /api/reports/:id/status`
-   **Description:** Allows a municipality or super admin user to update the status of a report. Backend must verify the user has `'read_write'` permissions.
-   **Authentication:** Required (Portal or Super Admin role).
-   **Request Body:**
    ```json
    {
      "status": "in_progress",
      "proofPhotoUrl": "data:image/jpeg;base64,..." // Optional, only for 'resolved' status
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the updated `Report` object.
-   **Error Response (403 Forbidden):**
    -   Returned if a user without the proper role or with 'read_only' permissions attempts this action.
    ```json
    { "error": "permission_denied", "message": "User does not have permission to update report status." }
    ```

---

### Request Resolution Proof (Portal/Admin Only)

-   **Endpoint:** `POST /api/reports/:id/request-proof`
-   **Description:** Allows a portal user to send a notification to the original reporter asking for a photo to verify a resolution.
-   **Authentication:** Required (Portal or Super Admin role with `'read_write'` access).
-   **Success Response (200 OK):**
    -   Returns the `Notification` object(s) that were created.

---

### Update Full Report (Super Admin Only)

-   **Endpoint:** `PUT /api/reports/:id`
-   **Description:** Allows a super admin to edit any field of a report for quality control and correction.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:**
    -   A partial `Report` object containing only the fields to be updated.
    ```json
    {
      "title_en": "Corrected: Large Pothole on Main St",
      "severity": "medium",
      "lat": 33.8940,
      "lng": 35.5020
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the fully updated `Report` object.
-   **Error Response (403 Forbidden):**
    -   Returned if a user without the super admin role attempts this action.
-   **Error Response (404 Not Found):**
    -   Returned if the report does not exist.