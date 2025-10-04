# Mshkltk Style Guide & Design System

This document outlines the core visual identity and design principles of the Mshkltk application to ensure a consistent and high-quality user experience.

---

## 1. Color Palette

The color palette is defined in `tailwind.config` and is central to the application's look and feel.

### Primary Colors
-   **Teal (`#00BFA6`):** The main brand color. Used for primary actions, navigation highlights, and positive affirmations.
-   **Mango (`#FFA62B`):** A secondary accent color. Used for gamification elements (points, badges), trending items, and attention-grabbing UI.
-   **Navy (`#0D3B66`):** The primary text and heading color in light mode. Provides strong, professional contrast.
-   **Coral (`#FF5A5F`):** Used for destructive actions (delete), high-severity warnings, and error states.

### Neutral Palette (Light Mode)
-   **Sand (`#F4EDEA`):** The main background color, giving a warm, soft feel.
-   **Card (`#FFFFFF`):** The background for all cards, modals, and primary content surfaces.
-   **Muted (`#F8F6F4`):** A slightly off-white used for hover states or contained sections within cards.
-   **Text Primary (`#102027`):** A very dark blue-gray for body text. Softer than pure black.
-   **Text Secondary (`#4B5B67`):** A lighter gray for subtitles, metadata, and placeholder text.

### Dark Mode Palette
-   **BG Dark (`#121212`):** The primary background, a true black for OLED screens.
-   **Surface Dark (`#1E2A38`):** A dark, cool blue used for cards and modals to lift them off the background.
-   **Text Primary Dark (`#E7EDF3`):** An off-white for primary text.
-   **Text Secondary Dark (`#B0B8C1`):** A light gray for secondary text.
-   *Note: Primary accent colors (Teal, Mango, Coral) have slightly brighter `-dark` variants to maintain vibrancy on the dark background.*

---

## 2. Typography

Fonts are loaded from Google Fonts in `index.html`.

-   **Primary (Latin): `Inter`**
    -   Used for all English UI text, headings, and body copy.
    -   Weights: 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black for display headings).
-   **Secondary (Arabic): `Cairo`**
    -   Used for all Arabic UI text. Chosen for its excellent readability on screens.
    -   Weights: 400 (Regular), 700 (Bold).

---

## 3. Core UI Components

### `StatusPill`
-   **Purpose:** To clearly and consistently display the status of a report (`New`, `In Progress`, etc.).
-   **Design:** A rounded pill with a light background color and darker text, using the palette defined in `constants.ts` (`STATUS_COLORS`). This provides a consistent visual language for report states across the app.

### Buttons
-   **Primary Action (FAB, Submit):** Solid `teal` background with white text. Large, rounded, and often includes a shadow to denote primary importance.
-   **Secondary Action (Confirm, Follow):** Can vary. Often uses `mango` for gamified actions or a muted background (`bg-muted`) for less critical actions like "Share".
-   **Destructive Action:** Uses the `coral` color.

### Cards
-   **Standard:** `bg-card` / `bg-surface-dark` with a `rounded-2xl` border radius and a subtle `shadow-md`. This is the standard container for most content.
-   **Interactivity:** Cards often have a `hover:shadow-lg` and `transition` effect to provide visual feedback on interactive elements.
