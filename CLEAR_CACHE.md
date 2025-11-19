# Clear Browser Cache for Mshkltk

## The Problem
You're seeing a blank page on first load because your browser cached an old version of the app that included `leaflet.heat` (which has been removed). After a hard refresh (Cmd+Shift+R), it works because the browser fetches fresh code.

## Solutions (Try in order)

### Solution 1: Hard Refresh (Quickest)
1. Open `http://localhost:3000`
2. Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows/Linux)
3. The app should load correctly now

### Solution 2: Clear Service Worker & Cache (Recommended)
1. Open `http://localhost:3000`
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab
4. In the left sidebar:
   - Click **Service Workers** → Click "Unregister" for localhost:3000
   - Click **Storage** → Click "Clear site data" button
5. Close DevTools
6. Refresh the page (Cmd+R or F5)

### Solution 3: Run in Console (Most Thorough)
1. Open `http://localhost:3000`
2. Open DevTools Console (F12 → Console tab)
3. Copy and paste this code:

```javascript
// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
  console.log('✅ Unregistered all service workers');
});

// Clear all caches
caches.keys().then(keys => {
  Promise.all(keys.map(key => caches.delete(key)))
    .then(() => console.log('✅ Cleared all caches'));
});

// Clear localStorage (optional - will log you out)
// localStorage.clear();

console.log('🔄 Please refresh the page now (Cmd+R)');
```

4. Press Enter
5. Wait for "✅" messages
6. Refresh the page (Cmd+R or F5)

### Solution 4: Incognito/Private Window
1. Open a new Incognito/Private browser window
2. Navigate to `http://localhost:3000`
3. The app should work without cache issues

## What Was Fixed

1. **Service Worker Cache Version Updated**: Changed from `v3` to `v4` to force cache invalidation
2. **Error Boundaries Added**: If the map crashes, you'll see a helpful error message instead of a blank page
3. **Heatmap Removed**: The problematic `leaflet.heat` code was already commented out, but old cached code was still running

## Verification

After clearing cache, you should see:
- ✅ Map loads on first visit (no blank page)
- ✅ No console error about "IndexSizeError: The source height is 0"
- ✅ Service worker console log: `Service Worker registered with scope: http://localhost:3000/`

## If It Still Doesn't Work

1. Stop the dev server (Ctrl+C in terminal)
2. Run: `rm -rf node_modules/.vite dist`
3. Run: `npm run dev`
4. Clear browser cache again (Solution 2 or 3)
5. Hard refresh (Cmd+Shift+R)
