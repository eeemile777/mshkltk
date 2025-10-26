# 🚨 CRITICAL ISSUES FOUND - Mock API Still in Use

## ❌ FILES STILL USING MOCK API

The following files are **STILL IMPORTING FROM `services/mockApi`** instead of `services/api`:

### 1. ✅ pages/ReportDetailsPage.tsx 
**STATUS: FIXED** - Changed to use `services/api`
- Fixed: `import * as api from '../services/api'`
- Fixed: Changed `api.fetchUserById()` to `api.getUserById()`

### 2. ❌ pages/TrendingPage.tsx
**STATUS: BROKEN** - Still imports mockApi
- Line 4: `import * as api from '../services/mockApi'`
- Uses: `api.fetchTrendingReports()` which **DOESN'T EXIST** in real API
- **NEEDS**: Backend endpoint for trending reports or use filtered getReports()

### 3. ❌ pages/LeaderboardPage.tsx  
**STATUS: BROKEN** - Still imports mockApi
- Line 4: `import * as api from '../services/mockApi'`
- Uses: `api.fetchLeaderboard()` which might exist as `getLeaderboard()`
- **ACTION**: Change import and verify method name

### 4. ❌ components/superadmin/SuperAdminReportCreator.tsx
**STATUS: BROKEN** - Still imports mockApi
- Line 4: `import * as api from '../../services/mockApi'`
- **ACTION**: Change to `'../../services/api'`

---

## 🔍 MISSING API ENDPOINTS

These functions are called in the frontend but **DON'T EXIST** in `services/api.ts`:

### Missing Functions:
1. **`fetchTrendingReports()`** - Used in TrendingPage.tsx
   - **Solution**: Either:
     - Add backend endpoint GET `/api/reports/trending`
     - OR use `getReports({ sort: 'confirmations', limit: 20 })`

2. **`fetchLeaderboard()`** - Used in LeaderboardPage.tsx (might exist as `getLeaderboard()`)
   - **Verify**: Check if `getLeaderboard()` exists and works

---

## 📋 SWAGGER UI - MISSING DOCUMENTATION

### Documented ✅:
- Auth (register, login)
- Some Reports endpoints
- AI endpoints

### NOT Documented ❌:
1. **Comments** - 0% documented
   - POST /api/comments
   - GET /api/comments/report/:reportId
   - PUT /api/comments/:id
   - DELETE /api/comments/:id

2. **Users** - 0% documented
   - GET /api/users/me
   - GET /api/users/:id
   - PUT /api/users/:id
   - GET /api/users/leaderboard
   - DELETE /api/users/:id

3. **Notifications** - 0% documented
   - GET /api/notifications
   - GET /api/notifications/unread-count
   - PATCH /api/notifications/:id/read
   - DELETE /api/notifications/:id

4. **Media** - 0% documented
   - POST /api/media/upload
   - POST /api/media/upload-multiple

5. **Reports** - Partially documented
   - GET /api/reports/:id - ❌ Not documented
   - PUT /api/reports/:id - ❌ Not documented
   - DELETE /api/reports/:id - ❌ Not documented
   - POST /api/reports/:id/confirm - ❌ Not documented
   - POST /api/reports/:id/subscribe - ❌ Not documented
   - GET /api/reports/stats - ❌ Not documented

---

## 🚫 SWAGGER UI - MISSING FILE UPLOAD SUPPORT

### Current Issues:
1. **Media endpoints only accept base64** - No file browser upload
   - POST /api/media/upload - Only JSON with base64
   - POST /api/media/upload-multiple - Only JSON array

2. **AI endpoints only accept base64** - No file upload
   - POST /api/ai/analyze-media - Only JSON
   - POST /api/ai/transcribe-audio - Only JSON

### What's Needed:
1. Install `multer` for file handling
2. Update media routes to accept `multipart/form-data`
3. Add Swagger annotations with `format: binary`
4. Support BOTH base64 (backward compat) AND file uploads
5. Add file type validation (images: jpg, png, webp; audio: wav, mp3)

---

## 📊 SWAGGER UI - MISSING SCHEMAS

### Schemas Currently Defined:
✅ User
✅ Report
✅ Comment
✅ Notification
✅ Error

### Missing Schemas:
❌ ReportHistory
❌ DynamicCategory
❌ DynamicBadge
❌ GamificationSettings
❌ AuditLog
❌ PaginatedResponse
❌ LeaderboardEntry
❌ MediaUploadResponse
❌ ReportStats

---

## 🎯 IMMEDIATE ACTION PLAN

### Priority 1: Fix Mock API Usage (CRITICAL)
1. ✅ ReportDetailsPage.tsx - FIXED
2. ❌ TrendingPage.tsx - Fix import + add trending endpoint
3. ❌ LeaderboardPage.tsx - Fix import + verify getLeaderboard
4. ❌ SuperAdminReportCreator.tsx - Fix import

### Priority 2: Add Missing Backend Endpoints
1. GET /api/reports/trending - For TrendingPage
2. Verify all endpoints match frontend calls

### Priority 3: Complete Swagger Documentation
1. Add all Comments endpoints (@swagger annotations)
2. Add all Users endpoints
3. Add all Notifications endpoints
4. Add all Media endpoints
5. Complete remaining Reports endpoints

### Priority 4: Add File Upload Support
1. Install multer
2. Update media routes for multipart/form-data
3. Update AI routes for file uploads
4. Add proper Swagger file upload schemas

### Priority 5: Add Missing Schemas
1. Add all missing data models to swagger.js
2. Add pagination response schema
3. Add proper response examples

---

## 🧪 TESTING CHECKLIST

- [ ] All pages load without errors
- [ ] No console errors about missing API methods
- [ ] Swagger UI shows all endpoints
- [ ] Can upload files via Swagger UI
- [ ] All endpoints have proper documentation
- [ ] All endpoints have example requests
- [ ] Authentication flow works in Swagger
- [ ] File uploads work for images
- [ ] File uploads work for audio
- [ ] File uploads work for video

---

## 📝 FILES TO CHECK

Run these searches to find any remaining mock usage:
```bash
grep -r "mockApi" pages/
grep -r "mockApi" components/
grep -r "mockData" services/
grep -r "from '../services/mockApi'" .
```

---

## 🔧 QUICK FIXES

### Fix TrendingPage.tsx:
```typescript
// Option 1: Use existing getReports with filters
const reports = await api.getReports({ 
  status: 'new',
  limit: 20,
  // Add sorting by confirmations_count
});

// Option 2: Add new backend endpoint
// GET /api/reports/trending
```

### Fix LeaderboardPage.tsx:
```typescript
// Change from:
import * as api from '../services/mockApi';
const users = await api.fetchLeaderboard();

// To:
import * as api from '../services/api';
const users = await api.getLeaderboard(50);
```

### Fix SuperAdminReportCreator.tsx:
```typescript
// Change from:
import * as api from '../../services/mockApi';

// To:
import * as api from '../../services/api';
```

---

## ✅ SUCCESS CRITERIA

The app will be fully functional when:

1. ✅ NO files import from `services/mockApi`
2. ✅ ALL API calls use `services/api`
3. ✅ ALL endpoints documented in Swagger
4. ✅ File uploads work via Swagger UI
5. ✅ ALL test cases pass
6. ✅ NO console errors
7. ✅ Backend handles ALL frontend requests

---

**CREATED:** $(date)
**STATUS:** IN PROGRESS
**PRIORITY:** CRITICAL 🔴
