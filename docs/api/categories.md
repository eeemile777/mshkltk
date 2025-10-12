# API: Categories

Endpoints for managing report categories and sub-categories. These are restricted to Super Admins.

---

### Get All Categories

-   **Endpoint:** `GET /api/categories`
-   **Description:** Fetches a list of all report categories and their sub-categories.
-   **Authentication:** Required.
-   **Success Response (200 OK):**
    -   Returns an array of `DynamicCategory` objects.
    ```json
    [
      {
        "id": "infrastructure",
        "icon": "FaRoadBridge",
        "color_light": "#4A90E2",
        "color_dark": "#5EBFDE",
        "name_en": "Infrastructure",
        "name_ar": "البنية التحتية",
        "is_active": true,
        "subCategories": [
          { "id": "unpaved_roads", "name_en": "Unpaved or damaged roads", "name_ar": "طرق غير معبدة أو متضررة" }
        ]
      }
    ]
    ```

---

### Create a New Category

-   **Endpoint:** `POST /api/categories`
-   **Description:** Creates a new top-level report category.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** A `DynamicCategory` object (without the `id`). The `id` should be a machine-readable version of the name (e.g., "new_recycling_rules").
-   **Success Response (201 Created):**
    -   Returns the newly created `DynamicCategory` object.

---

### Update a Category

-   **Endpoint:** `PUT /api/categories/:id`
-   **Description:** Updates an existing category, including its sub-categories. The entire `subCategories` array must be sent.
-   **Authentication:** Required (Super Admin role).
-   **Request Body:** A partial `DynamicCategory` object.
    ```json
    {
      "name_en": "Updated Infrastructure",
      "is_active": false,
      "subCategories": [
        { "id": "unpaved_roads", "name_en": "Damaged Roads", "name_ar": "طرق متضررة" },
        { "id": "new_sub_cat", "name_en": "New Sub-Category", "name_ar": "فئة فرعية جديدة" }
      ]
    }
    ```
-   **Success Response (200 OK):**
    -   Returns the updated `DynamicCategory` object.

---

### Delete a Category

-   **Endpoint:** `DELETE /api/categories/:id`
-   **Description:** Deletes a category. The backend should decide on a strategy for existing reports using this category (e.g., re-assign to 'other_unknown' or block deletion if in use).
-   **Authentication:** Required (Super Admin role).
-   **Success Response (204 No Content):**
