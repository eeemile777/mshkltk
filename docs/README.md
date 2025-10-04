# Mshkltk Application Documentation

Welcome to the official documentation for the Mshkltk application. This collection of documents is designed to assist backend developers in understanding the application's architecture, data models, and API requirements to transition the project from a mock-data prototype to a production-ready application.

This documentation is structured into several key areas:

-   **[Data Model](./data-model/README.md):** Detailed schemas for all major entities in the application, such as Users, Reports, and Notifications.
-   **[API Endpoints](./api/authentication.md):** A comprehensive guide to the required RESTful API endpoints, including request/response formats for authentication, report management, and user interactions.
-   **[Frontend Architecture](./frontend/README.md):** An overview of the client-side application, including state management, key components, and offline support mechanisms.

## How to Use This Documentation

1.  Start with the **[Data Model](./data-model/README.md)** to understand the core database schemas you will need to create.
2.  Use the **API Endpoints** section as a specification for building the backend services. The mock API in the frontend (`src/services/mockApi.ts`) serves as a client-side reference implementation.
3.  Refer to the **[Frontend Architecture](./frontend/README.md)** section for context on how the client-side application consumes the API and manages state.

This documentation will be updated as the application evolves.
