# Frontend: Offline Support & Background Sync

The Mshkltk application is designed to be resilient to network interruptions, allowing users to create reports even when offline. This is achieved through a combination of a Service Worker and IndexedDB.

## Core Components

1.  **Service Worker (`sw.js`):**
    -   **Caching:** On installation, the service worker caches the main application shell (`index.html` and key assets). It uses a network-first strategy for other requests, falling back to the cache if the network is unavailable.
    -   **Background Sync:** It listens for the `sync` event. The frontend registers a sync event with the tag `sync-new-reports` when an offline report is created.

2.  **IndexedDB for Pending Reports:**
    -   A dedicated IndexedDB object store named `pending-reports` is managed directly within `AppContext.tsx`.
    -   When `submitReport` is called and the browser is offline (`navigator.onLine` is `false`), the report data is not sent to the API. Instead, it's saved as a `PendingReportData` object in this store.
    -   The report is also added to the local React state with an `isPending: true` flag, so the user sees their report immediately in the UI.

## The Offline Submission Flow

1.  **User is Offline:** The user fills out the report form and clicks "Submit".
2.  **`submitReport` in `AppContext.tsx`:**
    -   The function checks `navigator.onLine`. It's `false`.
    -   The report payload is wrapped in a `PendingReportData` object, which includes a unique `timestamp` to serve as its key.
    -   This object is saved to the `pending-reports` IndexedDB store using the `addPendingReport` helper.
    -   The function then registers a background sync task: `sw.sync.register('sync-new-reports')`. This tells the browser to fire a `sync` event in the service worker as soon as the network is available, even if the user has closed the tab.
3.  **User Comes Online:** The browser detects a stable network connection.
4.  **Service Worker `sync` Event:**
    -   The `sync` event with the tag `sync-new-reports` is fired in `sw.js`.
    -   The service worker's `sync` listener sends a `postMessage({ type: 'PERFORM_SYNC' })` to all active client windows/tabs of the application.
5.  **`AppContext.tsx` Receives Message:**
    -   A `message` event listener in `AppContext` receives the `PERFORM_SYNC` message.
    -   The handler calls `getPendingReports()` to retrieve all queued reports from IndexedDB.
    -   It then iterates through each pending report, calling the real `api.submitReport()` function for each one.
    -   Upon successful API submission, `deletePendingReport()` is called to remove the report from the IndexedDB queue.
    -   The React state is updated to replace the temporary pending report with the final, synced report from the API response.
