# Data Model Schemas

This section provides detailed documentation for the core data models used in the Mshkltk application. Understanding these schemas is the first step in designing the database for the production backend.

Each document describes the fields, types, and purpose of a specific data entity.

## Core Models

-   **[User Model](./user.md):** Represents all actors in the system, including citizens, municipality staff, and super administrators.
-   **[Report Model](./report.md):** The central entity of the application, representing a civic issue reported by a citizen.
-   **[Comment Model](./comment.md):** Represents comments made by users on a report.
-   **Notification Model:** (To be created) Represents notifications sent to users based on various events.
-   **Report History Model:** (To be created) Tracks the status changes of a report over time.

## Data Relationships & Cascading Logic

Understanding how data models relate to each other is crucial for database integrity.

-   **User-Report (One-to-Many):** A `User` can create many `Reports`. A `Report` belongs to one `User`.
    -   **Cascading Logic:** When a `User` account is deleted, a decision must be made:
        -   **Option A (Recommended): Anonymize Reports.** The `created_by` field on their `Reports` should be set to a special `NULL` or a generic "Deleted User" ID. This preserves the valuable civic data.
        -   **Option B (Destructive): Cascade Delete.** Deleting the `User` also deletes all associated `Reports`. This is generally not recommended as it results in data loss.

-   **User-Report (Many-to-Many via `subscribedUserIds`):**
    -   A `User` can subscribe to many `Reports`, and a `Report` can be subscribed to by many `Users`. This is managed via an array of User IDs on the `Report` model and an array of Report IDs on the `User` model.
    -   **Cascading Logic:** When a `User` is deleted, their ID should be removed from all `subscribedUserIds` arrays across all `Reports`. When a `Report` is deleted, its ID should be removed from all `subscribedReportIds` arrays on all `Users`.

-   **Report-Comment (One-to-Many):**
    -   **Cascading Logic:** When a `Report` is deleted, all of its associated `Comments` must also be deleted.