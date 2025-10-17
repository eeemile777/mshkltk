# Data Model: Notification

The `Notification` model represents a single notification sent to a user, triggered by various events within the application.

## Schema

| Field       | Type                 | Description                                                                                              |
| ----------- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| `id`        | `string` (UUID)      | Primary key for the notification.                                                                        |
| `user_id`   | `string` (User ID)   | Foreign key linking to the `User` who should receive this notification.                                  |
| `type`      | `NotificationType`   | The type of event that triggered the notification. See `NotificationType` enum below.                    |
| `report_id` | `string` (Report ID) | (Optional) Foreign key linking to a `Report` if the notification is related to one. Can be `null`.       |
| `created_at`| `string` (ISO 8601)  | Timestamp of when the notification was created.                                                          |
| `read`      | `boolean`            | `true` if the user has seen the notification, `false` otherwise.                                         |
| `metadata`  | `object`             | A flexible key-value store for additional data needed to construct the notification message (e.g., `{ "reportTitle": "...", "newStatus": "in_progress" }`). |

---

## Enums

### `NotificationType`

Describes the event that caused the notification.

-   `status_change`: A report's status was updated.
-   `badge`: The user earned a new badge.
-   `confirm`: A report the user follows received a new confirmation.
-   `new_follower`: Another user started following one of the user's reports.
-   `new_comment`: A new comment was posted on a report the user follows or created.
-   `proof_request`: A municipality has requested a photo to verify the resolution of a user's report.
