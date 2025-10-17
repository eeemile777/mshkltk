# Data Model: Report History

The `ReportHistory` model creates a timeline of status changes for a single `Report`, providing an audit trail for its lifecycle.

## Schema

| Field           | Type                | Description                                                                     |
| --------------- | ------------------- | ------------------------------------------------------------------------------- |
| `id`            | `string` (UUID)     | Primary key for the history entry.                                              |
| `report_id`     | `string` (Report ID)| Foreign key linking to the `Report` this history entry belongs to.              |
| `status`        | `ReportStatus`      | The new status of the report at this point in time.                             |
| `updated_at`    | `string` (ISO 8601) | Timestamp of when the status change occurred.                                   |
| `updated_by_id` | `string` (User ID)  | (Optional) Foreign key linking to the `User` who made the change (e.g., a portal admin). |
| `updated_by_name`| `string`           | (Optional) The display name of the user who made the change, cached for quick access.     |

## Relationships

-   **Belongs to a `Report`:** Each history entry is always associated with one `Report`.

## Cascading Logic

-   **On `Report` Deletion:** If a `Report` is deleted, all of its associated `ReportHistory` entries should also be deleted to maintain data integrity.
