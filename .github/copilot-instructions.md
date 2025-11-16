# Mshkltk AI Coding Assistant Instructions

**Last Updated:** November 15, 2025  
**Project:** Mshkltk - Civic Reporting PWA (95% complete)

## 🚨 CRITICAL USER PREFERENCE

**DO NOT create new markdown files.** Always update existing documentation files only. Examples of existing docs to update:
- `TODO.md` - Track new tasks here
- `docs/gcp-proposal/README.md` - Update deployment docs
- `docs/api/README.md` - Update API documentation
- `DEVELOPMENT.md` - Update status and progress
- `docs/README.md` - Update general docs

This keeps the documentation organized and prevents doc sprawl.

## Architecture Overview

**Mshkltk** is a bilingual (English/Arabic), offline-first Progressive Web App for civic reporting with three distinct portals:

- **Citizen Portal**: Report local issues with photos/videos, AI analysis via Gemini, gamification (badges/points)
- **Municipality Portal**: Dashboard for staff to manage reports, track resolutions, communicate with citizens
- **Super Admin Portal**: Global management of users, categories, gamification settings, audit trails

**Tech Stack:**
- Frontend: React 18 + React Router v6 (HashRouter) + TypeScript + Vite
- Backend: Node.js + Express 5
- Database: PostgreSQL 15 + PostGIS extension (Docker)
- Auth: JWT tokens + bcrypt password hashing
- AI: Gemini 2.5-flash (document analysis, categorization, municipality detection, title generation)
- PWA: Service Worker for offline-first support with automatic sync
- Testing: Playwright (46 E2E tests, 1 currently fixing)

## Key Development Workflows

### Quick Start (5 minutes)
```bash
# Install + setup
git clone <repo>
cd mshkltk && npm install && cd server && npm install && cd ..
./setup-database-docker.sh  # Creates PostgreSQL + PostGIS in Docker

# Development (concurrent frontend + backend)
npm run dev
# Frontend: http://localhost:3000 | Backend: http://localhost:3001 | API Docs: http://localhost:3001/api-docs
```

### Running Tests
```bash
npm test                    # All 46 E2E tests
npm run test:citizen        # Citizen portal (45 tests passing)
npm run test:admin          # Super admin portal
npm run test:portal         # Municipality portal
npm run test:headed         # Visible browser execution
npm run test:ui             # Interactive test UI
npm run test:report         # Open last report
```

**Critical:** Tests run sequentially (workers=1) to avoid DB conflicts. HashRouter+hash-based URLs used for E2E compatibility.

### Database Setup
- **Schema:** `server/db/schema.sql` (PostgreSQL, includes seed data)
- **Seed Users (35 total):**
  - Admin: `admin` / `password`
  - Municipality Portal: `beirut_portal` / `password`
  - Citizen: `citizen_user` / `password`
- **PostGIS queries** for geospatial searches (see `server/routes/reports.js`)
- **100+ realistic seed reports** pre-populated for testing

### Authentication Flow
1. User submits credentials → `POST /api/auth/login` or `/api/auth/register`
2. Backend: Hash password with bcrypt, compare, generate JWT token (7-day expiration)
3. Frontend: Store token in localStorage, attach `Authorization: Bearer {token}` to all API requests
4. JWT payload includes: `id`, `username`, `role`, `municipality_id`, `portal_access_level`
5. Role-based access control (RBAC): `citizen`, `portal`, `super_admin`

**Middleware:** `server/middleware/auth.js` validates JWT on protected routes. `AuthGate` + `PortalAuthGate` + `SuperAdminAuthGate` handle frontend route protection.

## Architecture Patterns & File Organization

### Frontend Structure
```
src/
  App.tsx                      # Main router (HashRouter for offline PWA)
  contexts/
    AppContext.tsx             # Citizen app state (user, auth, notifications, impersonation)
    PortalContext.tsx          # Municipality staff state
    SuperAdminContext.tsx      # Admin app state
  pages/
    {HomePage, MapPage, ...}   # Citizen portal pages
    portal/                    # Municipality portal pages
    superadmin/                # Admin portal pages
  components/
    {Header, Layout, ...}      # Shared components
    portal/                    # Municipality-specific components
    superadmin/                # Admin-specific components
  services/
    api.ts                     # API service layer (all HTTP requests)
  constants.ts                 # Routes, colors, categories, badges (764 lines)
  types.ts                     # TypeScript interfaces (circular dependency FIX: ReportCategory is static union)
```

**Key Pattern:** Three separate context providers to isolate state per portal. Components conditionally render based on route context.

### Backend Structure
```
server/
  index.js                     # Express app setup, Swagger docs, route mounting
  routes/
    {auth, reports, comments, users, media, ai, config, notifications, auditLogs}.js
  middleware/
    auth.js                    # JWT verification, token generation
    upload.js                  # Multer file upload handling
  db/                          # Database queries (separate files per entity)
  utils/                       # Helpers (DB connection, etc.)
  swagger.js                   # Swagger spec generation
```

**Critical:** All API responses use snake_case (backend convention). Frontend transforms to camelCase via `transformUser()` in `api.ts`.

## Project-Specific Patterns

### State Management
- **No Redux/Zustand:** Direct Context API usage with reducer patterns
- **localStorage:** Primary persistence for auth token, language preference, notifications
- **Service Worker:** Offline queue stored in IndexedDB, synced on reconnect

### Type Safety
- **Circular Dependency Fix:** `ReportCategory` is a static string union type (not derived from constants) to prevent white-screen-of-death on app load
- **Backend: snake_case** (database columns, API responses)
- **Frontend: camelCase** (React conventions, with transformation layer in `api.ts`)

