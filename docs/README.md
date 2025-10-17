# Mshkltk Application Documentation

Welcome to the official documentation for the Mshkltk application. This collection of documents is designed to assist backend developers in understanding the application's architecture, data models, and API requirements to transition the project from a mock-data prototype to a production-ready application.

This documentation is structured into several key areas:

-   **[Data Model](./data-model/README.md):** The single source of truth for database schemas. This section provides detailed field descriptions for all major entities like `User`, `Report`, `Notification`, etc.

-   **[API Endpoints](./api/README.md):** A comprehensive guide to the required RESTful API endpoints. This serves as the contract for the backend, detailing request/response formats for everything from authentication to report management.

-   **[Frontend Architecture](./frontend/README.md):** An overview of the client-side application, including state management, key components, and offline support mechanisms. This provides context for how the API will be consumed.

## How to Use This Documentation

1.  Start with the **[Data Model](./data-model/README.md)** to understand the core database schemas you will need to create.
2.  Use the **[API Endpoints](./api/README.md)** section as a specification for building the backend services. The mock API in the frontend (`services/mockApi.ts`) serves as a client-side reference implementation of this contract.
3.  Refer to the **[Frontend Architecture](./frontend/README.md)** section for context on how the client-side application consumes the API and manages its state.

This documentation will be updated as the application evolves.
