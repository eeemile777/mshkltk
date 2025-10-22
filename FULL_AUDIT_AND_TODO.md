# 📋 Mshkltk Full Audit & TODO List

## 🎯 EXECUTIVE SUMMARY

**Current Status:** ⚠️ **PARTIALLY FUNCTIONAL**

### What's Working ✅
- Backend server running on port 3001
- Swagger UI accessible at http://localhost:3001/api-docs
- Auth endpoints (register, login) fully documented
- Some Reports endpoints documented
- AI endpoints fully documented
- Database connected and working

### What's Broken ❌
- **4 frontend files still use mockApi** instead of real API
- **Missing API endpoints** (trending reports)
- **70% of Swagger documentation missing**
- **No file upload support** in Swagger UI (only base64)
- **Missing data schemas** in Swagger

---

## 🚨 CRITICAL ISSUES (Must Fix First)

### Issue #1: Mock API Still in Use
**Files affected:**
1. ✅ `pages/ReportDetailsPage.tsx` - FIXED
2. ❌ `pages/TrendingPage.tsx` - BROKEN
3. ❌ `pages/LeaderboardPage.tsx` - BROKEN  
4. ❌ `components/superadmin/SuperAdminReportCreator.tsx` - BROKEN

**Impact:** These pages won't work with the real backend

**Solution:** See `MOCK_API_AUDIT.md` for detailed fixes

### Issue #2: Missing File Upload in Swagger
**Problem:** Cannot upload images/audio/video via Swagger UI

**Currently:** Only accepts base64 strings in JSON

**Needed:**
- Install multer package
- Support multipart/form-data
- Add file browse button in Swagger UI
- Handle images (.jpg, .png, .webp)
- Handle audio (.wav, .mp3, .webm)
- Handle video (.mp4, .webm)

### Issue #3: Incomplete API Documentation
**Documented:** 30%
**Missing:** 70%

Missing documentation for:
- All Comments endpoints (5 endpoints)
- All Users endpoints (6 endpoints)
- All Notifications endpoints (6 endpoints)
- Media endpoints (2 endpoints)
- Most Reports endpoints (8 of 13 not documented)

---

## 📊 SWAGGER UI STATUS

### Currently in Swagger UI ✅
| Section | Documented | Total | % |
|---------|------------|-------|---|
| Auth | 2 | 2 | 100% |
| AI | 4 | 4 | 100% |
| Reports | 3 | 13 | 23% |
| Comments | 0 | 5 | 0% |
| Users | 0 | 6 | 0% |
| Notifications | 0 | 6 | 0% |
| Media | 0 | 2 | 0% |
| **TOTAL** | **9** | **38** | **24%** |

### Schemas in swagger.js ✅
- ✅ User
- ✅ Report
- ✅ Comment
- ✅ Notification
- ✅ Error

### Missing Schemas ❌
- ❌ ReportHistory
- ❌ DynamicCategory
- ❌ DynamicBadge
- ❌ GamificationSettings
- ❌ AuditLog
- ❌ PaginatedResponse
- ❌ LeaderboardEntry
- ❌ MediaUploadResponse
- ❌ ReportStats

---

## 🔧 DETAILED TODO LIST

### Priority 1: Fix Mock API Usage (Day 1)

#### Task 1.1: Fix TrendingPage.tsx
```typescript
// Current (BROKEN):
import * as api from '../services/mockApi';
const reports = await api.fetchTrendingReports();

// Fix Option A: Use existing endpoint with filters
import * as api from '../services/api';
const reports = await api.getReports({ 
  status: 'new',
  limit: 20 
});

// Fix Option B: Add backend trending endpoint
// Add to server/routes/reports.js:
router.get('/trending', async (req, res) => {
  // Return reports sorted by confirmations_count
});
```

#### Task 1.2: Fix LeaderboardPage.tsx
```typescript
// Current (BROKEN):
import * as api from '../services/mockApi';
const users = await api.fetchLeaderboard();

// Fix:
import * as api from '../services/api';
const users = await api.getLeaderboard(50);
```

#### Task 1.3: Fix SuperAdminReportCreator.tsx
```typescript
// Current (BROKEN):
import * as api from '../../services/mockApi';

// Fix:
import * as api from '../../services/api';
```

### Priority 2: Add File Upload Support (Day 2)

#### Task 2.1: Install Multer
```bash
cd server
npm install multer @types/multer --save
```

#### Task 2.2: Update Media Routes
Create `server/middleware/upload.js`:
```javascript
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryBuffer(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = upload;
```

Update `server/routes/media.js`:
```javascript
const upload = require('../middleware/upload');

// Support BOTH file upload AND base64
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  // Check if file or base64
  if (req.file) {
    // Handle file upload
    const buffer = req.file.buffer;
    const url = await uploadToCloudStorage(buffer);
    res.json({ url });
  } else if (req.body.base64Data) {
    // Handle base64 (backward compatibility)
    const url = await uploadBase64Image(req.body.base64Data);
    res.json({ url });
  } else {
    res.status(400).json({ error: 'No file or base64Data provided' });
  }
});
```

#### Task 2.3: Update Swagger for File Upload
```javascript
/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Upload media file
 *     tags: [Media]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image, video, or audio file
 */
```

### Priority 3: Complete Swagger Documentation (Day 3-4)

Use templates from `server/SWAGGER_TEMPLATES.md`

