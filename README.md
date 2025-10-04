# Mshkltk - Civic Reporting Web App

A bilingual civic-tech web application for citizens to report local issues. It features an interactive map, report submission with AI credibility checks, gamified leaderboards, and user profiles. The app is designed to be mobile-first and supports both Arabic (RTL) and English.

## Development Setup

Follow these instructions to get the project running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18.x or later recommended)
-   A modern web browser (e.g., Chrome, Firefox)

### Installation

1.  Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    cd mshkltk-app
    ```

2.  This project uses ES modules and imports dependencies via an `importmap` in `index.html`. There is **no `npm install` step** required for packages like React, as they are loaded directly from a CDN (esm.sh).

### Running Locally

Since this is a static project without a build step, you can serve it using any simple local web server. A common tool is `http-server`.

1.  If you don't have `http-server`, install it globally:
    ```bash
    npm install -g http-server
    ```

2.  Start the server from the project's root directory:
    ```bash
    http-server .
    ```

3.  Open your browser and navigate to the local address provided by the server (usually `http://127.0.0.1:8080`).

### Environment Variables

The application requires a Google Gemini API key. For local development, this is mocked directly in `index.html`:

```html
<script>
  // This safely mocks the environment variable for local development
  window.process = {
    env: {
      API_KEY: 'YOUR_DEVELOPMENT_API_KEY' // Replace with a valid key for testing
    }
  };
</script>
```

In a production environment, this script block should be removed, and the `API_KEY` should be provided through the deployment environment's standard mechanism for handling environment variables. The application code reads it from `process.env.API_KEY`.

### Project Structure Overview

-   `/` (root): `index.html`, `index.tsx`, `App.tsx`
-   `/components`: Reusable React components.
-   `/contexts`: Global state management using React Context.
-   `/pages`: Top-level components for each route/view.
-   `/services`: Mock API and client-side database logic.
-   `/hooks`: Custom React hooks.
-   `/docs`: All project documentation.
-   `/assets`: Static assets like the favicon.
