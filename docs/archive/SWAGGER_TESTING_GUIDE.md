# 🧪 Swagger UI Interactive Testing Guide

**URL:** http://localhost:3001/api-docs

---

## ✅ Your Swagger is READY for Interactive Testing!

Your Swagger UI has **everything needed** for interactive testing:
- ✅ Request body schemas with examples
- ✅ Response schemas with examples
- ✅ Parameter descriptions
- ✅ Authentication support
- ✅ "Try it out" buttons on all endpoints
- ✅ Pre-filled example values

---

## 🚀 Step-by-Step Testing Guide

### Phase 1: Authentication Flow (No Auth Required)

#### 1️⃣ Register a New User

1. Open http://localhost:3001/api-docs
2. Find **Auth** section
3. Click **POST /api/auth/register**
4. Click **"Try it out"** button
5. You'll see pre-filled example:
   ```json
   {
     "username": "john_doe",
     "password": "securePass123",
     "first_name": "John",
     "last_name": "Doe",
     "role": "citizen"
   }
   ```
6. **Modify the values** (use your own username)
7. Click **"Execute"**
8. ✅ You should get **201 Created** response

**Example Request:**
```json
{
  "username": "testuser123",
  "password": "MyPassword123!",
  "first_name": "Test",
  "last_name": "User",
  "role": "citizen"
}
```

---

#### 2️⃣ Login to Get JWT Token

1. Find **POST /api/auth/login**
2. Click **"Try it out"**
3. Pre-filled example:
   ```json
   {
     "username": "john_doe",
     "password": "securePass123"
   }
   ```
