# Mshkltk - Civic Reporting Web App

A bilingual (English/Arabic) civic-tech PWA for citizens to report local issues. It features an interactive map, report submission with AI credibility checks, gamified leaderboards, and dedicated portals for municipal and administrative staff.

## Features

-   **Citizen Reporting:** Submit reports with photos/videos, which are automatically analyzed by Gemini for categorization, content generation, and policy checks.
-   **Interactive Map:** View all reports on a Leaflet map with performance-optimized marker clustering.
-   **Gamification:** Earn points and badges for community contributions.
-   **Municipality Portal:** A dedicated dashboard for municipal staff to manage, track, and resolve reports within their jurisdiction.
-   **Super Admin Portal:** A full-featured backend panel to manage users, reports, categories, and application settings.
-   **Offline First:** Full offline capability for report submission, with background sync when connectivity is restored.
-   **Bilingual & RTL Support:** Seamlessly switch between English (LTR) and Arabic (RTL).

## Development Setup

This project is intended to be set up with a modern JavaScript build tool like Vite. The current prototype uses an `importmap` for simplicity, but the following instructions outline the standard procedure for a production-ready setup.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    cd mshkltk-app
    ```

2.  Install the project dependencies (a `package.json` will need to be created if one doesn't exist):
    ```bash
    npm install
    ```

### Environment Variables

The application requires a Google Gemini API key for its AI-powered features.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following line to the file, replacing the placeholder with your actual key:
    ```
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
   *Note: In the current prototype, the API key is mocked in `index.html`. This should be replaced by the `.env` file method in a production setup.*

### Running Locally

To start the local development server (assuming Vite), run:

```bash
npm run dev
```

This will start the development server, typically available at `http://localhost:5173`.

## Important: Backend Simulation

This repository contains the **frontend-only** implementation of the Mshkltk application. The entire backend, including the database and API endpoints, is simulated client-side for demonstration purposes.

-   **Mock API:** The complete backend logic is simulated in `/services/mockApi.ts`. This file serves as an interactive specification for the required backend endpoints.
-   **Data Persistence:** All data is persisted locally in your browser's **IndexedDB**. To reset the application to its initial state, clear your browser's site data for the development URL.

A backend developer can use the `mockApi.ts` file and the comprehensive documentation in the `/docs` folder as a contract to build the production backend.

## Project Structure & Documentation

-   `/src`: Contains all the application source code.
-   `/docs`: This directory is the single source of truth for all project documentation. It includes:
    -   **[Data Model](./docs/data-model/README.md):** Detailed schemas for all database entities.
    -   **[API Endpoints](./docs/api/authentication.md):** A comprehensive guide to the required RESTful API.
    -   **[Frontend Architecture](./docs/frontend/README.md):** An overview of the client-side architecture.
    -   **[Testing Strategy](./docs/TESTING.md):** The roadmap for implementing automated tests.
    -   **[Directory Map](./mshkltk_directory_map.md):** A detailed file-by-file breakdown of the entire project.

For a detailed map of all files and their purpose, please refer to the documentation.