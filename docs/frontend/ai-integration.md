# Frontend: AI Integration with Google Gemini

The Mshkltk application leverages the Google Gemini API (`gemini-2.5-flash` model) to power several key features, enhancing user experience, data quality, and automation. This document provides a deep dive into each AI-powered feature, including the specific prompt engineering used.

**Note:** All API calls are made directly from the client-side for this prototype. In a production environment, these calls **must** be proxied through a secure backend to protect the API key.

---

## 1. AI Media Analysis (Report Wizard - Step 2)

-   **Trigger:** Automatically runs when a user adds, removes, or changes photos/videos in the report submission wizard.
-   **Purpose:**
    1.  **Policy Enforcement:** Automatically check for and flag media that violates safety policies (faces, license plates).
    2.  **Content Generation:** Analyze the visual content to automatically generate a title, description, category, sub-category, and severity level for the report.
-   **Model:** `gemini-2.5-flash`

### Prompt Engineering Deep Dive

The following is the exact prompt template sent to the Gemini API. This prompt is carefully constructed to force the model to perform a sequence of tasks and return a structured JSON response.

```plaintext
You are an AI assistant for a civic issue reporting app. Your task is to analyze media (images AND videos) to identify issues and check for policy violations. Your response MUST be a single, valid JSON object.

Follow these steps with ZERO DEVIATION:

1.  **Policy/Safety Analysis (Per Media Part):** For EACH media part provided, determine if it violates our safety policies. A violation occurs if the media clearly shows:
    -   A human face (especially selfies or close-ups).
    -   A readable vehicle license plate.
    -   Identifiable military or law enforcement personnel or vehicles.
    -   Content that is not related to a potential civic issue (e.g., a picture of a pet, a document).

2.  **Filtering Decision:** Create a list in `media_to_flag` containing the `index` and a brief `reason` (in ${langName}) for EVERY media part that violates the policies. If no violations are found, this list MUST be an empty array [].

3.  **Holistic Content Analysis:** Analyze ALL media parts together, even those flagged for removal, to understand the user's intent. The content might be a clear problem (pothole), a potential issue (a leaning tree), or informational (an empty lot).

4.  **Content Generation (Mandatory):** Based on your holistic analysis, you MUST generate the following details. ALWAYS provide a value for each field.
    -   **Categorization:** Select the MOST LIKELY parent `category` and child `sub_category` from this list: ${categoryList}. If no clear issue is present, use 'other_unknown' or an appropriate category (e.g., 'public_spaces' for a park).
    -   **Severity Assessment:** Assess the severity. The value for `severity` MUST be one of these exact lowercase strings: 'high', 'medium', 'low'.
    -   Generate a concise, descriptive `title` (max 10 words, in ${langName}).
    -   Generate a clear `description` (20-40 words, in ${langName}), written from the citizen's first-person perspective (e.g., "I noticed that...").

Your JSON output must strictly adhere to the schema. Your primary job is the policy check, but the content generation is equally critical for assisting the user.
```

-   `${langName}` is replaced with "English" or "Arabic".
-   `${categoryList}` is replaced with a JSON string of all available categories and sub-categories.

### Response Processing

The `responseSchema` in the API call ensures a valid JSON object is returned. The application parses this JSON:
-   The `media_to_flag` array is used to update the status of each `Preview` object in the UI, marking them as 'rejected' and displaying the reason.
-   The `title`, `description`, `category`, etc., are used to populate the form fields in the next step (`Step4_Details`) of the wizard.

---

## 2. AI Audio Transcription (Report Wizard - Step 4)

-   **Trigger:** User records their voice in the "Details" step of the wizard.
-   **Purpose:** Transcribe the user's spoken description of the issue and convert it into a structured title and description.
-   **Model:** `gemini-2.5-flash`

### Prompt Engineering Deep Dive

```plaintext
You are a helpful assistant. A citizen is reporting a civic issue via audio. Your task is to process their recording.
1.  First, transcribe the audio. The user might speak in ${langName} or a mix of languages.
2.  From the transcription, craft a 'title' (max 10 words) and a 'description' (20-50 words).
3.  CRITICAL: The tone must be a first-person narrative, as if you are the citizen reporting the issue. Use "I saw...", "There is a...", etc. Do NOT say "The user reported..." or describe it from a third-person perspective.
4.  The final output must be in ${langName}.
Your response MUST be a single, valid JSON object with "title" and "description" keys.
```
-   `${langName}` is replaced with "English" or "Arabic".

### Response Processing

The returned JSON object with `title` and `description` is used to populate the corresponding text fields in the UI, providing a hands-free way for users to describe the issue.

---

## 3. AI Municipality Detection (Report Wizard - Step 3)

-   **Trigger:** Runs automatically after the user's address is determined via reverse-geocoding from the map pin.
-   **Purpose:** To parse a human-readable address string and accurately identify the official Lebanese municipality. This is crucial for routing the report to the correct administrative body.
-   **Model:** `gemini-2.5-flash`

### Prompt Engineering Deep Dive

```plaintext
You are a Lebanese geography expert. Given the address: "${address}", identify the official municipality. Respond with ONLY the municipality name in lowercase English. Your response must be a single, valid JSON object with one key: "municipality".
```
-   `${address}` is replaced with the full address string from the reverse-geocoding service (e.g., "Gouraud Street, Gemmayze, Beirut, Lebanon").

### Response Processing

The simple JSON response `{"municipality": "beirut"}` is used to set the `municipality` field in the `wizardData`, which is then saved with the report. This automates a step that would otherwise require complex and often inaccurate GeoJSON lookups.