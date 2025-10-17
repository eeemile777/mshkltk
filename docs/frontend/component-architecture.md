# Frontend: Component Architecture

This document describes the architecture of key frontend components, focusing on their roles and interactions.

---

## 1. Core Application Structure (`App.tsx`)

The application is a Single Page Application (SPA) that is architecturally divided into three distinct user-facing areas, all managed within a single React codebase:

1.  **Citizen App:** The main public application, using a mobile-first layout (`Layout.tsx`, `Header.tsx`, `BottomNav.tsx`) and managed by `AppContext`.
2.  **Entity Portal:** A professional dashboard for municipalities, utilities, etc. It uses a desktop-first layout (`PortalLayout.tsx`, `PortalSidebar.tsx`) and is managed by a separate `PortalContext`.
3.  **Super Admin Portal:** A central control panel with its own layout (`SuperAdminLayout.tsx`, `SuperAdminSidebar.tsx`) and the all-powerful `SuperAdminContext`.

This separation is achieved through:
-   **URL-based Routing:** `react-router-dom` directs traffic based on the path (`/`, `/portal`, `/superadmin`).
-   **Scoped Context Providers:** Each of the three areas is wrapped in its own context provider in `App.tsx`, ensuring that state is properly isolated.
-   **Authentication Gates:** Each area has its own `AuthGate` component that verifies the user's role before granting access.

A notable feature of the Entity Portal is its **dynamic theming**. The primary accent color of the portal UI is set via a CSS variable (`--portal-theme-color`) which is determined by the logged-in user's role. For example, a water utility company might have a blue theme, while a standard municipality has the default teal theme.

---

## 2. Report Submission Wizard (`pages/ReportFormPage.tsx`)

This is the most complex user-facing component, acting as a state machine that orchestrates the multi-step report submission process.

-   **Orchestration:** It reads `wizardStep` from `AppContext` and renders the appropriate step component (`Step1_Type`, `Step2_Photo`, etc.).
-   **AI Integration:** It contains the primary logic for calling the Google Gemini API to perform media analysis and audio transcription, displaying loading states and AI feedback to the user.
-   **Conditional Logic:** The wizard's flow is dynamic.
    -   It first shows `Step1_Type` to check for nearby duplicates and determine if the user is reporting with or without media.
    -   If the AI analysis in `Step2_Photo` returns multiple distinct issues, it conditionally injects `Step3_Disambiguation` into the flow, allowing the user to select which problems to report.
    -   If the AI flags any media for policy violations (faces, license plates), the `AiRejectionNotice` component is displayed to the user.

---

## 3. In-Depth Component Logic

Several components employ advanced browser APIs and techniques to achieve a high-quality user experience.

### `ReportFormPage.tsx`: EXIF Orientation Correction

**Problem:** Photos taken on mobile phones contain EXIF metadata that specifies the camera's orientation (e.g., portrait, landscape). Browsers often ignore this tag when rendering an `<img>` element directly from a file, causing photos to appear rotated 90 degrees.

**Solution:** The application uses a two-step, client-side process to fix this before uploading the image for AI analysis.

1.  **Reading the Orientation Tag (`getOrientation` function):**
    -   When an image file is selected, a `FileReader` reads the first 64KB of the file as an `ArrayBuffer`. This is usually enough to contain the EXIF header.
    -   A `DataView` is used to parse this binary data, searching for the specific byte markers that identify a JPEG file and the subsequent EXIF data block.
    -   The code then parses the TIFF structure within the EXIF block to find the "Orientation" tag (hex code `0x0112`) and returns its value (a number from 1 to 8).

2.  **Correcting with Canvas (`getCorrectedImageFile` function):**
    -   An `Image` element is created in memory, and its `src` is set to an object URL of the original file.
    -   Once the image loads, a `<canvas>` element is created.
    -   Based on the orientation value read in step 1, the canvas context (`ctx`) is rotated and transformed. For example, for an orientation value of `6` (rotated 90° right), the canvas's width and height are swapped, and `ctx.transform(0, 1, -1, 0, height, 0)` is applied.
    -   `ctx.drawImage()` is called to draw the original image onto the transformed canvas.
    -   Finally, `canvas.toBlob()` is used to get a new, correctly oriented JPEG file from the canvas, which then replaces the original file in the application's state. This is all done asynchronously to avoid blocking the UI.

### `ShareModal.tsx`: Dynamic Share Image Generation

**Problem:** To create engaging social media shares, the app needs to generate a single, compelling image that combines the report's photo, title, and key details.

**Solution:** The `generateShareImage` function uses the HTML Canvas API to dynamically create this composite image on the client-side.

1.  **Font Loading:** The function first ensures the custom fonts (`Inter`, `Cairo`) are loaded using the `document.fonts.load()` API. This is crucial to prevent the canvas from rendering text with a default system font before the custom font is ready.
2.  **Image Background:** A canvas is created (1080x1080px). The primary report photo is drawn onto the canvas using `drawImage`, calculated to "cover" the entire area without distortion.
3.  **Gradient Overlay:** A semi-transparent black-to-clear linear gradient is drawn over the bottom half of the image. This darkens the area where text will be placed, ensuring readability regardless of the background photo's content.
4.  **Text Rendering:**
    -   `ctx.fillStyle` and `ctx.font` are set for each piece of text (logo, title, description, metadata).
    -   `ctx.fillText()` is used to draw each line of text at specific coordinates.
    -   A `wrapText` helper function is used to handle multi-line text for the title and description, breaking lines intelligently to fit within the canvas width.
5.  **Icon Rendering:** Since canvas cannot render JSX directly, SVG icons (like the category icon) are first rendered to an SVG string using `ReactDOMServer.renderToString`. This string is converted into a `data:image/svg+xml` URL, loaded into an in-memory `Image` element, and finally drawn onto the canvas with `drawImage`.
6.  **Export:** `canvas.toDataURL('image/png')` is called to get the final image as a base64 data URL, which can then be downloaded or shared.

### `InteractiveMap.tsx`: The Fan-Out Clustering Logic

**Problem:** Standard map marker clusters show only a number, hiding the types of reports within the cluster. This makes it hard to see the composition of issues in a dense area at a glance.

**Solution:** The `leaflet.markercluster` plugin is configured with a custom `iconCreateFunction` to create "fan-out" clusters.

1.  **`iconCreateFunction`:** This function is called by the plugin whenever a cluster needs to be rendered. It receives the `cluster` object as an argument.
2.  **Get Child Markers:** `cluster.getAllChildMarkers()` retrieves all the individual report markers that are grouped within this cluster.
3.  **Slice and Fan:** The code slices the first `MAX_FAN_PINS` (e.g., 3) markers. It then calculates an angle for each of these markers to "fan" them out from a central point, applying a `transform: rotate(...)` CSS style to each one. The markers are layered using `z-index` so they overlap cleanly.
4.  **Render Pin HTML:** For each of the fanned-out markers, it retrieves the report's category, color, and icon. It then generates the HTML for the custom tear-drop pin, injecting the category color and an SVG version of the icon.
5.  **Overflow Badge:** If there are more markers in the cluster than can be fanned out, it calculates the overflow count and generates the HTML for a small red badge (e.g., "+5").
6.  **Create `L.DivIcon`:** The final HTML, containing the fanned pins and the optional overflow badge, is passed to a new `L.DivIcon`. This HTML-based icon is what Leaflet renders on the map for the cluster. This process is repeated for every cluster on every zoom level change.