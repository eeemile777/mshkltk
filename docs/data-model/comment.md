# Data Model: Comment

The `Comment` model represents a single comment made by a user on a `Report`.

## Schema

| Field       | Type                | Description                                                          |
| ----------- | ------------------- | -------------------------------------------------------------------- |
| `id`        | `string` (UUID)     | Primary key for the comment.                                         |
| `report_id` | `string` (Report ID)| Foreign key linking to the `Report` this comment belongs to.         |
| `user_id`   | `string` (User ID)  | Foreign key linking to the `User` who wrote the comment.             |
| `text`      | `string`            | The content of the comment.                                          |
| `created_at`| `string` (ISO 8601) | Timestamp of when the comment was created.                           |

## Relationships

-   **Belongs to a `Report`:** A comment is always associated with one `Report`.
-   **Belongs to a `User`:** A comment is always authored by one `User`.

## Cascading Logic

-   **On `Report` Deletion:** If a `Report` is deleted, all of its associated `Comments` should also be deleted to maintain data integrity.
-   **On `User` Deletion:** If a `User` is deleted, their `Comments` should be anonymized by setting `user_id` to a generic "deleted_user" ID. This preserves the conversation history on reports while respecting user deletion.
