# Language Switcher Fix

## Problem
Tests were failing because they weren't clicking the **globe icon button** to switch from Arabic to English after landing on the login page.

## Root Cause
The `setLanguageToEnglish()` function was:
1. Looking for wrong selectors (text like "En" or "English" instead of the globe icon button)
2. Being called at the wrong time (on landing page before navigation to login)

## Solution Implemented

### 1. Updated `setLanguageToEnglish()` Function
**Location:** `tests/e2e/helpers.ts`

```typescript
// ✅ BEFORE (Wrong)
const langButton = page.locator('button:has-text("En"), button:has-text("English")');

// ✅ AFTER (Correct)
const langButton = page.locator('button[aria-label="Toggle language"]');
```

**New Logic:**
- Finds the globe icon button using `aria-label="Toggle language"`
- Checks if page is currently in Arabic by looking for Arabic text
- Only clicks the globe button if page is in Arabic
- Waits 1 second after clicking for language switch to complete

### 2. Fixed Call Order in `loginAsCitizen()`
**Before:**
```typescript
await page.goto('/');
await setLanguageToEnglish(page);  // ❌ Called on landing page
await page.click('button[aria-label="Enter Mshkltk"]');
await page.waitForURL('/login');
```

**After:**
```typescript
await page.goto('/');
await page.click('button[aria-label="Enter Mshkltk"]');
await page.waitForURL('/login');
await setLanguageToEnglish(page);  // ✅ Called AFTER navigating to login
```

### 3. Fixed Call Order in `registerUser()`
Same fix - moved `setLanguageToEnglish()` call to AFTER clicking logo and navigating to login page.

### 4. Updated Test 1.1 (Landing Page Test)
Added explicit language switch after navigation:
```typescript
await page.click('button[aria-label="Enter Mshkltk"]');
await page.waitForURL('/login');
await setLanguageToEnglish(page);  // ✅ Explicit language switch
```

## Why This Matters
1. **Language switcher is in the Header** - which only appears on login/app pages, not landing page
2. **Globe icon is the actual button** - not text-based
3. **Timing is critical** - must switch language before filling forms
4. **Default language is Arabic** - tests need English for reliable selectors

## Files Modified
- ✅ `tests/e2e/helpers.ts` - Updated `setLanguageToEnglish()`, `loginAsCitizen()`, `registerUser()`
- ✅ `tests/e2e/01-citizen-app.spec.ts` - Added import and explicit call in test 1.1

## Test Flow Now
```
1. goto('/') → Landing page (animated logo)
2. Click "Enter Mshkltk" button
3. waitForURL('/login') → Login page loads
4. Click globe icon → Switch to English  🌐
5. Fill username/password → Now in English!
6. Submit form
7. Handle tutorial
8. Success! ✅
```

## Verification
Run tests in headed mode to visually confirm:
```bash
npm run test:headed
```

You should see:
1. ✅ Browser opens to landing page
2. ✅ Clicks logo button
3. ✅ Navigates to login page
4. ✅ **Clicks globe icon** (you'll see UI switch to English)
5. ✅ Fills form with English placeholders
6. ✅ Test proceeds successfully
