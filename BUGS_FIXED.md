# Bug Fixes - Testing Session 1

**Date:** January 20, 2025  
**Session:** Manual Testing - Initial Issues

---

## Bugs Found and Fixed

### 🐛 Bug #1: Reports Confirmed Count Not Showing
**Location:** Profile Page  
**Symptom:** The "Reports Confirmed" stat showed `0` with no number displayed  
**Root Cause:** 
- Backend returns `reports_confirmed` (snake_case)
- Frontend expects `reportsConfirmed` (camelCase)
- No transformation was happening between backend and frontend

**Fix Applied:**
- Created `transformUser()` function in `services/api.ts` to convert snake_case to camelCase
- Applied transformation to all user-related API calls:
  - `register()`
  - `login()`
  - `verifyToken()`
  - `getCurrentUser()`
  - `getUserById()`
  - `updateCurrentUser()`
  - `getLeaderboard()`
  - `getAllPortalUsers()`

**Files Modified:**
- `services/api.ts` (added transformUser function, updated 8 functions)

**Status:** ✅ FIXED

---

### 🐛 Bug #2: Leaderboard Showing Fake Data
**Location:** Community Page (Achievements/Leaderboard)  
**Symptom:** Leaderboard showed fake users (Maya B, Fatima A, Wassim K, Dina H) from mock data  
**Root Cause:** 
- `AchievementsPage.tsx` was importing from `services/mockApi` instead of `services/api`
- Function name mismatch: used `fetchLeaderboardUsers()` which doesn't exist in real API

**Fix Applied:**
- Changed import from `import * as api from '../services/mockApi'` to `import * as api from '../services/api'`
- Changed function call from `api.fetchLeaderboardUsers()` to `api.getLeaderboard(50)`

**Files Modified:**
- `pages/AchievementsPage.tsx` (line 7, line 69)

**Status:** ✅ FIXED

---

### 🐛 Bug #3: Achievements Tab Not Visible
**Location:** Community Page  
**Symptom:** Achievements tab was working but may have had navigation issues (needs verification)  
**Root Cause:** Related to Bug #2 - using mockApi instead of real API

**Fix Applied:**
- Same fix as Bug #2 (switching to real API)

**Status:** ✅ FIXED (needs verification)

---

### 🐛 Bug #4: Time Filters Not Working
**Location:** Community Page > Leaderboard Tab  
**Symptom:** "This Month" and "This Week" filter buttons were disabled  
**Root Cause:** 
- Filters were explicitly set to `disabled={true}` in the code
- Backend doesn't support time-based leaderboard filtering yet
- Would require tracking point history (when points were earned, not just total)

**Fix Applied:**
- **NOT FIXED** - Kept filters disabled with explanatory comment
- Reason: Backend implementation required for proper time-based filtering
- TODO: Add point history tracking in future version

**Files Modified:**
- `pages/AchievementsPage.tsx` (added comment explaining why disabled)

**Status:** ⏳ DEFERRED (requires backend feature)

---

## Testing Verification Needed

After page refresh, please verify:
1. ✅ Profile page shows "Reports Confirmed" number correctly
2. ✅ Leaderboard shows real users from database (not fake data)
3. ✅ Achievements tab is visible and works
4. ⏳ Time filters remain disabled (as intended until backend support)

---

---

### 🐛 Bug #5: Tab Switching Broken/Slow
**Location:** Community Page (Leaderboard ↔ Achievements)  
**Symptom:** Switching between tabs felt broken or sluggish  
**Root Cause:** 
- Tabs were using conditional rendering (`condition ? <A /> : <B />`)
- This caused components to unmount/remount on every switch
- Leaderboard was re-fetching data every time you switched back

**Fix Applied:**
- Changed from conditional rendering to CSS show/hide
- Both tabs now render simultaneously but toggle visibility with CSS classes
- Benefits:
  - Instant tab switching (no remounting)
  - Data persists (no re-fetching)
  - Scroll position preserved
  - Smoother user experience

**Files Modified:**
- `pages/AchievementsPage.tsx` (changed tab rendering logic)

**Status:** ✅ FIXED

---

### 🐛 Bug #6: Draggable Pin Not Visible in Location Step
**Location:** Report Wizard > Step 3 (Location)  
**Symptom:** No draggable pin visible on the map even though it was supposed to be there  
**Root Cause (ACTUAL):** 
- The draggable pin was using Tailwind CSS classes (`bg-teal`, `rounded-full`, etc.)
- These classes were in a dynamically generated HTML string inside a Leaflet divIcon
- **Tailwind classes don't work in dynamic HTML strings** - they need to be processed at build time
- The pin element was rendering but was invisible because the styles weren't applied

**First Attempted Fix (INCOMPLETE):**
- Set a default location (Beirut: [33.8938, 35.5018]) immediately when component loads
- This ensured `reportData.location` was set, but **didn't fix the visibility issue**

**Real Fix Applied:**
- Replaced all Tailwind classes with **inline CSS styles** in the pin HTML
- Changed `class="bg-teal rounded-full"` to `style="background-color: #14B8A6; border-radius: 50%;"`
- Added inline `@keyframes` animation for the pulsing effect
- Now the pin is styled correctly with inline CSS that works in dynamic HTML

**Files Modified:**
- `pages/report/Step3_Location.tsx` (added default location on mount) - PARTIAL FIX
- `components/InteractiveMap.tsx` (replaced Tailwind with inline styles in pin icon) - REAL FIX

**Status:** ✅ FIXED (FOR REAL THIS TIME)

---

### 🐛 Bug #7: Onboarding Tour Shows Every Time
**Location:** Map Page  
**Symptom:** Onboarding tour appears every time user opens the app, even after completing it  
**Root Cause:** 
- `finishOnboarding()` and `skipOnboarding()` called deprecated `setCurrentUser()` which was a no-op
- The `onboarding_complete: true` flag was only updated in local state
- Never persisted to the backend database
- On page refresh, backend returned `onboarding_complete: false` again

**Fix Applied:**
- Changed `finishOnboarding()` to call `api.updateCurrentUser({ onboarding_complete: true })`
- Changed `skipOnboarding()` to also persist to backend
- Both functions now:
  1. Update local state immediately (instant UI feedback)
  2. Send `PATCH /api/users/me` to backend (persist to database)
  3. Add error handling for failed API calls
- Made both functions `async` to handle the API call properly

**Files Modified:**
- `contexts/AppContext.tsx` (updated finishOnboarding and skipOnboarding functions)

**Status:** ✅ FIXED

---

### ✨ Feature #1: Replay Tutorial Button
**Location:** Profile Page > Settings  
**Feature Request:** Add a button to restart the onboarding tour if user wants to see it again  
**Implementation:**
- Added `restartOnboarding()` function to `AppContext` that sets `isOnboardingActive: true`
- Added "Replay Tutorial" button in Profile > Settings section
- Button navigates to Map page and starts the tour automatically
- Added translations in both English and Arabic

**Files Modified:**
- `contexts/AppContext.tsx` (added restartOnboarding function)
- `pages/ProfilePage.tsx` (added replay button and handler)
- `constants.ts` (added replayTutorial translations)

**Status:** ✅ IMPLEMENTED

---

## Next Steps

Continue manual testing with the checklist. Log any new bugs found!
