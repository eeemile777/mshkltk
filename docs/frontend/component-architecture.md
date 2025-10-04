# Frontend: Component Architecture Deep Dive

This document provides a detailed look at some of the most complex and critical components in the Mshkltk application.

---

### 1. `InteractiveMap.tsx`

This is the most visually complex component, responsible for rendering all report data on a map.

-   **Library:** It is built on top of **Leaflet.js**, a lightweight and robust mapping library.
-   **Tile Layers:** It sources map tiles from CartoDB's "Voyager" (light) and "Dark Matter" (dark) themes. The theme is toggled by applying a CSS filter to the tile pane, a performant method that avoids re-fetching tiles.
-   **Marker Clustering:** To handle hundreds or thousands of report markers without performance degradation, it uses the **`leaflet.markercluster`** plugin.
-   **Custom Markers & Popups:**
    -   Markers are not standard images. They are custom `L.DivIcon`s, which are essentially HTML elements styled with CSS. The function `createCategoryIcon` in `utils/mapUtils.ts` dynamically generates the SVG-like teardrop markers with the correct category icon and color.
    -   When a marker is clicked, a Leaflet popup appears. The content of this popup is a React component (`MapPopup`) which is rendered into a DOM node and then passed to Leaflet's `setContent` method. This allows for rich, interactive popups that are part of the React ecosystem.
-   **State Integration:** The map is controlled by state from `AppContext`. The `flyToLocation` function in the context sets a `mapTargetLocation`, which an effect in `InteractiveMap.tsx` listens for to trigger a `map.flyTo()` animation.

---

### 2. `ReportFormPage.tsx` (The Report Wizard)

This component orchestrates the multi-step process of submitting a new report. It is one of the most stateful and logic-heavy parts of the application.

-   **State Management:** The entire wizard's state is managed in `AppContext` via `wizardData`, `wizardStep`, and related functions (`startWizard`, `updateWizardData`, `resetWizard`). This was a deliberate choice to:
    1.  Persist the form state if the user navigates away and comes back.
    2.  Allow other components (like a future "Save Draft" button) to interact with the wizard's state.
-   **Conditional Step Rendering:** The component renders different "step" components (`Step1_Type`, `Step2_Photo`, etc.) based on the `wizardStep` and `wizardData.withMedia` state.
-   **Gemini API Integration:** This component makes heavy use of the Gemini API for several key features:
    -   **Media Analysis (`runAiMediaAnalysis`):** When photos/videos are uploaded, they are sent to the `gemini-2.5-flash` model. A detailed prompt asks the model to perform two tasks:
        1.  **Policy Check:** Identify and flag media containing faces or license plates.
        2.  **Content Generation:** Automatically generate a title, description, category, and severity based on the visual content.
        The response is a JSON object, which is then used to pre-fill the form fields in `Step4_Details`.
    -   **Audio Transcription (`runAiTranscription`):** In `Step4_Details`, the user can record an audio note. This audio is sent to the `gemini-2.5-flash` model with a prompt that asks it to both transcribe the audio and generate a title/description from the transcription, again pre-filling the form.
