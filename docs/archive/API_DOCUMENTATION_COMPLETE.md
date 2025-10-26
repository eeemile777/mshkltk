# 📚 Complete API Documentation

**Project:** Mshkltk Municipal Reporting Platform  
**Date:** October 21, 2025  
**API Version:** 1.0  
**Documentation Coverage:** 💯 100%

---

## 🎯 Executive Summary

This document provides comprehensive documentation for **all 33 implemented backend endpoints** in the Mshkltk API. Every endpoint has been verified to have complete Swagger/OpenAPI 3.0 documentation.

### Quick Stats

- **Total Endpoints:** 33
- **Swagger Documented:** 33 (100%)
- **Base URL:** `http://localhost:3001`
- **Swagger UI:** `http://localhost:3001/api-docs`
- **Authentication:** JWT Bearer Token

---

## 📋 Complete Endpoint Inventory

### 🔐 Authentication (3 endpoints)

| Method | Endpoint | Auth Required | Description | Swagger |
|--------|----------|---------------|-------------|---------|
| POST | `/api/auth/register` | ❌ | Register new user account | ✅ |
| POST | `/api/auth/login` | ❌ | Authenticate and receive JWT | ✅ |
| POST | `/api/auth/verify` | ✅ | Verify JWT token validity | ✅ |

**Key Features:**
- Bcrypt password hashing (10 rounds)
- JWT tokens with 24h expiration
- Role-based access (citizen, portal_admin, super_admin)

---

### 📝 Reports (10 endpoints)

| Method | Endpoint | Auth Required | Role Required | Description | Swagger |
|--------|----------|---------------|---------------|-------------|---------|
| POST | `/api/reports` | ✅ | Any | Create new report | ✅ |
| GET | `/api/reports` | ❌ | - | List/filter reports | ✅ |
| GET | `/api/reports/nearby` | ❌ | - | Geospatial search (PostGIS) | ✅ |
| GET | `/api/reports/stats` | ❌ | - | Aggregate statistics | ✅ |
| GET | `/api/reports/:id` | ❌ | - | Get single report details | ✅ |
| PATCH | `/api/reports/:id` | ✅ | Portal (write) | Update report status/notes | ✅ |
| POST | `/api/reports/:id/confirm` | ✅ | Any | Confirm report (not own) | ✅ |
| POST | `/api/reports/:id/subscribe` | ✅ | Any | Subscribe to updates | ✅ |
| DELETE | `/api/reports/:id/subscribe` | ✅ | Any | Unsubscribe | ✅ |
| DELETE | `/api/reports/:id` | ✅ | Super Admin | Delete report (cascade) | ✅ |

**Key Features:**
- PostGIS geospatial queries (nearby search by radius)
- Advanced filtering (status, category, municipality, date range)
- Self-confirm prevention logic
- Subscriber notification system
- Cascade delete (comments + history)

**Filter Parameters:**
```
?status=open|in_progress|resolved|rejected
&category=<category_id>
&municipality=<municipality_name>
&created_by=<user_id>
&start_date=YYYY-MM-DD
&end_date=YYYY-MM-DD
&page=1
&limit=50
```

---

### 💬 Comments (5 endpoints)

| Method | Endpoint | Auth Required | Description | Swagger |
|--------|----------|---------------|-------------|---------|
| POST | `/api/comments` | ✅ | Add comment + notify subscribers | ✅ |
| GET | `/api/comments/report/:reportId` | ❌ | List all comments for report | ✅ |
| GET | `/api/comments/:id` | ❌ | Get single comment | ✅ |
| PATCH | `/api/comments/:id` | ✅ | Edit comment (author only) | ✅ |
| DELETE | `/api/comments/:id` | ✅ | Delete comment (author/admin) | ✅ |

**Key Features:**
- Auto-notification to all report subscribers
- Author-only editing
- Admin override for delete
- Chronological ordering

---

### 👥 Users (6 endpoints)

| Method | Endpoint | Auth Required | Role Required | Description | Swagger |
|--------|----------|---------------|---------------|-------------|---------|
| GET | `/api/users/me` | ✅ | Any | Current user profile | ✅ |
| GET | `/api/users/:id` | ❌ | - | Public user profile | ✅ |
| PATCH | `/api/users/me` | ✅ | Any | Update own profile | ✅ |
| GET | `/api/users/leaderboard` | ❌ | - | Ranked users by points | ✅ |
| GET | `/api/users/portal/all` | ✅ | Super Admin | All users (admin panel) | ✅ |
| DELETE | `/api/users/:id` | ✅ | Super Admin | Delete user | ✅ |

**Key Features:**
- Gamification points tracking
- Badge system
- Password change with re-hashing
- Pagination on leaderboard & admin list
- Public vs private profile fields

