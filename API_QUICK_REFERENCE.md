# 📖 API Endpoint Quick Reference

**Last Updated:** October 21, 2025  
**Total Endpoints:** 33  
**Base URL:** `http://localhost:3001`

---

## 🔐 Authentication (3)

### POST /api/auth/register
Create new user account
```json
Request:
{
  "username": "string (required, unique)",
  "email": "string (required, unique, email format)",
  "password": "string (required, min 6 chars)",
  "full_name": "string (required)",
  "phone": "string (optional)"
}

Response: 201
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "citizen",
  "total_points": 0
}
```

### POST /api/auth/login
Authenticate user and receive JWT
```json
Request:
{
  "username": "string (required)",
  "password": "string (required)"
}

Response: 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "citizen"
  }
}
```

### POST /api/auth/verify
Verify JWT token validity
```http
Authorization: Bearer <token>

Response: 200
{
  "valid": true,
  "user": {
    "userId": 1,
    "role": "citizen",
    "iat": 1729526400,
    "exp": 1729612800
  }
}
```

---

## 📝 Reports (10)

### POST /api/reports
Create new report
```http
Authorization: Bearer <token>

Request:
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "municipality": "string (required)",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "address": "string (optional)",
  "photo_urls": ["string"] (optional, max 5)
}

Response: 201
{
  "id": 123,
  "title": "Broken streetlight",
  "status": "open",
  "created_by": 1,
  "created_at": "2025-10-21T10:30:00Z"
}
```

### GET /api/reports
List and filter reports
```http
Query Params:
?status=open|in_progress|resolved|rejected
&category=<category_name>
&municipality=<municipality_name>
&created_by=<user_id>
&start_date=2025-01-01
&end_date=2025-12-31
&page=1
&limit=50

Response: 200
{
  "reports": [
    {
      "id": 123,
      "title": "Broken streetlight",
      "status": "open",
      "category": "Lighting",
      "municipality": "Casablanca",
      "confirmations": 5,
      "created_at": "2025-10-21T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "totalPages": 5
  }
}
```

### GET /api/reports/nearby
Geospatial search (PostGIS)
```http
Query Params:
?lat=33.5731 (required)
&lng=-7.5898 (required)
&radius=5000 (optional, default 5000m)
&page=1
&limit=50

Response: 200
{
  "reports": [
    {
      "id": 123,
      "title": "Broken streetlight",
      "distance": 245.67, // meters
      "location": {
        "type": "Point",
        "coordinates": [-7.5898, 33.5731]
      }
    }
  ]
}
```

### GET /api/reports/stats
Aggregate statistics
```http
Response: 200
{
  "total_reports": 1234,
  "by_status": {
    "open": 450,
    "in_progress": 230,
    "resolved": 500,
    "rejected": 54
  },
  "by_category": {
    "Lighting": 234,
    "Roads": 456,
    "Water": 123
  },
  "by_municipality": {
    "Casablanca": 567,
    "Rabat": 345
  }
}
```

### GET /api/reports/:id
Get single report with full details
```http
Response: 200
{
  "id": 123,
  "title": "Broken streetlight",
  "description": "Light at Main St is out",
  "status": "open",
  "category": "Lighting",
  "municipality": "Casablanca",
  "location": {
    "type": "Point",
    "coordinates": [-7.5898, 33.5731]
  },
  "address": "123 Main St",
  "photo_urls": ["https://..."],
  "confirmations": 5,
  "created_by": {
    "id": 1,
    "username": "john_doe",
    "full_name": "John Doe"
  },
  "created_at": "2025-10-21T10:30:00Z",
  "updated_at": "2025-10-21T11:00:00Z"
}
```

### PATCH /api/reports/:id
Update report (Portal Admin only with write access)
```http
Authorization: Bearer <token>

Request:
{
  "status": "in_progress|resolved|rejected",
  "portal_notes": "string (optional)",
  "resolution_proof": ["string"] (optional, for resolved status)
}

Response: 200
{
  "id": 123,
  "status": "resolved",
  "portal_notes": "Fixed on 2025-10-21",
  "updated_by": 5
}
```

