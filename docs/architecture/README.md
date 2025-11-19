# Mshkltk - UML Architecture Documentation

**Last Updated:** November 16, 2025  
**Created By:** Senior Software Engineer Analysis  
**Status:** Complete - Production System Architecture

---

## 📐 Overview

This directory contains comprehensive UML diagrams documenting the entire Mshkltk system architecture. The diagrams follow industry best practices and provide a complete visual representation of the application's structure, behavior, and deployment.

## 📊 Available Diagrams

### 1. System Architecture Overview
**File:** `mshkltk-system-architecture.puml`  
**Type:** Component Diagram  
**Purpose:** High-level overview of the entire system

**Shows:**
- Frontend components (React contexts, pages, services)
- Backend routes and middleware
- Database schema structure
- AI integration (Gemini)
- PWA features (Service Worker, IndexedDB)
- All major relationships between components

**Key Insights:**
- Three separate state management contexts (Citizen, Portal, Admin)
- Clean separation between frontend and backend
- Middleware pipeline for authentication and validation
- Offline-first architecture with background sync

---

### 2. File Structure & Relationships
**File:** `mshkltk-file-structure.puml`  
**Type:** Package/Component Diagram  
**Purpose:** Complete project file organization and dependencies

**Shows:**
- Root configuration files (package.json, vite.config.ts, etc.)
- Frontend directory structure (src/)
- Backend directory structure (server/)
- Database schema file
- Documentation organization (docs/)
- Test suite structure (tests/)
- All file relationships and imports

**Key Insights:**
- 764-line constants.ts as single source of truth
- Three context providers with clear responsibilities
- 50+ API endpoints across 10 route files
- 46 E2E tests with shared helpers
- Comprehensive documentation with 7 UML diagrams

---

### 3. Sequence Diagrams
**File:** `mshkltk-sequence-diagrams.puml`  
**Type:** Sequence Diagram (Multiple Scenarios)  
**Purpose:** Detailed flow of key user interactions

**Scenarios Covered:**
1. **User Authentication Flow** - Registration with JWT token generation
2. **Submit Report Flow** - AI analysis, online/offline submission
3. **Municipality Portal Update** - Status change with notifications
4. **Super Admin Impersonation** - User context switching
5. **Gamification Badge Award** - Automatic achievement detection
6. **Offline PWA Sync** - Background synchronization with IndexedDB
7. **Real-Time Map Updates** - Polling and marker updates

**Key Insights:**
- Complete request/response cycles
- Error handling and validation steps
- AI integration points
- Offline queue management
- Notification system triggers

---

### 4. Database ERD (Entity-Relationship Diagram)
**File:** `mshkltk-database-erd.puml`  
**Type:** Entity-Relationship Diagram  
**Purpose:** Complete database schema visualization

**Entities:**
- `users` - User accounts with role-based access
- `reports` - Civic issue reports with PostGIS location
- `comments` - User comments on reports
- `notifications` - Push notifications and in-app alerts
- `report_history` - Audit trail of status changes
- `dynamic_categories` - Super admin-managed categories
- `dynamic_badges` - Super admin-managed achievements
- `gamification_settings` - Points rules configuration
- `audit_logs` - Admin action tracking

**Key Features:**
- PostGIS spatial indexing for `location` field
- Comprehensive foreign key relationships
- Enum types for constrained values
- JSONB fields for flexible configuration
- Indexes optimized for common queries

**Key Insights:**
- 9 core tables with clear relationships
- CASCADE and SET NULL delete behaviors
- Bilingual support (EN/AR) in all user-facing text
- Geospatial capabilities via PostGIS extension

---

### 5. Frontend Component Architecture
**File:** `mshkltk-frontend-components.puml`  
**Type:** Component Diagram  
**Purpose:** Detailed view of React frontend structure

**Shows:**
- Entry point and routing configuration
- Three context providers (AppContext, PortalContext, SuperAdminContext)
- All pages for each portal (25+ components)
- Shared components (Layout, Header, Map, etc.)
- Service layer (ApiService)
- PWA infrastructure (Service Worker, IndexedDB, Manifest)
- Constants and TypeScript types

**Key Insights:**
- HashRouter for PWA compatibility
- Role-based route protection (AuthGate, PortalAuthGate, SuperAdminAuthGate)
- Offline-first with Service Worker + IndexedDB
- Centralized constants (764 lines - single source of truth)
- Bilingual support with RTL layout for Arabic

---

### 6. Deployment Architecture
**File:** `mshkltk-deployment.puml`  
**Type:** Deployment Diagram  
**Purpose:** Infrastructure and deployment configuration

**Environments:**

#### **Development:**
- Vite dev server (port 3000)
- Express backend (port 3001)
- Docker PostgreSQL (port 5432)
- Hot reload for frontend & backend

#### **Production (Proposed - GCP):**
- **Firebase Hosting** - Static files, global CDN
- **Cloud Run** - Serverless backend, auto-scaling (0-100 instances)
- **Cloud SQL** - Managed PostgreSQL 15 with PostGIS
- **Cloud Storage** - Media files (photos, avatars)
- **Secret Manager** - Environment variables
- **Cloud Logging** - Centralized logs
- **Gemini AI** - External AI service