#### Task 3.1: Document Comments API
Add to `server/routes/comments.js`:
- POST /api/comments
- GET /api/comments/report/:reportId
- GET /api/comments/:id
- PUT /api/comments/:id
- DELETE /api/comments/:id

#### Task 3.2: Document Users API
Add to `server/routes/users.js`:
- GET /api/users/me
- GET /api/users/:id
- PUT /api/users/:id
- GET /api/users/leaderboard
- DELETE /api/users/:id
- GET /api/users/portal-users

#### Task 3.3: Document Notifications API
Add to `server/routes/notifications.js`:
- GET /api/notifications
- GET /api/notifications/unread-count
- PATCH /api/notifications/:id/read
- PATCH /api/notifications/read-all
- DELETE /api/notifications/:id
- DELETE /api/notifications/all

#### Task 3.4: Document Media API
Add to `server/routes/media.js`:
- POST /api/media/upload
- POST /api/media/upload-multiple

#### Task 3.5: Complete Reports API Documentation
Add to `server/routes/reports.js`:
- GET /api/reports/:id
- PUT /api/reports/:id
- DELETE /api/reports/:id
- POST /api/reports/:id/confirm
- POST /api/reports/:id/subscribe
- DELETE /api/reports/:id/subscribe
- GET /api/reports/stats
- GET /api/reports/municipality/:municipality

### Priority 4: Add Missing Schemas (Day 5)

Add to `server/swagger.js` in `components.schemas`:

```javascript
PaginatedResponse: {
  type: 'object',
  properties: {
    data: { type: 'array', items: {} },
    pagination: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' }
      }
    }
  }
},

ReportHistory: {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    report_id: { type: 'string', format: 'uuid' },
    changed_by: { type: 'string', format: 'uuid' },
    old_status: { type: 'string' },
    new_status: { type: 'string' },
    notes: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' }
  }
},

// Add all other missing schemas...
```

### Priority 5: Testing (Day 6)

#### Task 5.1: Test All Endpoints in Swagger UI
Create checklist:
- [ ] Register new user
- [ ] Login and get token
- [ ] Authorize in Swagger
- [ ] Create report
- [ ] Upload image via file browser
- [ ] Upload audio file
- [ ] Get all reports
- [ ] Get nearby reports
- [ ] Add comment
- [ ] Get notifications
- [ ] Mark notification as read
- [ ] Update user profile
- [ ] Test all error responses

#### Task 5.2: Test Frontend Pages
- [ ] All pages load without errors
- [ ] No console errors
- [ ] TrendingPage shows reports
- [ ] LeaderboardPage shows rankings
- [ ] ReportDetailsPage shows full details
- [ ] SuperAdmin can create reports
- [ ] File uploads work from frontend

---

## 📁 KEY FILES

### Documentation Files Created
1. `server/SWAGGER_IMPLEMENTATION.md` - Overview of what was implemented
2. `server/QUICKSTART_SWAGGER.md` - Quick start guide
3. `server/SWAGGER.md` - Comprehensive documentation
4. `server/SWAGGER_TEMPLATES.md` - Templates for adding docs
5. `MOCK_API_AUDIT.md` - Audit of mock API usage

### Configuration Files
1. `server/swagger.js` - Main Swagger configuration
2. `server/index.js` - Server with Swagger UI middleware
3. `server/routes/*.js` - API route files with @swagger annotations

### Frontend Files to Fix
1. `pages/TrendingPage.tsx` - Change mockApi to api
2. `pages/LeaderboardPage.tsx` - Change mockApi to api
3. `components/superadmin/SuperAdminReportCreator.tsx` - Change mockApi to api

---

## ✅ SUCCESS CRITERIA

You'll know the app is fully functional when:

### Frontend
- [ ] NO files import from `services/mockApi`
- [ ] ALL pages load without errors
- [ ] NO console errors about missing API methods
- [ ] File uploads work for images/audio/video

### Swagger UI
- [ ] ALL 38 endpoints documented
- [ ] Can browse and upload files
- [ ] All schemas defined
- [ ] All endpoints have examples
- [ ] Authentication works
- [ ] All test cases pass

### Testing
- [ ] Can register user via Swagger
- [ ] Can login and get token
- [ ] Can upload files via Swagger UI
- [ ] All CRUD operations work
- [ ] Error responses are correct
- [ ] Pagination works

---

## 🚀 QUICK START

### 1. Start Server
```bash
cd server
node index.js
```

### 2. Access Swagger UI
Open: http://localhost:3001/api-docs

### 3. Fix Critical Issues
```bash
# Fix the 3 remaining mockApi imports
# See MOCK_API_AUDIT.md for exact changes needed
```

### 4. Add File Upload
```bash
cd server
npm install multer
# Update routes/media.js with multer middleware
```

### 5. Complete Documentation
```bash
# Use templates from SWAGGER_TEMPLATES.md
# Add @swagger annotations to all routes
```

---

## 📞 SUPPORT

For detailed information:
- Mock API issues → `MOCK_API_AUDIT.md`
- Swagger usage → `server/QUICKSTART_SWAGGER.md`
- Adding docs → `server/SWAGGER_TEMPLATES.md`
- Implementation details → `server/SWAGGER_IMPLEMENTATION.md`

---

**Last Updated:** $(date)
**Status:** 🟡 IN PROGRESS (24% Complete)
**Priority:** 🔴 HIGH
