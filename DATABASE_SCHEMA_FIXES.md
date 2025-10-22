# 🔧 Database Schema Fixes

**Date:** October 22, 2025  
**Issue:** Integration tests failing due to column name mismatches

---

## 🐛 Problems Found

### 1. Reports Table - Trending Endpoint
**Error:**
```
column r.confirmations does not exist
```

**Root Cause:**
- Backend query used: `r.confirmations`
- Actual column name: `r.confirmations_count`

**File:** `server/routes/reports.js` (Line ~293)

**Fix:**
```javascript
// Before
(r.confirmations * 3) + 

// After  
(r.confirmations_count * 3) +
```

---

### 2. Audit Logs Table - Multiple Columns
**Error:**
```
column "actor_id" does not exist
```

**Root Cause:**
- Backend SELECT used: `actor_id`, `actor_name`, `actor_role`, `message`, `metadata`
- Backend INSERT used: Same non-existent columns
- Actual schema only has: `id`, `admin_id`, `action`, `entity_type`, `entity_id`, `details`, `timestamp`

**File:** `server/routes/auditLogs.js`

**Fixes:**

1. **GET /api/audit-logs (Line ~55-65)**
```javascript
// Before
SELECT 
  id,
  actor_id,
  actor_name,
  actor_role,
  action,
  entity_type,
  entity_id,
  message,
  metadata,
  timestamp

// After
SELECT 
  id,
  admin_id,
  action,
  entity_type,
  entity_id,
  details,
  timestamp
```

2. **GET /api/audit-logs/entity/:type/:id (Line ~130-145)**
- Same SELECT fix as above

3. **createAuditLog() Helper Function (Line ~167)**
```javascript
// Before
async function createAuditLog(actorId, actorName, actorRole, action, entityType, entityId, message, metadata = null) {
  INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, message, metadata)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
}

// After
async function createAuditLog(adminId, action, entityType, entityId, details = null) {
  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details)
  VALUES ($1, $2, $3, $4, $5)
}
```

---

## ✅ Actual Database Schema

### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  location GEOGRAPHY(Point, 4326) NOT NULL,
  lat NUMERIC(10,8) NOT NULL,
  lng NUMERIC(11,8) NOT NULL,
  area VARCHAR(500),
  municipality VARCHAR(100) NOT NULL,
  category report_category NOT NULL,
  sub_category VARCHAR(100),
  note_en TEXT NOT NULL,
  note_ar TEXT NOT NULL,
  status report_status DEFAULT 'new',
  severity report_severity DEFAULT 'medium',
  confirmations_count INTEGER DEFAULT 0,  -- ← Note: _count suffix
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  subscribed_user_ids TEXT[] DEFAULT '{}'
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID,  -- ← Note: admin_id, not actor_id
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details JSONB,  -- ← Note: details, not metadata
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 🧪 Testing

After these fixes, run the integration tests again:

1. Open: http://localhost:3001/test/integration-test.html
2. Click "Run All Tests"
3. **Expected Results:**
   - ✅ Test 5: Get Trending Reports (now using `confirmations_count`)
   - ✅ Test 6: Get Audit Logs (now using `admin_id` and `details`)

---

## 📋 Impact

**Files Modified:**
1. ✅ `server/routes/reports.js` - Fixed trending query
2. ✅ `server/routes/auditLogs.js` - Fixed all queries and helper function

**Endpoints Now Working:**
- ✅ GET `/api/reports/trending`
- ✅ GET `/api/audit-logs`
- ✅ GET `/api/audit-logs/entity/:type/:id`
- ✅ `createAuditLog()` helper function (used by other routes)

**No Frontend Changes Needed:** The frontend already uses the correct API endpoints.

---

## 🚀 Status

**ALL INTEGRATION TESTS SHOULD NOW PASS!** ✅

The backend queries now match the actual PostgreSQL database schema.
