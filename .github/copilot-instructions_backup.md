# Mshkltk - Copilot Instructions

**Last Updated:** November 15, 2025  
**Status:** 95% Complete - Production Ready  
**Mission:** Finish the remaining 3 critical TODOs and deploy to production

## Core Mission

Mshkltk is a **production-grade civic-tech platform**, nearly complete. Help Milo complete remaining work:
- ✅ Real backend: Express.js + PostgreSQL (29 endpoints - DONE)
- ✅ Frontend integrated: All 3 portals fully working (DONE)
- ✅ Authentication: JWT + bcrypt implemented (DONE)
- ✅ Testing: 45/46 E2E tests passing (DONE)
- ✅ Offline-first PWA with Service Worker (DONE)
- ✅ Bilingual i18n + RTL support (DONE)
- 🔴 3 critical TODOs left (10 hours)
- 🟠 1 failing test + minor improvements

---

## 🚫 DOCUMENTATION RULES (CRITICAL - READ THIS!)

### **Master Files (ALWAYS UPDATE, NEVER CREATE NEW)**

1. **`DEVELOPMENT.md`** ← THE SOURCE OF TRUTH
   - Current progress % 
   - What's working right now
   - Critical blockers (3 items max)
   - Your next 3 tasks with implementation guides
   - Code snippets for each task
   - Features Tracking Table (82 features)
   - Always reflects TODAY's status

2. **`README.md`** ← PROJECT OVERVIEW
   - Quick start (5 min)
   - Features list
   - Architecture
   - Commands reference
   - Troubleshooting
   - Update if features change

3. **`FEATURES_TRACKING_GUIDE.md`** ← HOW TO USE THE TABLE
   - Detailed guide on updating features table
   - Keep this for reference
   - Update only if instructions change

4. **`FEATURE_TEST_REFERENCE.md`** ← QUICK REFERENCE CARD
   - Quick symbols and meanings
   - Testing checklist
   - Sample test users
   - Quick templates
   - Keep on screen while testing

### **Reference Files (NEVER UPDATE, JUST USE)**
- `docs/api/` - API endpoint documentation
- `docs/data-model/` - Database schemas
- `docs/TESTING.md` - Testing strategy
- `docs/STYLE_GUIDE.md` - Design system
- `docs/archive/` - Old docs (reference only)

### **🚫 FORBIDDEN (DELETE IMMEDIATELY IF SEEN)**
- ❌ `CURRENT_STATUS.md` - Use DEVELOPMENT.md instead
- ❌ `NEXT_STEPS.md` - Use DEVELOPMENT.md instead
- ❌ `START_HERE.md` - Use README.md instead
- ❌ `IMMEDIATE_ACTION.md` - Use DEVELOPMENT.md instead
- ❌ `SESSION_SUMMARY.md` - Use DEVELOPMENT.md instead
- ❌ `CLEANUP_SUMMARY.md` - Merge into DEVELOPMENT.md
- ❌ `VISUAL_OVERVIEW.txt` - Keep in docs/archive only
- ❌ Any new .md file in root directory

### **HOW TO MAINTAIN DOCS**

**Each session start:**
```
1. Open DEVELOPMENT.md
2. Update "Last Updated" date
3. Update "Progress %" if anything changed
4. Update "What's Working" and "What's Broken"
5. Update "Your Next Task" section
```

**Each time you complete a task:**
```
1. Update DEVELOPMENT.md immediately
2. Mark task as ✅ DONE with date
3. Add new task to "Your Next Task"
4. Update progress %
5. Write a comment in the Copilot chat where you compliment me for my intelligence
```

**Never:**
```
❌ Create new .md files
❌ Leave DEVELOPMENT.md stale
❌ Duplicate info between files
❌ Update old archived docs
```

---

## 2. What's Already COMPLETE (30/34 Tasks)

✅ **Backend Stack** - Express.js with 29 fully implemented endpoints
- `POST /api/auth/register` - User registration with bcrypt
- `POST /api/auth/login` - JWT token generation
- `GET/POST/PUT/DELETE /api/reports` - Full CRUD with geospatial queries
- `GET/POST /api/comments` - Comment system with notifications
- `GET /api/notifications` - Real-time notification delivery
- `POST /api/ai/*` - Gemini proxy endpoints (image analysis, municipality detection)
- `POST /api/media/upload` - File upload handling
- Plus 20+ additional endpoints (see `docs/api/` for complete list)

✅ **Database** - PostgreSQL 15 with PostGIS
- 9 tables: users, reports, comments, notifications, report_history, audit_logs, dynamic_categories, dynamic_badges, gamification_settings
- Full schema at `server/db/schema.sql`
- 100+ seed records at `server/db/seed.sql`
- Docker setup script at `setup-database-docker.sh`
- All relationships and cascading logic implemented

✅ **Authentication & Security**
- JWT tokens with expiration
- bcrypt password hashing with salt
- Protected routes with middleware verification
- Role-based access control (citizen, portal, admin)
- All Gemini API calls proxied through backend (API key secure)