### AI Integration
- **Model:** Gemini 2.5-flash (may fallback to 1.5-pro if needed)
- **Routes:** `POST /api/ai/analyze-media`, `/transcribe-audio`, `/detect-municipality`, `/generate-title`
- **Image Handling:** Base64 encoding for frontend-to-backend (50MB limit in Express middleware)
- **Error Handling:** Safe JSON parsing with `safeParseJson()` to gracefully handle non-JSON responses

### Bilingual Support (English/Arabic)
- **Language Toggle:** Globe icon in header, stored in localStorage
- **RTL Layout:** Tailwind CSS handles direction (no CSS rebuilding needed)
- **String Keys:** All UI strings use `{title_en, title_ar}` or `{note_en, note_ar}` pattern
- **Component:** `components/Header.tsx` has language switcher
- **Constants:** `CATEGORIES` in `constants.ts` has `name_en` + `name_ar` for each category

### Map & Geospatial
- **Leaflet + PostGIS:** Interactive map with clustering, heatmaps, nearby reports
- **Real-time Updates:** Marker updates via polling or WebSocket (currently polling)
- **Default Location:** Playwright tests set to Amman, Jordan (31.9539°N, 35.9106°E)

### Offline-First PWA
- **Service Worker:** `sw.js` at project root
- **Manifest:** Declared in `index.html`
- **Background Sync:** Failed report submissions queued, retry on network reconnect
- **Permissions:** Camera (photos), geolocation (location detection), notification

## API Documentation & Examples

**Interactive Swagger UI:** `http://localhost:3001/api-docs` (regenerated on server start)

### Core Endpoints
```
POST /api/auth/login                  # Login with credentials
POST /api/auth/register               # New user signup
POST /api/reports                     # Submit citizen report
GET  /api/reports                     # Fetch reports (filtered, paginated)
GET  /api/reports/:id                 # Report details with comments
PATCH /api/reports/:id                # Update report status (portal/admin)
POST /api/ai/analyze-media            # AI analyze photo + text
GET  /api/config/categories           # Fetch dynamic categories
GET  /api/config/badges               # Fetch dynamic badges
POST /api/users/:id/confirm-report    # Citizen confirms report
GET  /api/notifications               # Fetch user notifications
```

**Authentication Header:** All protected endpoints require `Authorization: Bearer {token}`

## Common Issues & Solutions

### Issue: White screen on app load
- **Cause:** Circular dependency in type definitions
- **Fix:** `ReportCategory` is static union type in `types.ts`, not computed from constants

### Issue: Tests fail with DB conflicts
- **Cause:** Parallel test execution
- **Fix:** `playwright.config.ts` sets `workers: 1`, tests run sequentially

### Issue: Form validation fails unexpectedly
- **Cause:** Backend enforces minimum string lengths, character limits
- **Check:** `docs/api/validation.md` for all validation rules per endpoint

### Issue: Map not rendering on app load
- **Cause:** Leaflet container needs explicit dimensions
- **Pattern:** Always wrap `InteractiveMap` in a sized div: `<div className="h-screen">...</div>`

### Issue: AI endpoints return 404
- **Cause:** Gemini 2.5-flash may not be available in all regions/accounts
- **Fix:** Test with `gemini-1.5-pro` or `gemini-1.5-pro-vision` (see `TODO.md` Critical #1)

## Commands Reference

```bash
# Development
npm run dev                 # Start frontend + backend concurrently
npm run dev-frontend        # Vite dev server only (port 3000)
npm run dev-backend         # Backend with nodemon (port 3001)

# Database
./setup-database-docker.sh  # Full setup with Docker
./setup-database.sh         # Local PostgreSQL setup (macOS)
npm run seed-database       # (if available) Populate seed data

# Testing
npm test                    # Run all E2E tests
npm run test:headed         # With visible browser
npm run test:ui             # Interactive mode

# Building
npm run build               # Vite build to dist/

# Useful Queries
curl http://localhost:3001/api-docs.json | jq  # Get API spec as JSON
```

## File References for Key Patterns

- **Authentication:** `server/middleware/auth.js`, `src/contexts/AppContext.tsx`, `src/pages/auth/LoginPage.tsx`
- **API Communication:** `src/services/api.ts` (all HTTP calls)
- **Report Submission:** `src/pages/ReportFormPage.tsx` (4-step wizard), `server/routes/reports.js` (backend processing)
- **AI Integration:** `server/routes/ai.js` (Gemini calls), `server/index.js` (legacy endpoints)
- **Gamification:** `src/components/AchievementToast.tsx`, `server/routes/config.js` (badge/point rules)
- **Testing Helpers:** `tests/e2e/helpers.ts` (shared test utilities)
- **Constants:** `src/constants.ts` (routes, colors, categories, badges - single source of truth)

## CI/CD & Deployment Notes

- **Environment Variables:** `.env` at project root (must define `GEMINI_API_KEY`, `JWT_SECRET`, `DATABASE_URL`)
- **Production Build:** `npm run build` outputs to `dist/` (static files served via backend in production)
- **Docker Database:** Persisted data in named volume `mshkltk_db_volume` (survives container restarts)

---

**Next Steps When Taking Over:**
1. Run `npm run dev` and verify both frontend/backend start without errors
2. Open `http://localhost:3001/api-docs` to inspect all endpoints
3. Login with `admin` / `password` and test citizen + portal workflows
4. Run `npm test` to ensure test suite is healthy
5. Check `TODO.md` for remaining priority items (esp. Critical #1 & #2)