4. **Change to YOUR username/password** from step 1
5. Click **"Execute"**
6. ✅ You should get **200 OK** with a response like:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "username": "testuser123",
       "role": "citizen"
     }
   }
   ```
7. **📋 COPY THE TOKEN** (the long string after "token":)

---

#### 3️⃣ Authorize Swagger UI

1. Scroll to top of Swagger UI
2. Click the **🔓 Authorize** button (top right)
3. A dialog will appear
4. In the "Value" field, type: `Bearer YOUR_TOKEN_HERE`
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Click **"Authorize"**
6. Click **"Close"**
7. ✅ You'll see a **🔒 lock icon** - you're now authenticated!

---

### Phase 2: Test Protected Endpoints

Now you can test ALL protected endpoints!

#### 4️⃣ Test Config Endpoints (No Database Setup Needed)

##### Get Categories
1. Find **GET /api/config/categories**
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ Should return: `{ "categories": [] }` (empty if no DB tables)

##### Get Badges
1. Find **GET /api/config/badges**
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ Should return: `{ "badges": [] }`

##### Get Gamification Settings
1. Find **GET /api/config/gamification**
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ Should return default values:
   ```json
   {
     "points_per_report": 10,
     "points_per_confirmation": 5,
     "points_per_comment": 2,
     "points_per_resolution": 20
   }
   ```

---

#### 5️⃣ Test AI Endpoints (Requires GEMINI_API_KEY)

##### Detect Municipality
1. Find **POST /api/ai/detect-municipality**
2. Click **"Try it out"**
3. Pre-filled example:
   ```json
   {
     "latitude": 33.5731,
     "longitude": -7.5898
   }
   ```
4. Click **"Execute"**
5. ✅ Should return (even without Gemini key, uses OpenStreetMap):
   ```json
   {
     "municipality": "Casablanca",
     "region": "Casablanca-Settat",
     "address": "Boulevard Mohammed V, Casablanca, Morocco"
   }
   ```

##### Analyze Media (Requires Gemini API Key)
1. Find **POST /api/ai/analyze-media**
2. Click **"Try it out"**
3. You'll need base64 image data (or you'll get an error)
4. If no GEMINI_API_KEY set, you'll get:
   ```json
   {
     "error": "AI service not configured",
     "message": "GEMINI_API_KEY environment variable not set"
   }
   ```

---

#### 6️⃣ Test Reports Endpoints

##### Create a Report
1. Find **POST /api/reports**
2. Click **"Try it out"**
3. Pre-filled example:
   ```json
   {
     "title": "Broken streetlight",
     "description": "Light has been out for 3 days",
     "category": "Lighting",
     "municipality": "Casablanca",
     "location": {
       "type": "Point",
       "coordinates": [-7.5898, 33.5731]
     },
     "address": "123 Main St",
     "photo_urls": []
   }
   ```
4. Click **"Execute"**
5. ✅ Should return **201 Created** with the new report

##### Get All Reports
1. Find **GET /api/reports**
2. Click **"Try it out"**
3. You'll see optional query parameters:
   - `status` - Filter by status (open, in_progress, resolved)
   - `category` - Filter by category
   - `municipality` - Filter by municipality
   - `page` - Page number (default: 1)
   - `limit` - Items per page (default: 50)
4. Click **"Execute"**
5. ✅ Should return list of reports

##### Get Nearby Reports (PostGIS)
1. Find **GET /api/reports/nearby**
2. Click **"Try it out"**
3. Enter values:
   - `lat`: 33.5731
   - `lng`: -7.5898
   - `radius`: 5000 (meters)
4. Click **"Execute"**
5. ✅ Should return reports within 5km radius

---

#### 7️⃣ Test Comments Endpoints

##### Add Comment to Report
1. First, get a report ID from step 6
2. Find **POST /api/comments**
3. Click **"Try it out"**
4. Pre-filled example:
   ```json
   {
     "report_id": 1,
     "text": "I can confirm this issue"
   }
   ```
5. **Change `report_id` to your actual report ID**
6. Click **"Execute"**
7. ✅ Should return **201 Created**

##### Get Comments for a Report
1. Find **GET /api/comments/report/{reportId}**
2. Click **"Try it out"**
3. Enter your report ID
4. Click **"Execute"**
5. ✅ Should return all comments for that report

---

#### 8️⃣ Test User Endpoints

##### Get Current User
1. Find **GET /api/users/me**
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ Should return your user profile:
   ```json
   {
     "id": 1,
     "username": "testuser123",
     "email": "test@example.com",
     "role": "citizen",
     "total_points": 0,
     "reports_count": 1
   }
   ```

##### Update Profile
1. Find **PATCH /api/users/me**
2. Click **"Try it out"**
3. Example:
   ```json
   {
     "full_name": "Updated Name",
     "email": "newemail@example.com"
   }
   ```
4. Click **"Execute"**
5. ✅ Should return updated user

---

#### 9️⃣ Test Notifications

##### Get Notifications
1. Find **GET /api/notifications**
2. Click **"Try it out"**
3. Optional parameters:
   - `page`: 1
   - `limit`: 50
4. Click **"Execute"**
5. ✅ Should return your notifications

##### Get Unread Count
1. Find **GET /api/notifications/unread-count**
2. Click **"Try it out"**
3. Click **"Execute"**
4. ✅ Should return: `{ "unread_count": 0 }`

---

#### 🔟 Test Report Actions

##### Confirm a Report
1. Find **POST /api/reports/{id}/confirm**
2. Click **"Try it out"**
3. Enter a report ID (not your own!)
4. Click **"Execute"**
5. ✅ Should return success with updated confirmations

##### Subscribe to Report
1. Find **POST /api/reports/{id}/subscribe**
2. Click **"Try it out"**
3. Enter a report ID
4. Click **"Execute"**
5. ✅ Should return success message

---

### Phase 3: Test Upload Endpoints

#### Upload Single Media
1. Find **POST /api/media/upload**
2. Click **"Try it out"**
3. Pre-filled example:
   ```json
   {
     "data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
     "folder": "reports"
   }
   ```
4. For testing, use a small base64 image
5. Click **"Execute"**
6. ✅ Should return URL (or base64 if cloud not configured)

---

## 🎯 What to Look For

### ✅ Successful Responses
- **200 OK** - Request successful
- **201 Created** - Resource created
- **204 No Content** - Success, no content returned

### ❌ Error Responses
- **400 Bad Request** - Missing required fields or invalid data
- **401 Unauthorized** - No token or invalid token
- **403 Forbidden** - Valid token but insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **500 Server Error** - Backend error

---

## 🔧 Common Issues & Solutions

### Issue: "Unauthorized" errors
**Solution:** Click the 🔓 Authorize button and enter: `Bearer YOUR_TOKEN`

### Issue: Token expired
**Solution:** Login again to get a new token

### Issue: "AI service not configured"
**Solution:** Add `GEMINI_API_KEY` to your `.env` file

### Issue: Database errors
**Solution:** Create the required database tables (see `ALL_TASKS_COMPLETE.md`)

### Issue: Can't confirm own report
**Solution:** This is intentional - you can only confirm reports created by OTHER users

---

## 📊 Testing Checklist

Use this checklist to verify all functionality:

### Auth Endpoints
- [ ] Register new user
- [ ] Login and get token
- [ ] Verify token

### Report Endpoints
- [ ] Create report
- [ ] Get all reports
- [ ] Get nearby reports
- [ ] Get single report
- [ ] Confirm report (different user)
- [ ] Subscribe to report
- [ ] Unsubscribe from report

### Comment Endpoints
- [ ] Add comment
- [ ] Get comments for report
- [ ] Edit comment (your own)
- [ ] Delete comment (your own)

### User Endpoints
- [ ] Get current user profile
- [ ] Get user by ID
- [ ] Update profile
- [ ] Get leaderboard

### Notification Endpoints
- [ ] Get notifications
- [ ] Get unread count
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification

### Config Endpoints
- [ ] Get categories
- [ ] Get badges
- [ ] Get gamification settings

### AI Endpoints
- [ ] Detect municipality (works without API key)
- [ ] Analyze media (needs API key)
- [ ] Transcribe audio (needs API key)
- [ ] Generate title (needs API key)

### Media Endpoints
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Check storage status

---

## 🎓 Tips for Effective Testing

1. **Start with Auth** - Always register and login first
2. **Copy the Token** - Keep it handy in a text file
3. **Test in Order** - Create reports before commenting on them
4. **Use Real Data** - Don't just use default examples
5. **Test Error Cases** - Try missing fields, wrong IDs, etc.
6. **Check Responses** - Verify the data matches what you sent
7. **Test Permissions** - Try actions with different user roles

---

## 🚀 Advanced Testing

### Test Full User Flow
1. Register → Login → Get Token
2. Create Report with photos
3. Subscribe to report
4. Add comment (triggers notification)
5. Confirm someone else's report (gain points)
6. Check notifications
7. Update profile
8. View leaderboard

### Test Portal Admin Flow
1. Register as portal_admin
2. Login and get token
3. Update report status to "in_progress"
4. Add portal notes
5. Mark as resolved with proof photo
6. View all users

---

**Your Swagger UI is FULLY READY for interactive testing!** 🎉

**Next Steps:**
1. Open http://localhost:3001/api-docs
2. Click "Try it out" on any endpoint
3. Modify the example values
4. Click "Execute"
5. See real responses!

All endpoints have:
✅ Example request bodies  
✅ Example responses  
✅ Parameter descriptions  
✅ Authentication support  
✅ Error response examples  

**Start testing now!** 🚀
