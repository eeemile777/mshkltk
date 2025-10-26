# 🔐 Quick Authentication Guide for Swagger UI

## ⚠️ Error: "No token provided"

This error means you're trying to access a protected endpoint without authentication.

---

## ✅ Solution: Login First!

### Step 1: Register a Test User (If you don't have one)

1. **Open Swagger UI:** http://localhost:3001/api-docs
2. Find **`POST /api/auth/register`** (under "Auth" section)
3. Click **"Try it out"**
4. You'll see this example:
   ```json
   {
     "username": "john_doe",
     "password": "securePass123",
     "first_name": "John",
     "last_name": "Doe",
     "role": "citizen"
   }
   ```
5. **Modify it** (use your own username):
   ```json
   {
     "username": "testuser",
     "password": "Test123!",
     "first_name": "Test",
     "last_name": "User",
     "role": "citizen"
   }
   ```
6. Click **"Execute"**
7. ✅ You should get **201 Created** response

---

### Step 2: Login to Get Token

1. Find **`POST /api/auth/login`** (under "Auth" section)
2. Click **"Try it out"**
3. Enter your credentials:
   ```json
   {
     "username": "testuser",
     "password": "Test123!"
   }
   ```
4. Click **"Execute"**
5. ✅ You'll get a response like:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJjaXRpemVuIiwiaWF0IjoxNzI5NTM2MDAwfQ.xxxxxxxxxxx",
     "user": {
       "id": 1,
       "username": "testuser",
       "role": "citizen"
     }
   }
   ```

6. **📋 COPY THE ENTIRE TOKEN** (the long string after `"token":`)

---

### Step 3: Authorize Swagger UI

1. **Scroll to the top** of Swagger UI
2. Click the **🔓 Authorize** button (top-right corner)
3. You'll see a dialog box with a text field labeled "Value"
4. Type: `Bearer ` (with a space) followed by your token:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJjaXRpemVuIiwiaWF0IjoxNzI5NTM2MDAwfQ.xxxxxxxxxxx
   ```
   **IMPORTANT:** Make sure there's a space between "Bearer" and the token!

5. Click **"Authorize"**
6. Click **"Close"**
7. ✅ You'll see a **🔒 lock icon** next to the Authorize button - **you're now authenticated!**

---

### Step 4: Test File Upload

Now all protected endpoints will work!

1. Find **`POST /api/media/upload`**
2. Click **"Try it out"**
3. **Select `multipart/form-data` tab**
4. Click **"Choose File"**
5. Select a photo from your computer
6. Click **"Execute"**
7. ✅ Success! You'll get:
   ```json
   {
     "url": "data:image/jpeg;base64,/9j/4AAQ...",
     "filename": "my-photo.jpg",
     "mimetype": "image/jpeg",
     "size": 123456
   }
   ```

---

## 🚀 Quick Test Flow (Copy & Paste)

### Option A: Use Default Admin Account (If database is set up)

**Login:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Or SuperAdmin:**
```json
{
  "username": "superadmin",
  "password": "superadmin123"
}
```

---

### Option B: Create Your Own Account

**1. Register:**
```json
{
  "username": "myuser",
  "password": "MyPassword123!",
  "first_name": "My",
  "last_name": "User",
  "role": "citizen"
}
```

**2. Login:**
```json
{
  "username": "myuser",
  "password": "MyPassword123!"
}
```

**3. Copy token from response**

**4. Authorize: `Bearer YOUR_TOKEN_HERE`**

---

## 🔑 Token Format

❌ **WRONG:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **CORRECT:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** The word "Bearer" followed by a **space** followed by the token.

---

## 🎯 Endpoints That DON'T Require Authentication

Only these endpoints work without a token:

- ✅ **POST /api/auth/register** - Create new account
- ✅ **POST /api/auth/login** - Get token
- ✅ **GET /api/media/status** - Check cloud storage status

**All other endpoints require authentication!**

---

## 🧪 Testing Checklist

### Before File Upload:
- [ ] Register a user account
- [ ] Login and get token
- [ ] Copy the entire token
- [ ] Click 🔓 Authorize button
- [ ] Enter `Bearer YOUR_TOKEN`
- [ ] Click Authorize
- [ ] See 🔒 lock icon

### After Authentication:
- [ ] Try POST /api/media/upload
- [ ] Upload a real photo
- [ ] Get successful response
- [ ] Try POST /api/media/upload-multiple
- [ ] Upload multiple photos
- [ ] Try POST /api/ai/analyze-media
- [ ] Upload photo and get AI analysis

---

## ⏰ Token Expiration

**Tokens expire after 24 hours** (or as configured in your backend).

If you get `401 Unauthorized` after it was working:
1. Login again to get a new token
2. Click 🔓 Authorize again
3. Enter the new token
4. Continue testing

---

## 🆘 Troubleshooting

### "No token provided"
- **Cause:** You didn't authorize Swagger UI
- **Solution:** Follow Step 3 above (Authorize)

### "Invalid token"
- **Cause:** Token format is wrong or expired
- **Solution:** Make sure you have `Bearer ` (with space) before token

### "Unauthorized"
- **Cause:** Token expired or user doesn't have permission
- **Solution:** Login again to get fresh token

### "Forbidden"
- **Cause:** Your user role doesn't have permission
- **Solution:** Use admin or superadmin account for admin endpoints

---

## 📝 Example Full Workflow

**Copy and paste these commands in Swagger UI:**

### 1. Register (POST /api/auth/register)
```json
{
  "username": "phototest",
  "password": "Photo123!",
  "first_name": "Photo",
  "last_name": "Tester",
  "role": "citizen"
}
```

### 2. Login (POST /api/auth/login)
```json
{
  "username": "phototest",
  "password": "Photo123!"
}
```

### 3. Copy token from response, then:
- Click 🔓 Authorize
- Enter: `Bearer eyJhbGci...` (your actual token)
- Click Authorize

### 4. Upload Photo (POST /api/media/upload)
- Select `multipart/form-data` tab
- Choose a file
- Execute

### 5. Create Report (POST /api/reports)
```json
{
  "title": "Test Report with Photo",
  "description": "Testing file upload feature",
  "category": "Other",
  "municipality": "Casablanca",
  "location": {
    "type": "Point",
    "coordinates": [-7.5898, 33.5731]
  },
  "address": "Test Street",
  "photo_urls": ["PUT_THE_URL_FROM_STEP_4_HERE"]
}
```

---

## ✅ You're Ready!

Once you see the 🔒 lock icon next to the Authorize button, you can test **ALL** endpoints including file uploads!

**Start here:** http://localhost:3001/api-docs

1. POST /api/auth/register → Create account
2. POST /api/auth/login → Get token  
3. 🔓 Authorize → Enter `Bearer TOKEN`
4. POST /api/media/upload → Upload files!

🚀 **Happy Testing!**