**Cost Estimate:** $15-40/month for pilot (1000 users)

**Key Insights:**
- Serverless architecture for scalability
- Global CDN for fast static asset delivery
- Automated backups and high availability
- 99.95% SLA for all services

---

### 7. Use Case Diagram
**File:** `mshkltk-use-cases.puml`  
**Type:** Use Case Diagram  
**Purpose:** Complete functional requirements overview

**Actors:**
- Citizen (registered user)
- Anonymous User (guest)
- Municipality Staff (portal user)
- Super Admin (system administrator)
- System (automated processes)
- Gemini AI (external service)

**Use Case Categories:**
- Authentication (5 use cases)
- Report Management (10 use cases)
- Discovery & Exploration (7 use cases)
- Notifications (5 use cases)
- Gamification (5 use cases)
- Profile Management (6 use cases)
- Municipality Portal (10 use cases)
- Super Admin Portal (20 use cases)
- Offline Support (4 use cases)
- AI Integration (6 use cases)
- System Operations (6 use cases)

**Total:** 105+ use cases

**Key Insights:**
- Role-based access control clearly defined
- Include/extend relationships show dependencies
- AI integration points identified
- Offline capabilities highlighted

---

### 8. State Machine Diagrams
**File:** `mshkltk-state-machines.puml`  
**Type:** State Machine Diagrams (6 state machines)  
**Purpose:** Detailed behavioral modeling of key entities

**State Machines:**

1. **Report Lifecycle** (5 states)
   - Draft → Queued (offline) → New → Received → In Progress → Resolved
   - Shows all status transitions and triggers
   - Documents notification and point award logic

2. **User Authentication** (5 states)
   - Anonymous → Register/Login → Authenticated
   - Guest account upgrade flow
   - JWT token management

3. **Notification Lifecycle** (4 states)
   - Created → Unread → Read → Deleted
   - Push notification integration
   - Badge count updates

4. **Badge Earning Process** (4 states)
   - Eligibility Check → Not Eligible / Eligible → Awarded
   - Criteria evaluation logic
   - Bonus points and toast display

5. **Offline Sync Process** (5 states)
   - Online → Offline → Queuing → Syncing → Partial Sync
   - IndexedDB queue management
   - Background sync retry logic

6. **Admin Impersonation** (4 states)
   - Admin Logged In → Impersonation Start → Impersonating → Exit
   - Context switching logic
   - Audit trail logging

**Key Insights:**
- All state changes have clear triggers and side effects
- Error states and retry logic documented
- Notification triggers mapped to state transitions
- Offline/online state handling explicit

---

## 🛠️ How to View the Diagrams

### Option 1: PlantUML Preview (VS Code)
1. Install the **PlantUML** extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` (Windows/Linux) or `Option+D` (Mac) to preview

### Option 2: Online PlantUML Viewer
1. Visit [PlantUML Web Server](http://www.plantuml.com/plantuml/uml/)
2. Copy the contents of any `.puml` file
3. Paste into the text area to render

### Option 3: Generate PNG/SVG Images
```bash
# Install PlantUML (requires Java)
brew install plantuml  # macOS
apt-get install plantuml  # Ubuntu/Debian

