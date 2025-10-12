# API: Gamification

Endpoints for managing the application's gamification system, including points and badges. These are restricted to Super Admins.

---

### Get Gamification Settings

-   **Endpoint:** `GET /api/gamification/settings`
-   **Description:** Fetches the current points rules for various actions.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    ```json
    {
      "id": "default",
      "pointsRules": [
        { "id": "submit_report", "points": 10, "description": "For submitting a new report" },
        { "id": "confirm_report", "points": 3, "description": "For confirming an existing report" },
        { "id": "earn_badge", "points": 25, "description": "Bonus for earning a new badge" }
      ]
    }
    ```

---

### Update Gamification Settings

-   **Endpoint:** `PUT /api/gamification/settings`
-   **Description:** Updates the points rules. The request body should contain the entire settings object.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** The full `GamificationSettings` object.
-   **Success Response (200 OK):**
    -   Returns the updated `GamificationSettings` object.

---

### Get All Badges

-   **Endpoint:** `GET /api/badges`
-   **Description:** Fetches a list of all configurable badges.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns an array of `DynamicBadge` objects.

---

### Create a New Badge

-   **Endpoint:** `POST /api/badges`
-   **Description:** Creates a new achievement badge.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** A `DynamicBadge` object (without the `id`).
-   **Success Response (201 Created):**
    -   Returns the newly created `DynamicBadge` object.

---

### Update a Badge

-   **Endpoint:** `PUT /api/badges/:id`
-   **Description:** Updates an existing badge's properties.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** A partial `DynamicBadge` object.
-   **Success Response (200 OK):**
    -   Returns the updated `DynamicBadge` object.

---

### Delete a Badge

-   **Endpoint:** `DELETE /api/badges/:id`
-   **Description:** Deletes a badge.
-   **Authentication:** Required (Super Admin role).
-   **Success Response (204 No Content):**
