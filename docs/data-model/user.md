# Data Model: User

The `User` model represents any individual or entity interacting with the application. This includes anonymous guests, registered citizens, municipality administrators, and super administrators.

## Schema

| Field                   | Type                             | Description                                                                                               |
| ----------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                    | `string` (UUID)                  | Primary key for the user.                                                                                 |
| `username`              | `string`                         | Unique username for login. Required for non-anonymous users.                                              |
| `first_name`            | `string`                         | User's first name.                                                                                        |
| `last_name`             | `string`                         | User's last name.                                                                                         |
| `display_name`          | `string`                         | The name shown throughout the app (e.g., "First Last" or "Anonymous#1234").                               |
| `is_anonymous`          | `boolean`                        | `true` if the user is a guest, `false` otherwise.                                                         |
| `password_hash`         | `string`                         | The hashed version of the user's password. Never store plain text.                                        |
| `salt`                  | `string`                         | A random salt used for hashing the password.                                                              |
| `points`                | `number`                         | Gamification points earned by the user.                                                                   |
| `achievements`          | `string[]`                       | An array of `Badge` IDs the user has earned.                                                              |
| `reports_count`         | `number`                         | A cached count of reports submitted by this user.                                                         |
| `reportsConfirmed`      | `number`                         | A cached count of how many other users' reports this user has confirmed.                                  |
| `confirmedReportIds`    | `string[]`                       | An array of `Report` IDs this user has confirmed. Used to prevent duplicate confirmations.                |
| `subscribedReportIds`   | `string[]`                       | An array of `Report` IDs this user is following for notifications.                                        |
| `created_at`            | `string` (ISO 8601)              | Timestamp of when the user account was created.                                                           |
| `avatarUrl`             | `string` (URL)                   | URL to the user's profile picture. Can be a data URL or a hosted image URL.                               |
| `onboarding_complete`   | `boolean`                        | Flag to determine if the user has completed the initial app tour.                                         |
| `role`                  | `string`                         | Defines access level. See `User Role` enum below.                                                         |
| `portal_access_level`   | `'read_write' \| 'read_only'`    | (Optional) For portal roles, defines if the user can modify data (`read_write`) or only view it (`read_only`). |
| `municipality_id`       | `string` (Optional)              | If `role` is `'municipality'`, this links the user to a specific municipality (e.g., 'beirut').             |
| `scoped_categories`     | `ReportCategory[]` (Optional)    | For a `'utility'` role, limits their view to reports in these categories.                                 |
| `scoped_municipalities` | `string[]` (Optional)            | For `'utility'` or `'union_of_municipalities'`, limits their view to these municipality IDs.            |
| `scoped_sub_categories` | `string[]` (Optional)            | For a `'utility'` role, provides finer-grained filtering to specific sub-categories.                      |
| `is_active`             | `boolean` (Optional)             | `false` if the user account is suspended or banned. Defaults to `true`.                                   |
| `portal_title`          | `string` (Optional)              | A custom title displayed in the header of the portal for this user.                                       |
| `portal_subtitle`       | `string` (Optional)              | A custom subtitle displayed in the header of the portal.                                                  |

---

## Enums

### `User Role`

Defines the user's role and permission set within the application.

-   `'citizen'`: A regular or anonymous user of the public-facing application.
-   `'municipality'`: Staff from a single municipality, with access scoped to their jurisdiction.
-   `'utility'`: Staff from an external entity (e.g., water or electricity provider), with access scoped to specific report categories and/or municipalities.
-   `'union_of_municipalities'`: Staff from a regional body, with access scoped to a list of multiple municipalities.
-   `'super_admin'`: A system administrator with full access to all data and settings across the entire application.
