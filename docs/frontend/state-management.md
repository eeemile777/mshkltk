# Frontend: State Management Philosophy

The Mshkltk application uses React's built-in **Context API** as its primary global state management solution. This approach was chosen for its simplicity, lack of external dependencies, and direct integration with React's component model.

The core of this system is the `AppContext` located in `src/contexts/AppContext.tsx`.

## Core Concepts

1.  **Single Source of Truth:** `AppContext` serves as the single, centralized store for all global data. This includes:
    *   The current user's session and profile data (`currentUser`).
    *   Application-wide data collections like `reports` and `notifications`.
    *   UI state such as `language`, `theme`, and map filters.
    *   Transient state for UI flows, like the `wizardData` for the report submission form.

2.  **Provider-Consumer Model:** The `AppProvider` component wraps the entire application, making the context value available to any component in the tree. Components that need to access or modify global state use the `React.useContext(AppContext)` hook.

3.  **Actions and Reducers (Implicit):** State modifications are handled by functions exposed by the context provider (e.g., `login`, `submitReport`, `toggleTheme`). These functions encapsulate the logic for:
    *   Calling the API (currently the mock API).
    *   Updating the state using `React.useState` setters.
    *   Handling side effects, such as writing to `localStorage` or `IndexedDB`.
    This pattern is similar to the dispatching of actions in a Redux-like architecture but is implemented with plain functions and `useState`.

## Data Flow

The typical data flow for an action is as follows:

1.  **User Interaction:** A user clicks a button in a component (e.g., the "Confirm" button on a report).
2.  **Context Function Call:** The component's event handler calls a function from the context, like `confirmReport(reportId)`.
3.  **API Request:** The `confirmReport` function in `AppContext` makes an asynchronous call to the backend API (`api.confirmReport`).
4.  **State Update:** Upon a successful API response, the function updates the relevant state. For example, it finds the report in the `reports` array and updates its `confirmations_count`. It then calls `setReports` with the new array, triggering a re-render.
5.  **Component Re-render:** Any component that consumes the `reports` state from the context will re-render to display the updated confirmation count.

## Future Scalability

While `AppContext` is sufficient for the current scale of the application, it can become unwieldy as more state and logic are added. Future improvements could include:

-   **Splitting Contexts:** Creating separate, more focused contexts (e.g., `AuthContext`, `MapFilterContext`) to reduce the size of `AppContext` and limit unnecessary re-renders.
-   **Using `useReducer`:** For more complex state transitions (like the report wizard), `React.useReducer` could be adopted within the provider to centralize and simplify state update logic, making it more predictable and easier to test.
