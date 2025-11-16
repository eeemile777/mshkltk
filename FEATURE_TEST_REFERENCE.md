# 🎯 Feature Testing Quick Reference

**Print this or keep it in another window while testing**

---

## Status Symbols

| Symbol | Meaning | What to Do |
|--------|---------|-----------|
| ✅ | Working perfectly | Leave as-is |
| 🟡 | Testing/Unknown | Verify it works, then change to ✅ |
| 🟠 | Broken/Bug | Document the bug, I'll fix it |
| 🔴 | Not Started | Not implemented yet |
| 🔵 | Unknown | Haven't tested yet |

---

## Table Columns

```
| # | Feature | Portal(s) | Status | Last Tested | Issues | Notes |
```

- **#** = Row number (don't change)
- **Feature** = What to test (don't change)
- **Portal(s)** = Where it exists (don't change)
- **Status** = ✅ 🟡 🟠 🔴 🔵 (YOU UPDATE THIS)
- **Last Tested** = Date or "N/A" (YOU UPDATE THIS)
- **Issues** = What's broken, or "None" (YOU UPDATE THIS)
- **Notes** = Extra details (YOU UPDATE THIS)

---

## Quick Update Template

**When you find a bug:**
```
| Feature | Status | Last Tested | Issues | Notes |
| --- | --- | --- | --- | --- |
| Before: Report Upload | ✅ | - | None | Works |
| After: Report Upload | 🟠 | Nov 15 | 500 error | API timing out, works after refresh |
```

---

## Feature Testing Checklist

### CITIZEN PORTAL
- [ ] Row 1: Register new account
- [ ] Row 2: Login
- [ ] Row 3: Forgot password (if exists)
- [ ] Row 4: Edit profile
- [ ] Rows 5-8: Create full report
- [ ] Row 9: AI analysis works
- [ ] Row 10: Confirm report
- [ ] Row 11: View my reports
- [ ] Row 12: See report details
- [ ] Row 13: Add comment
- [ ] Row 14: Check notifications
- [ ] Row 15: Notification badge
- [ ] Row 16: Leaderboard
- [ ] Row 17: Badges earned
- [ ] Row 18: Dark mode toggle
- [ ] Row 19: Language switch (EN/AR)
- [ ] Row 20: Offline submit (turn off wifi, submit, turn on)
- [ ] Row 21: View map
- [ ] Row 22: Search reports

### MUNICIPALITY PORTAL
- [ ] Row 23: Portal login
- [ ] Row 24: Dashboard loads
- [ ] Row 25: See assigned reports
- [ ] Row 26: Assign report
- [ ] Row 27: Change status
- [ ] Row 28: Upload proof
- [ ] Row 29: Comment on report
- [ ] Row 30: View history (TBD - endpoint missing)
- [ ] Row 31: Use filters
- [ ] Row 32: Export (if exists)

### SUPER ADMIN PORTAL
- [ ] Row 33: Admin login
- [ ] Row 34: List users
- [ ] Row 35: Create user
- [ ] Row 36: Edit user (TBD)
- [ ] Row 37: Delete user
- [ ] Row 38: Impersonate user
- [ ] Row 39: Manage all reports
- [ ] Row 40: View audit logs (TBD - endpoint missing)
- [ ] Row 41: Edit categories
- [ ] Row 42: Edit badges
- [ ] Row 43: Adjust points
- [ ] Row 44: See statistics

### TESTING EVERYTHING
- [ ] Row 80: Run tests: `npm test`
- [ ] Row 81: Citizen E2E test passes
- [ ] Row 82: Database seeds load

---

## How to Mark Your Test Results

**Open this file on your phone/tablet next to your computer:**

1. **Before testing:**
   - Take a screenshot of current DEVELOPMENT.md table
   
2. **While testing each feature:**
   - On phone: Check off the checkbox above
   - On computer: Test the feature
   
3. **When you find an issue:**
   - Phone: Write down the row #, feature name, what broke
   - Computer: Update DEVELOPMENT.md immediately
   - Example: "Row 8: Report Upload gives 500 error"

4. **After testing session:**
   - Send me the updated table
   - I'll review and fix bugs

---

## Common Issues to Check

As you test, look for:

- ❌ Button doesn't respond
- ❌ Page doesn't load
- ❌ Error message in console (F12)
- ❌ Feature doesn't appear
- ❌ Data doesn't save
- ❌ Doesn't work on mobile
- ❌ Doesn't work in dark mode
- ❌ Doesn't work in Arabic
- ❌ Slow to load
- ❌ Multiple clicks needed for one action

---

## Test Environment

**Start the app:**
```bash
npm run dev
```

**URLs to test:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:3001/api-docs
- Database: Docker container `mshkltk-postgres`

**Test Users (from seed data):**

**Citizen:**
- Email: `citizen@example.com`
- Password: `password123`

**Portal:**
- Email: `portal@example.com`
- Password: `password123`

**Super Admin:**
- Email: `admin@example.com`
- Password: `password123`

---

## When You're Done Testing

1. Open DEVELOPMENT.md
2. Update all the rows you tested
3. Change ✅ to ✅ (keep working)
4. Change 🟡 to ✅ or 🟠 (based on if it works)
5. Change 🟠 to 🟠 (document the bug)
6. Add dates to "Last Tested" column
7. Add details to "Issues" and "Notes" columns
8. Send me the updated table

**Example:**
```
Row 1: Changed from "✅ | - | None" to "✅ | Nov 15 | None"
Row 8: Changed from "✅ | - | None" to "🟠 | Nov 15 | 500 error on >5MB"
Row 9: Changed from "🟡 | - | Gemini model test pending" to "✅ | Nov 15 | Works perfectly"
```

---

## Pro Tips

✅ **Test on Mobile:** Squeeze your browser window narrow, test on phone  
✅ **Test Offline:** Turn off WiFi, try features, turn back on  
✅ **Test Both Languages:** Switch to Arabic, test everything again  
✅ **Test Dark Mode:** Toggle dark mode on/off  
✅ **Check Console:** F12 → Console → look for red errors  
✅ **Test Edge Cases:** Empty fields, very long text, special characters  

---

**Ready to start? Open http://localhost:3000 and start testing!** 🚀