**Profile Fields:**
- Public: `id`, `username`, `full_name`, `total_points`, `badges`, `reports_count`
- Private: `email`, `phone`, `password_hash`, `role`, `portal_access_level`

---

### 🔔 Notifications (6 endpoints)

| Method | Endpoint | Auth Required | Description | Swagger |
|--------|----------|---------------|-------------|---------|
| GET | `/api/notifications` | ✅ | List user notifications (paginated) | ✅ |
| GET | `/api/notifications/unread-count` | ✅ | Get unread count | ✅ |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark single as read | ✅ |
| POST | `/api/notifications/mark-all-read` | ✅ | Mark all as read | ✅ |
| DELETE | `/api/notifications/:id` | ✅ | Delete single notification | ✅ |
| DELETE | `/api/notifications` | ✅ | Delete all notifications | ✅ |

**Key Features:**
- Real-time notification generation
- Read/unread status tracking
- Bulk operations (mark all read, delete all)
- Pagination support

**Notification Triggers:**
- New comment on subscribed report
- Report status change
- New badge earned
- Report confirmation
- System announcements

---

### 📸 Media (3 endpoints)

| Method | Endpoint | Auth Required | Description | Swagger |
|--------|----------|---------------|-------------|---------|
| POST | `/api/media/upload` | ✅ | Upload single base64 file | ✅ |
| POST | `/api/media/upload-multiple` | ✅ | Batch upload (up to 5 files) | ✅ |
| GET | `/api/media/status` | ❌ | Check cloud storage config | ✅ |

**Key Features:**
- Base64 data URL support
- Cloud storage integration (AWS S3 ready)
- Automatic MIME type detection
- Fallback to base64 if cloud unavailable
- Folder organization (reports, profiles, proofs)

**Supported MIME Types:**
```
image/jpeg, image/png, image/gif, image/webp
video/mp4, video/webm
audio/mpeg, audio/wav, audio/webm
```

**Upload Limits:**
- Single file: 10MB
- Batch: 5 files × 10MB each

---

## 🔒 Authentication & Authorization

### Authentication Flow

1. **Register:** `POST /api/auth/register`
   - Input: `username`, `email`, `password`, `full_name`
   - Output: User object (no token)

2. **Login:** `POST /api/auth/login`
   - Input: `username`, `password`
   - Output: `{ token, user }`

3. **Authenticated Request:**
   ```http
   Authorization: Bearer <jwt_token>
   ```

### Role Hierarchy

```
super_admin > portal_admin > citizen
```

**Role Permissions:**

| Role | Can Do |
|------|--------|
| `citizen` | Create reports, comment, confirm others' reports, subscribe |
| `portal_admin` | + Update report status (if `portal_access_level = 'read_write'`) |
| `super_admin` | + Delete reports/users, access admin panel, manage users |

---

## 📊 Response Formats

### Success Response

