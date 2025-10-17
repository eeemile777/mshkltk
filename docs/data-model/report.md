# Data Model: Report

The `Report` model is the core entity of the Mshkltk application. It contains all information related to a single civic issue reported by a citizen.

## Schema

| Field                 | Type                  | Description                                                                                                   |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                  | `string` (UUID)       | Primary key for the report.                                                                                   |
| `title_en`            | `string`              | The report title in English.                                                                                  |
| `title_ar`            | `string`              | The report title in Arabic.                                                                                   |
| `photo_urls`          | `string[]`            | An array of URLs to photos/videos for the report. These can be base64 data URLs or hosted URLs.               |
| `lat`                 | `number`              | The latitude of the report's location.                                                                        |
| `lng`                 | `number`              | The longitude of the report's location.                                                                       |
| `area`                | `string`              | The human-readable address or area name (e.g., "Ashrafieh, Beirut").                                          |
| `municipality`        | `string`              | The AI-detected municipality ID in lowercase (e.g., "beirut"). Used for routing reports to the correct portal.|
| `category`            | `ReportCategory`      | The main category of the issue. See `ReportCategory` enum below.                                              |
| `sub_category`        | `string` (Optional)   | A more specific sub-category within the main category (e.g., 'unpaved_roads').                                |
| `note_en`             | `string`              | The detailed description of the issue in English.                                                             |
| `note_ar`             | `string`              | The detailed description of the issue in Arabic.                                                              |
| `status`              | `ReportStatus`        | The current workflow status of the report. See `ReportStatus` enum below.                                     |
| `severity`            | `ReportSeverity`      | The severity of the issue. See `ReportSeverity` enum below.                                                   |
| `confirmations_count` | `number`              | The number of users who have confirmed seeing this issue.                                                     |
| `created_at`          | `string` (ISO 8601)   | Timestamp of when the report was created.                                                                     |
| `created_by`          | `string` (User ID)    | Foreign key linking to the `User` who created the report.                                                     |
| `subscribedUserIds`   | `string[]` (User IDs) | An array of `User` IDs who are subscribed to this report for updates.                                         |

---

## Enums

### `ReportCategory`

The high-level classification of the report.

-   `infrastructure`
-   `electricity_energy`
-   `water_sanitation`
-   `waste_environment`
-   `public_safety`
-   `public_spaces`
-   `public_health`
-   `urban_planning`
-   `transportation`
-   `emergencies`
-   `transparency_services`
-   `other_unknown`

### `ReportStatus`

The lifecycle status of a report.

-   `new`: Newly submitted by a citizen.
-   `received`: Acknowledged by the municipality.
-   `in_progress`: The municipality is actively working on a resolution.
-   `resolved`: The issue has been fixed.

### `ReportSeverity`

The level of urgency or impact of the issue.

-   `high`
-   `medium`
-   `low`
