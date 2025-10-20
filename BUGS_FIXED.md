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
**Symptom:** No draggable pin visible on the map, users can't select a location  
**Root Cause:** 
- The draggable pin only renders when `reportData.location` exists
- Initially `reportData.location` is `null`
- Geolocation request takes time to complete
- During this time, no pin was visible

**Fix Applied:**
- Set a default location (Beirut: [33.8938, 35.5018]) immediately when component loads
- Then request user's actual location via geolocation
- Pin appears instantly, then smoothly updates to user's real location
- Benefits:
  - Instant pin visibility
  - User can immediately start dragging
  - Better UX than waiting for geolocation

**Files Modified:**
- `pages/report/Step3_Location.tsx` (added default location on mount)

**Status:** ✅ FIXED

---

## Next Steps

Continue manual testing with the checklist. Log any new bugs found!