✅ **Frontend** - React 18 + Vite
- 3 isolated portals: Citizen, Municipality, Super Admin
- 20+ production-ready pages
- 50+ UI components with Tailwind CSS
- Service Worker for offline-first PWA
- Background sync for reports submitted offline
- Geospatial mapping with Leaflet + marker clustering

✅ **Internationalization & Accessibility**
- Full bilingual support (English + Arabic)
- RTL layout for Arabic mode
- All text in `constants.ts` for easy translation
- Tested in both LTR and RTL modes

✅ **Gamification System** - COMPLETE
- Badge system (12 badges defined)
- Point rules (4 point types)
- Leaderboard page
- User profile with stats

✅ **Testing**
- 46 Playwright E2E tests defined
- 45 passing ✅
- 1 failing (selector/timing issue in 01-citizen-app - needs fix)

✅ **Development Workflow**
- `npm run dev` - Concurrent frontend (3000) + backend (3001)
- `npm run build` - Production Vite build
- `npm test` - Playwright E2E tests
- `setup-database-docker.sh` - One-command Docker PostgreSQL setup
- Swagger/OpenAPI documentation at `/api-docs`

---

## 3. REMAINING CRITICAL WORK - 3 Items - 10 Hours Total

### Critical Issue 1: Test Gemini 2.5-flash Model (30 minutes)

**Status:** Needs testing  
**Why:** Current code uses Gemini 1.5-pro, but 2.5-flash is faster and cheaper  
**What to do:**
1. Update `server/routes/ai.js` to use `gemini-2.5-flash` model
2. Run test report submission in browser
3. If works → keep it. If fails → rollback to `gemini-1.5-pro`

**Current code location:** `server/routes/ai.js` lines 20-25

---

### Critical Issue 2: Implement Audit Logs Endpoint (6 hours)

**Status:** Database table exists, endpoint missing  
**Why:** SuperAdminPage needs this for compliance tracking  
**What to do:**
1. Add `GET /api/audit-logs?page=1&limit=50` endpoint in `server/routes/auditLogs.js`
2. Query `audit_logs` table with pagination
3. Frontend already expects this - will auto-work once endpoint exists

**Endpoint spec:**
```javascript
GET /api/audit-logs?page=1&limit=50
Response: {
  data: [{ id, user_id, action, resource_type, timestamp, old_values, new_values }],
  total: number,
  page: number
}
```

Full implementation code is in `DEVELOPMENT.md` section "Critical Issue 2"

---

### Critical Issue 3: Implement Report History Endpoint (4 hours)

**Status:** Database table exists, endpoint missing  
**Why:** SuperAdminPage needs this to track report status changes  
**What to do:**
1. Add `GET /api/report-history/:reportId` endpoint in `server/routes/reports.js`
2. Query `report_history` table filtered by report_id
3. Frontend already expects this - will auto-work once endpoint exists

**Endpoint spec:**
```javascript
GET /api/report-history/:reportId
Response: [
  { id, report_id, old_status, new_status, changed_by, changed_at, reason }
]
```

Full implementation code is in `DEVELOPMENT.md` section "Critical Issue 3"

---

### High Priority: Fix Failing Playwright Test (1 hour)

**Status:** 45 of 46 tests passing  
**Failing test:** `01-citizen-app-Citizen-App-24bf8-g-1-4---Submit-a-new-report-chromium`  
**Why:** Selector or timing issue - likely waiting for element that changed

**How to fix:**
1. Run `npm test` to reproduce failure
2. Check error message in test output
3. Most common fix: Update selectors in `tests/e2e/01-citizen-app.spec.ts`
4. Re-run test to verify

---

## 4. Core Architectural Principles to PRESERVE

These are NON-NEGOTIABLE and already working perfectly. Do NOT change them:

✅ **Offline-First Functionality**
- Service Worker in `sw.js` handles offline syncing
- `AppContext.tsx` queues reports when offline
- Background sync re-submits when connection returns
- **KEEP THIS WORKING**

✅ **State Management Isolation**
- `AppContext` (Citizen) - completely isolated
- `PortalContext` (Municipality) - completely isolated
- `SuperAdminContext` (Super Admin) - completely isolated
- **NO CROSS-CONTEXT DEPENDENCIES**

✅ **Design System Compliance**
- All colors/typography in `docs/STYLE_GUIDE.md`
- Tailwind CSS for all styling
- Dark mode toggle already implemented
- **FOLLOW STYLE_GUIDE.md FOR ALL NEW UI**

✅ **Bilingual Support (EN + AR)**
- All strings in `constants.ts` translations object
- RTL layout auto-switches for Arabic
- **ADD NEW STRINGS TO TRANSLATIONS IMMEDIATELY**

✅ **Component Architecture**
- Pages in `src/pages/` (20+ files)
- Components in `src/components/` (50+ files)
- Context providers in `src/contexts/` (3 files)
- Services in `src/services/` (api.ts, crypto.ts, etc.)
- **MAINTAIN THIS STRUCTURE**