### POST /api/reports/:id/confirm
Confirm report (cannot confirm own)
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Report confirmed successfully",
  "confirmations": 6,
  "points_awarded": 5
}

Error: 400
{
  "error": "Cannot confirm your own report"
}
```

### POST /api/reports/:id/subscribe
Subscribe to report updates
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Subscribed to report successfully"
}
```

### DELETE /api/reports/:id/subscribe
Unsubscribe from report
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Unsubscribed successfully"
}
```

### DELETE /api/reports/:id
Delete report (Super Admin only, cascade)
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Report deleted successfully"
}
```

---

## 💬 Comments (5)

### POST /api/comments
Add comment (notifies all subscribers)
```http
Authorization: Bearer <token>

Request:
{
  "report_id": 123,
  "text": "string (required)"
}

Response: 201
{
  "id": 456,
  "report_id": 123,
  "user_id": 1,
  "text": "I can confirm this issue",
  "created_at": "2025-10-21T10:30:00Z"
}
```

### GET /api/comments/report/:reportId
List all comments for report
```http
Response: 200
{
  "comments": [
    {
      "id": 456,
      "text": "I can confirm this issue",
      "user": {
        "id": 1,
        "username": "john_doe",
        "full_name": "John Doe"
      },
      "created_at": "2025-10-21T10:30:00Z"
    }
  ]
}
```

### GET /api/comments/:id
Get single comment
```http
Response: 200
{
  "id": 456,
  "report_id": 123,
  "text": "I can confirm this issue",
  "user_id": 1,
  "created_at": "2025-10-21T10:30:00Z"
}
```

### PATCH /api/comments/:id
Edit comment (author only)
```http
Authorization: Bearer <token>

Request:
{
  "text": "string (required)"
}

Response: 200
{
  "id": 456,
  "text": "Updated comment text",
  "edited": true,
  "updated_at": "2025-10-21T11:00:00Z"
}
```

### DELETE /api/comments/:id
Delete comment (author or admin)
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Comment deleted successfully"
}
```

---

## 👥 Users (6)

### GET /api/users/me
Get current authenticated user
```http
Authorization: Bearer <token>

Response: 200
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "citizen",
  "total_points": 150,
  "badges": [
    {
      "id": 1,
      "name": "First Report",
      "icon": "🏅",
      "earned_at": "2025-10-01T10:00:00Z"
    }
  ],
  "reports_count": 12
}
```

### GET /api/users/:id
Get public user profile
```http
Response: 200
{
  "id": 1,
  "username": "john_doe",
  "full_name": "John Doe",
  "total_points": 150,
  "badges": [...],
  "reports_count": 12,
  "joined_at": "2025-09-01T10:00:00Z"
}
```

### PATCH /api/users/me
Update own profile
```http
Authorization: Bearer <token>

Request:
{
  "email": "string (optional)",
  "full_name": "string (optional)",
  "phone": "string (optional)",
  "password": "string (optional, min 6 chars)",
  "avatar_url": "string (optional)"
}

Response: 200
{
  "id": 1,
  "email": "newemail@example.com",
  "full_name": "John Updated Doe"
}
```

### GET /api/users/leaderboard
Get ranked users by points
```http
Query Params:
?page=1
&limit=100

Response: 200
{
  "leaderboard": [
    {
      "rank": 1,
      "id": 5,
      "username": "super_citizen",
      "full_name": "Super Citizen",
      "total_points": 5000,
      "badges_count": 15,
      "reports_count": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 500
  }
}
```

### GET /api/users/portal/all
Get all users (Super Admin only)
```http
Authorization: Bearer <token>

Query Params:
?page=1
&limit=50

Response: 200
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "citizen",
      "portal_access_level": null,
      "total_points": 150,
      "created_at": "2025-09-01T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### DELETE /api/users/:id
Delete user (Super Admin only)
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "User deleted successfully"
}
```

---

## 🔔 Notifications (6)

### GET /api/notifications
List user notifications
```http
Authorization: Bearer <token>