# Generate images
cd docs/architecture
plantuml -tpng *.puml  # PNG format
plantuml -tsvg *.puml  # SVG format
```

### Option 4: VS Code Extension (Recommended)
Install: [PlantUML by jebbs](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml)

**Features:**
- Live preview as you edit
- Export to PNG/SVG/PDF
- Syntax highlighting
- Auto-completion

---

## 📚 Diagram Reading Guide

### Understanding PlantUML Syntax

**Relationships:**
- `-->` : Association (uses, calls, depends on)
- `--o` : Aggregation (has-a, contains)
- `--*` : Composition (owns, part-of)
- `--|>` : Inheritance (is-a, extends)
- `..>` : Dependency (includes, extends use case)

**Multiplicity:**
- `1` : Exactly one
- `*` : Zero or more
- `0..1` : Zero or one
- `1..*` : One or more

**Stereotypes:**
- `<<Context>>` : React Context Provider
- `<<Service>>` : API Service Layer
- `<<Worker>>` : Service Worker
- `<<FK>>` : Foreign Key
- `<<PK>>` : Primary Key

---

## 🎯 Key Architectural Patterns

### 1. **Three-Portal Architecture**
- **Citizen Portal**: Public-facing app for reporting issues
- **Municipality Portal**: Internal dashboard for staff
- **Super Admin Portal**: Global management console

Each portal has:
- Dedicated context provider
- Separate route protection
- Role-based UI/UX

### 2. **Offline-First PWA**
- Service Worker caches all static assets
- IndexedDB queues pending reports
- Background sync when online
- Push notifications via Service Worker API

### 3. **AI-Enhanced Reporting**
- Gemini AI analyzes photos for category/severity
- Municipality detection via GPS coordinates
- Bilingual title generation (EN/AR)
- Multi-issue detection in single photo

### 4. **Role-Based Access Control (RBAC)**
- **citizen**: Can submit, confirm, comment
- **municipality**: Can view/update reports in their area
- **utility**: Scoped to specific categories
- **union_of_municipalities**: Multi-municipality access
- **super_admin**: Full system access

### 5. **Gamification Engine**
- Points awarded for actions (submit +10, confirm +3)
- Badges earned on milestones (14 achievements)
- Leaderboard for community engagement
- Configurable rules via admin portal

### 6. **Bilingual Support (EN/AR)**
- All text content in both languages
- RTL layout for Arabic
- Language toggle in header
- Persists in localStorage

---

## 📊 System Metrics

**Frontend:**
- **Files:** 50+ TypeScript/TSX components
- **Lines of Code:** ~15,000 LOC
- **Bundle Size:** ~500 KB (gzipped)
- **Dependencies:** 20 (production)

**Backend:**
- **Files:** 30+ JavaScript modules
- **Lines of Code:** ~8,000 LOC
- **API Endpoints:** 50+ routes
- **Dependencies:** 12 (production)

**Database:**
- **Tables:** 9 core tables
- **Seed Data:** 35 users, 100+ reports
- **Indexes:** 25+ optimized indexes
- **Extensions:** PostGIS, uuid-ossp

**Testing:**
- **E2E Tests:** 46 Playwright tests
- **Pass Rate:** 98% (45/46 passing)
- **Coverage:** Core user flows + edge cases

---

## 🔍 Quick Reference

### Common Queries Answered by Diagrams

**Q: How does user authentication work?**  
→ See: `mshkltk-sequence-diagrams.puml` - "User Authentication Flow"

**Q: What tables are in the database?**  
→ See: `mshkltk-database-erd.puml` - All 9 tables with relationships

**Q: How does offline sync work?**  
→ See: `mshkltk-sequence-diagrams.puml` - "Offline PWA Sync Flow"

**Q: What can each user role do?**  
→ See: `mshkltk-use-cases.puml` - Actor-use case relationships

**Q: How is the frontend organized?**  
→ See: `mshkltk-frontend-components.puml` - Complete component structure

**Q: What's the deployment architecture?**  
→ See: `mshkltk-deployment.puml` - Dev + Production infrastructure

**Q: How does AI integration work?**  
→ See: `mshkltk-system-architecture.puml` - AI Routes + Gemini connection

**Q: What are the key workflows?**  
→ See: `mshkltk-sequence-diagrams.puml` - 7 critical scenarios

**Q: How do reports move through statuses?**  
→ See: `mshkltk-state-machines.puml` - Report Lifecycle state machine

**Q: How does authentication work step-by-step?**  
→ See: `mshkltk-state-machines.puml` - User Authentication state machine

**Q: What happens when a badge is earned?**  
→ See: `mshkltk-state-machines.puml` - Badge Earning Process

---

## 🚀 Next Steps

### For Developers:
1. Review `mshkltk-system-architecture.puml` for overall structure
2. Study `mshkltk-sequence-diagrams.puml` for implementation flows
3. Reference `mshkltk-database-erd.puml` when writing queries

### For Product Managers:
1. Review `mshkltk-use-cases.puml` for feature completeness
2. Check `mshkltk-deployment.puml` for infrastructure planning
3. Validate flows in `mshkltk-sequence-diagrams.puml`

### For DevOps:
1. Study `mshkltk-deployment.puml` for infrastructure setup
2. Review security notes in system architecture diagram
3. Plan CI/CD pipeline based on deployment diagram

### For QA/Testing:
1. Use `mshkltk-use-cases.puml` to create test cases
2. Reference `mshkltk-sequence-diagrams.puml` for test scenarios
3. Validate against `mshkltk-system-architecture.puml`

---

## 📝 Maintenance

**When to Update Diagrams:**
- New features added
- Database schema changes
- New API endpoints
- Architecture refactoring
- Deployment changes

**How to Update:**
1. Edit the relevant `.puml` file
2. Test rendering in VS Code or online viewer
3. Export new images if needed
4. Update this README if structure changes

---

## 🤝 Contributing

When adding new diagrams:
1. Use consistent PlantUML syntax
2. Follow existing naming conventions
3. Add comprehensive notes and legends
4. Update this README with new diagram info
5. Validate rendering before committing

---

## 📖 Additional Resources

- [PlantUML Documentation](https://plantuml.com/)
- [UML 2.5 Specification](https://www.omg.org/spec/UML/2.5/)
- [C4 Model](https://c4model.com/) - Alternative architecture diagrams
- [Mshkltk Main README](../../README.md)
- [API Documentation](../api/README.md)
- [Development Guide](../development/DEVELOPMENT.md)

---

## 📄 License

This documentation is part of the Mshkltk project and follows the same license.

---

**Questions or Issues?**  
Contact the development team or open an issue in the repository.
