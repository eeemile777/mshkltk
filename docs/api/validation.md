# API: Validation Rules & Constraints

This document defines the validation rules that should be enforced by the backend for data consistency and security. The frontend performs client-side validation for UX, but the backend **must** be the source of truth for all validation.

---

## User Model (`/api/users`)

### `username`
-   **Required:** `true`
-   **Type:** `string`
-   **Min Length:** 3 characters
-   **Max Length:** 20 characters
-   **Format:** Alphanumeric characters (`a-z`, `A-Z`, `0-9`) and underscores (`_`) only. Case-insensitive for uniqueness checks.

### `password`
-   **Required:** `true` (on creation)
-   **Type:** `string`
-   **Min Length:** 8 characters
-   **Complexity:** Must contain at least one uppercase letter, one lowercase letter, and one number.

### `first_name` / `last_name`
-   **Required:** `true`
-   **Type:** `string`
-   **Min Length:** 1 character
-   **Max Length:** 50 characters

---

## Report Model (`/api/reports`)

### `title_en` / `title_ar`
-   **Required:** `true`
-   **Type:** `string`
-   **Min Length:** 5 characters
-   **Max Length:** 100 characters

### `note_en` / `note_ar`
-   **Required:** `true`
-   **Type:** `string`
-   **Min Length:** 10 characters
-   **Max Length:** 1000 characters

### `lat` / `lng`
-   **Required:** `true`
-   **Type:** `number`
-   **Range:**
    -   `lat`: -90 to 90
    -   `lng`: -180 to 180

### `photo_urls`
-   **Required:** `true`
-   **Type:** `array` of `string`s
-   **Min Items:** 1
-   **Max Items:** 5
-   **Content:** The backend should be prepared to accept base64 data URLs and convert them to hosted URLs (e.g., on a cloud storage bucket).

### `category`
-   **Required:** `true`
-   **Type:** `string`
-   **Constraint:** Must be one of the valid `ReportCategory` enum values defined in `docs/data-model/report.md`.

### `severity`
-   **Required:** `true`
-   **Type:** `string`
-   **Constraint:** Must be one of the valid `ReportSeverity` enum values (`high`, `medium`, `low`).
