# Changelog

All notable changes to the Mshkltk project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Repository Restructure (2025-11-16)
- Organized documentation into `docs/` subdirectories (getting-started, architecture, development, deployment, security, project-management)
- Centralized shell scripts in `scripts/` subdirectories (setup, dev, test, deploy)
- Created symlinks for backward compatibility (start.sh, stop.sh, setup-database.sh, setup-database-docker.sh)
- Enhanced docs/README.md with comprehensive navigation hub

### Added - Security Fixes (2025-11-16)
- **Critical Security Fixes:**
  - Implemented CORS whitelist configuration via `ALLOWED_ORIGINS` environment variable
  - Added Helmet middleware for security headers (XSS, clickjacking, MIME sniffing protection)
  - Enforced JWT_SECRET requirement (no hardcoded fallback)
  - Implemented rate limiting on authentication endpoints (5 requests/15min per IP)
  - Removed Gemini API key from frontend bundle (vite.config.ts)

- **High-Priority Bug Fixes:**
  - Fixed race condition in report confirmation (awardPoints now inside transaction)
  - Implemented transaction-safe awardPoints function with proper error handling
  - Added custom error handling system (AppError classes, errorHandler middleware)
  - Implemented input validation middleware using express-validator
  - Added response caching for static endpoints (categories, badges - 10min TTL)

- **Medium-Priority Improvements:**
  - Configured database connection pooling (max: 20, idle timeout: 30s)
  - Added request body size limits (1MB default, 50MB for media uploads)
  - Implemented graceful shutdown handlers (SIGTERM, SIGINT)
  - Fixed Service Worker memory leak (localStorage quota handling)
  - Added .env.example template for environment configuration

### Added - New Files
- `server/utils/errors.js` - Centralized error handling system
- `server/utils/sanitizer.js` - Log sanitization utility
- `server/middleware/validators.js` - Input validation middleware
- `server/middleware/cache.js` - API response caching
- `docs/security/SECURITY_FIXES_TRACKING.md` - Detailed tracking of all security fixes
- `docs/security/IMPLEMENTATION_SUMMARY.md` - Executive summary of security improvements
- `docs/deployment/MIGRATION_GUIDE.md` - Deployment and migration instructions
- `docs/getting-started/QUICK_REFERENCE.md` - Command cheat sheet
- `.env.example` - Environment variable template

### Changed
- Enhanced `server/index.js` with security middleware and graceful shutdown
- Updated `server/middleware/auth.js` to enforce JWT_SECRET requirement
- Enhanced `server/routes/auth.js` with rate limiting and password validation
- Updated `server/routes/config.js` with response caching
- Fixed `server/routes/reports.js` confirmReport race condition
- Updated `server/db/connection.js` with connection pool configuration
- Improved `server/db/queries/reports.js` with transaction-safe confirmation
- Enhanced `server/db/queries/users.js` with transaction-safe point awarding
- Removed API key exposure from `vite.config.ts`
- Fixed IndexedDB quota handling in `src/contexts/AppContext.tsx`
- Fixed memory leak in `sw.js` Service Worker

### Security
- Added 4 new security packages: helmet, express-rate-limit, express-validator, node-cache
- Implemented defense-in-depth security strategy (multiple layers of protection)
- Enforced environment variable validation on server startup
- Added comprehensive input validation on all API endpoints
- Implemented secure error handling (no sensitive data leakage)

## [0.1.0] - 2025-11-15

### Added
- Initial release of Mshkltk PWA
- Three-portal architecture (Citizen, Municipality, Super Admin)
- JWT authentication with bcrypt password hashing
- Google Gemini AI integration for report analysis
- PostgreSQL 15 + PostGIS database
- Offline-first PWA with Service Worker
- Gamification system (badges, points, levels)
- Bilingual support (English/Arabic)
- 46 Playwright E2E tests (45 passing)
- Interactive Leaflet maps with clustering
- Real-time notification system
- Swagger API documentation

### Features
- **Citizen Portal:** Report submission, photo/video uploads, AI categorization, gamification, map view
- **Municipality Portal:** Report management, status updates, staff dashboard, communication
- **Super Admin Portal:** User management, category/badge configuration, audit logs

---

## Version History

- **[Unreleased]** - Repository restructure + comprehensive security fixes
- **[0.1.0]** - 2025-11-15 - Initial release (95% complete)

---

## Migration Notes

### Upgrading from Pre-Security-Fixes Version

**Required Steps:**

1. **Update Environment Variables:**
   - Copy `.env.example` to `.env`
   - Set `JWT_SECRET` (required, no default fallback)
   - Set `ALLOWED_ORIGINS` (comma-separated whitelist)
   - Verify `GEMINI_API_KEY`, `DATABASE_URL`

2. **Install New Dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Update Script References (Optional):**
   - Scripts moved to `scripts/` directory
   - Symlinks created for backward compatibility
   - Old paths still work (start.sh, setup-database.sh, etc.)

4. **Review Security Changes:**
   - Read `docs/security/IMPLEMENTATION_SUMMARY.md`
   - Check `docs/deployment/MIGRATION_GUIDE.md`

**Breaking Changes:**
- JWT_SECRET environment variable now required (no hardcoded fallback)
- CORS now enforces whitelist (set ALLOWED_ORIGINS)
- Rate limiting active on authentication endpoints

---

**For detailed implementation notes, see:**
- [Security Fixes Tracking](docs/security/SECURITY_FIXES_TRACKING.md)
- [Migration Guide](docs/deployment/MIGRATION_GUIDE.md)
- [Development Guide](docs/development/DEVELOPMENT.md)
