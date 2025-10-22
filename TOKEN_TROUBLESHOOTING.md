# 🔧 Token Troubleshooting Guide

## Error: "Invalid or expired token"

This means your JWT authentication token is either:
1. Expired (tokens typically last 24 hours or 7 days)
2. Not properly formatted
3. Not set in Swagger UI's Authorization

---

## ✅ Solution: Get a Fresh Token

### Step 1: Login Again

1. **Open Swagger UI:** http://localhost:3001/api-docs
2. Find **POST /api/auth/login**
3. Click **"Try it out"**
4. Enter credentials:
   ```json
   {
     "username": "miloadmin",
     "password": "admin123"
   }
   ```
5. Click **"Execute"**
6. **Copy the ENTIRE token** from the response (the long string after `"token":`)

### Step 2: Authorize Swagger UI

1. Scroll to top of Swagger UI
2. Click **🔓 Authorize** button (top-right)
3. In the "Value" field, enter:
   ```
   Bearer YOUR_TOKEN_HERE
   ```
   **Example:**
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI5ZDc1ZWU5...
   ```
   **⚠️ CRITICAL:** Must have the word "Bearer" followed by a space, then the token!

4. Click **"Authorize"**
5. Click **"Close"**
6. ✅ You should see a **🔒 lock icon**

### Step 3: Test Again

Now try your endpoint again!

---

## 🔍 Common Mistakes

### ❌ WRONG - Token without "Bearer":
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ❌ WRONG - "Bearer" with no space:
```
BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ✅ CORRECT - "Bearer" + space + token:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 How to Check Token Expiration

Your token contains an expiration timestamp. If you see this error:
- Token has expired
- You need to login again
- Copy the new token
- Re-authorize Swagger UI

**Tokens typically last:**
- Development: 7 days
- Production: 24 hours

---

## 🆘 Still Not Working?

### Check These:

1. **Is the server running?**
   ```bash
   curl http://localhost:3001/api/media/status
   ```
   Should return: `{"configured":false,"message":"Cloud Storage is not configured..."}`

2. **Did you click Authorize button?**
   - Look for 🔒 lock icon (means authorized)
   - Look for 🔓 unlocked icon (means NOT authorized)

3. **Are you testing the right endpoint?**
   - Only these work WITHOUT authentication:
     - POST /api/auth/register
     - POST /api/auth/login
     - GET /api/media/status
   - ALL other endpoints REQUIRE authentication

4. **Check the Authorization header format:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try the API call
   - Check the request headers
   - Should see: `Authorization: Bearer eyJhbGci...`

---

## 🎯 Quick Test Commands

### Test 1: Check if server is running
```bash
curl http://localhost:3001/api/media/status
```

### Test 2: Login and get token
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"miloadmin","password":"admin123"}'
```

### Test 3: Use token (replace YOUR_TOKEN)
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Full Workflow (Step by Step)

1. ✅ **Login** → Get token
2. ✅ **Copy token** → The long string
3. ✅ **Click 🔓 Authorize** → Opens dialog
4. ✅ **Type `Bearer `** → Space after Bearer
5. ✅ **Paste token** → After the space
6. ✅ **Click Authorize** → Bottom of dialog
7. ✅ **Click Close** → Dialog closes
8. ✅ **See 🔒 lock icon** → You're authenticated!
9. ✅ **Test any endpoint** → Should work now!

---

## 💡 Pro Tip: Token Expires?

If you're testing for a long time and suddenly get "Invalid or expired token":

1. **Don't panic!** Just login again
2. Get a fresh token
3. Re-authorize Swagger UI
4. Continue testing

**Tokens are time-based for security.** This is normal behavior.

---

**Try logging in again now and get a fresh token!** 🚀