```json
{
  "id": 123,
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

---

## 🗺️ Geospatial Features

### PostGIS Integration

The `/api/reports/nearby` endpoint uses PostGIS for efficient geospatial queries:

**Request:**
```http
GET /api/reports/nearby?lat=33.5731&lng=-7.5898&radius=5000
```

**Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Search radius in meters (default: 5000m)

**PostGIS Query:**
```sql
ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  radius
)
```

---

## 🎨 API Design Patterns

### 1. **RESTful Conventions**
- Resources: `/api/reports`, `/api/users`, `/api/comments`
- HTTP verbs: GET (read), POST (create), PATCH (update), DELETE (remove)
- Status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### 2. **Nested Resources**
```
/api/comments/report/:reportId  (all comments for report)
/api/reports/:id/confirm        (action on report)
/api/reports/:id/subscribe      (subscription management)
```

### 3. **Bulk Operations**
```
POST   /api/notifications/mark-all-read
DELETE /api/notifications (delete all)
```

### 4. **Idempotency**
- GET, PUT, DELETE operations are idempotent
- POST operations create new resources (non-idempotent)
- PATCH updates are idempotent if request body identical

---

## 🧪 Testing with Swagger UI

### Access Swagger Documentation
```
http://localhost:3001/api-docs
```

### Complete Test Flow

**1. Register User**
```json
POST /api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "full_name": "Test User"
}
```

**2. Login**
```json
POST /api/auth/login
{
  "username": "testuser",
  "password": "Test123!"
}
```
→ Copy the `token` from response

**3. Authorize in Swagger UI**
- Click "Authorize" button (🔓)
- Enter: `Bearer <your_token>`
- Click "Authorize"

**4. Create Report**
```json
POST /api/reports
{
  "title": "Broken streetlight",
  "description": "Light at Main St is out",
  "category": "Lighting",
  "municipality": "Casablanca",
  "location": {
    "type": "Point",
    "coordinates": [-7.5898, 33.5731]
  },
  "address": "123 Main St, Casablanca",
  "photo_urls": []
}
```

**5. Get Nearby Reports**
```
GET /api/reports/nearby?lat=33.5731&lng=-7.5898&radius=5000
```

**6. Add Comment**
```json
POST /api/comments
{
  "report_id": 1,
  "text": "I can confirm this issue"
}
```

**7. Subscribe to Report**
```json
POST /api/reports/1/subscribe
```

**8. Check Notifications**
```
GET /api/notifications
```

---

## 📈 Performance Considerations

### Database Indexes

**Critical indexes for performance:**
```sql
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_municipality ON reports(municipality);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_comments_report_id ON comments(report_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- PostGIS spatial index
CREATE INDEX idx_reports_location ON reports USING GIST(location);
```

### Pagination

All list endpoints support pagination to prevent large data transfers:

**Default limits:**
- Reports: 50 per page
- Comments: 100 per page
- Notifications: 50 per page
- Users (admin): 50 per page
- Leaderboard: 100 per page

**Query params:**
```
?page=1&limit=50
```

---

## 🔐 Security Features

### 1. **Password Security**
- Bcrypt hashing with salt rounds = 10
- Never stores plaintext passwords
- Password validation on registration

### 2. **JWT Tokens**
- Signed with secret key (`JWT_SECRET`)
- Expiration: 24 hours
- Contains: `userId`, `role`

### 3. **Authorization Middleware**
- `authMiddleware`: Validates JWT token
- `requireRole(role)`: Enforces role requirement
- `requireWriteAccess`: Portal admin write permission check

### 4. **Input Validation**
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitization)
- File upload MIME type validation

### 5. **Business Logic Protection**
- Cannot confirm own reports
- Cannot edit others' comments (unless admin)
- Cannot delete reports (unless super_admin)

---

## 🚀 Next Steps

### Phase 1: Enhance Current Endpoints ✅ COMPLETE
- [x] Add Swagger documentation (100% coverage)
- [x] Implement all business logic
- [x] Add authentication & authorization
- [x] Add pagination support

### Phase 2: Additional Features (Recommended)
- [ ] Add API response examples to Swagger schemas
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add request logging (morgan)
- [ ] Implement file upload with multer (multipart/form-data)
- [ ] Add API versioning (`/api/v1/...`)
- [ ] Set up Redis caching for leaderboard

### Phase 3: Configuration Endpoints (Missing)
- [ ] `GET /api/config/categories` - Dynamic categories
- [ ] `GET /api/config/badges` - Gamification badges
- [ ] `GET /api/config/gamification` - Points settings

### Phase 4: Admin Portal Endpoints (Future)
- [ ] `GET /api/admin/users` - User management
- [ ] `GET /api/admin/audit-logs` - System logs
- [ ] `POST /api/admin/impersonate` - User impersonation
- [ ] `PATCH /api/admin/users/:id/role` - Role management

---

## 📚 Additional Resources

### Documentation Files
- **API Endpoints:** `/docs/api/` (detailed endpoint specs)
- **Data Models:** `/docs/data-model/` (database schemas)
- **Testing Guide:** `/docs/TESTING.md`
- **Style Guide:** `/docs/STYLE_GUIDE.md`

### Verification Reports
- **Endpoint Verification:** `/ENDPOINT_VERIFICATION.md` (this verification)
- **API Parity Audit:** `/API_PARITY_AUDIT.md` (mock → real API migration)
- **Business Logic Verification:** `/BUSINESS_LOGIC_VERIFICATION.md`

### Code References
- **Backend Routes:** `/server/routes/`
- **Frontend API Client:** `/services/api.ts`
- **Swagger Config:** `/server/swagger.js`

---

## 💡 Developer Tips

### 1. **Testing Locally**
```bash
# Start server
cd server && node index.js

# Access Swagger UI
open http://localhost:3001/api-docs
```

### 2. **Quick Test Script**
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!","full_name":"Test"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
```

### 3. **Database Queries**
```bash
# Connect to PostgreSQL
psql -U postgres -d mshkltk

# Check reports
SELECT id, title, status, municipality FROM reports LIMIT 10;

# Check users
SELECT id, username, role, total_points FROM users LIMIT 10;
```

---

## ✅ Verification Checklist

- [x] All 33 endpoints have Swagger documentation
- [x] All endpoints have authentication/authorization logic
- [x] All endpoints have error handling
- [x] All business logic from mockApi.ts replicated
- [x] Database relationships and cascades implemented
- [x] Pagination added to list endpoints
- [x] Geospatial queries use PostGIS
- [x] Password hashing with bcrypt
- [x] JWT token validation middleware
- [x] Role-based access control
- [x] Input validation and sanitization

---

**Documentation Last Updated:** October 21, 2025  
**API Version:** 1.0  
**Swagger Coverage:** 100% (33/33 endpoints)  
**Status:** ✅ Production Ready (Core Features)
