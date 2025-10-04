# Mshkltk - Civic Reporting Web App

A bilingual civic-tech web application for citizens to report local issues. It features an interactive map, report submission with AI credibility checks, gamified leaderboards, and user profiles. The app is designed to be mobile-first and supports both Arabic (RTL) and English.

## Development Setup

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18.x or later recommended)
-   npm (or a compatible package manager)
-   A modern web browser (e.g., Chrome, Firefox)

### Installation

1.  Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    cd mshkltk-app
    ```

2.  Install the project dependencies using npm:
    ```bash
    npm install
    ```

### Environment Variables

The application requires a Google Gemini API key to power its AI features.

1.  In the root of the project, create a file named `.env`.
2.  Add your API key to this file in the following format:
    ```env
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    This file is listed in `.gitignore` to ensure your key is not committed to the repository.

### Running Locally

This project uses Vite for development. To start the local development server:

1.  Run the following command from the project's root directory:
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to the local address provided by Vite (usually `http://localhost:3000`).

### Project Structure Overview

-   `/` (root): `index.html`, `index.tsx`, `App.tsx`
-   `/components`: Reusable React components.
-   `/contexts`: Global state management using React Context.
-   `/pages`: Top-level components for each route/view.
-   `/services`: Mock API and client-side database logic.
-   `/hooks`: Custom React hooks.
-   `/docs`: All project documentation.
-   `/assets`: Static assets like the favicon.