Query Params:
?page=1
&limit=50

Response: 200
{
  "notifications": [
    {
      "id": 789,
      "type": "comment",
      "title": "New comment on your report",
      "message": "John Doe commented: 'I can confirm this'",
      "is_read": false,
      "related_id": 123,
      "created_at": "2025-10-21T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /api/notifications/unread-count
Get unread notification count
```http
Authorization: Bearer <token>

Response: 200
{
  "unread_count": 5
}
```

### PATCH /api/notifications/:id/read
Mark single notification as read
```http
Authorization: Bearer <token>

Response: 200
{
  "id": 789,
  "is_read": true
}
```

### POST /api/notifications/mark-all-read
Mark all notifications as read
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

### DELETE /api/notifications/:id
Delete single notification
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "Notification deleted successfully"
}
```

### DELETE /api/notifications
Delete all notifications
```http
Authorization: Bearer <token>

Response: 200
{
  "message": "All notifications deleted",
  "deleted_count": 12
}
```

---

## 📸 Media (3)

### POST /api/media/upload
Upload single file (base64)
```http
Authorization: Bearer <token>

Request:
{
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "folder": "reports|profiles|proofs"
}

Response: 200
{
  "url": "https://s3.amazonaws.com/mshkltk/reports/abc123.jpg"
}

Response (fallback): 503
{
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "message": "Cloud storage unavailable, returning base64"
}
```

### POST /api/media/upload-multiple
Batch upload (max 5 files)
```http
Authorization: Bearer <token>

Request:
{
  "files": [
    {
      "data": "data:image/jpeg;base64,...",
      "folder": "reports"
    },
    {
      "data": "data:image/png;base64,...",
      "folder": "reports"
    }
  ]
}

Response: 200
{
  "urls": [
    "https://s3.amazonaws.com/mshkltk/reports/abc123.jpg",
    "https://s3.amazonaws.com/mshkltk/reports/def456.png"
  ]
}
```

### GET /api/media/status
Check cloud storage configuration
```http
Response: 200
{
  "cloudStorageEnabled": true,
  "provider": "aws-s3",
  "bucket": "mshkltk-media"
}

Response: 200
{
  "cloudStorageEnabled": false,
  "fallback": "base64"
}
```

---

## 🔑 Authentication Headers

All protected endpoints require:
```http
Authorization: Bearer <jwt_token>
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input/validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Cloud storage unavailable (media fallback) |

---

## 🎯 Common Workflows

### Create Report with Photos
```javascript
// 1. Upload photos
const { urls } = await POST('/api/media/upload-multiple', {
  files: [
    { data: 'data:image/jpeg;base64,...', folder: 'reports' }
  ]
});

// 2. Create report with photo URLs
const report = await POST('/api/reports', {
  title: 'Broken streetlight',
  description: 'Light is out',
  category: 'Lighting',
  municipality: 'Casablanca',
  location: { type: 'Point', coordinates: [-7.5898, 33.5731] },
  photo_urls: urls
});
```

### Subscribe and Comment
```javascript
// 1. Subscribe to report
await POST('/api/reports/123/subscribe');

// 2. Add comment
await POST('/api/comments', {
  report_id: 123,
  text: 'I can confirm this issue'
});

// 3. All subscribers (including you) get notification
```

### Portal Admin Update Report
```javascript
// Update status to resolved
await PATCH('/api/reports/123', {
  status: 'resolved',
  portal_notes: 'Repaired on 2025-10-21',
  resolution_proof: ['https://...proof-photo.jpg']
});
// All subscribers get notification
```

---

**Documentation Version:** 1.0  
**Swagger UI:** http://localhost:3001/api-docs  
**Coverage:** 100% (33/33 endpoints)
