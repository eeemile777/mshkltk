# Data Model: User

The `User` model represents any individual or entity interacting with the application. This includes anonymous guests, registered citizens, municipality administrators, and super administrators.

## Schema

| Field                 | Type                             | Description                                                                                               |
| --------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `id`                  | `string` (UUID)                  | Primary key for the user.                                                                                 |
| `username`            | `string`                         | Unique username for login. Required for non-anonymous users.                                              |
| `first_name`          | `string`                         | User's first name.                                                                                        |
| `last_name`           | `string`                         | User's last name.                                                                                         |
| `display_name`        | `string`                         | The name shown throughout the app (e.g., "First Last" or "Anonymous#1234").                               |
| `is_anonymous`        | `boolean`                        | `true` if the user is a guest, `false` otherwise.                                                         |
| `password_hash`       | `string`                         | The hashed version of the user's password. Never store plain text.                                        |
| `salt`                | `string`                         | A random salt used for hashing the password.                                                              |
| `points`              | `number`                         | Gamification points earned by the user.                                                                   |
| `achievements`        | `string[]`                       | An array of `Badge` IDs the user has earned.                                                              |
| `reports_count`       | `number`                         | A cached count of reports submitted by this user.                                                         |
| `reportsConfirmed`    | `number`                         | A cached count of how many other users' reports this user has confirmed.                                  |
| `confirmedReportIds`  | `string[]`                       | An array of `Report` IDs this user has confirmed. Used to prevent duplicate confirmations.                |
| `subscribedReportIds` | `string[]`                       | An array of `Report` IDs this user is following for notifications.                                        |
| `created_at`          | `string` (ISO 8601)              | Timestamp of when the user account was created.                                                           |
| `avatarUrl`           | `string` (URL)                   | URL to the user's profile picture. Can be a data URL or a hosted image URL.                               |
| `onboarding_complete` | `boolean`                        | Flag to determine if the user has completed the initial app tour.                                         |
| `role`                | `'citizen' \| 'municipality' \| 'super_admin'` | Defines the user's access level and permissions.                                          |
| `municipality_id`     | `string` (Optional)              | If `role` is `'municipality'`, this links the user to a specific municipality (e.g., 'beirut').             |
