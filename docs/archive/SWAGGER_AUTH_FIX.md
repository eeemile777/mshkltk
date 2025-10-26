# 🔧 Swagger UI Authorization Fix

## The Issue
Your token is VALID (I tested it with curl and it works), but Swagger UI isn't sending it correctly.

## ✅ Solution: Refresh and Re-authorize

### Step 1: Refresh Swagger UI
1. **Close the Swagger UI browser tab**
2. **Reopen:** http://localhost:3001/api-docs

### Step 2: Login FRESH
1. Find **POST /api/auth/login**
2. Click "Try it out"
3. Enter:
   ```json
   {
     "username": "miloadmin",
     "password": "admin123"
   }
   ```
4. Click "Execute"
5. **You'll get a response with a token - COPY THE ENTIRE TOKEN**

### Step 3: Authorize (DO THIS IMMEDIATELY)
1. **BEFORE testing any other endpoint**, scroll to the TOP
2. Click the **Authorize** button (top-right)
3. Paste **ONLY THE TOKEN** (without "Bearer")
   - ❌ WRONG: `Bearer eyJhbGci...`
   - ✅ CORRECT: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   
   **Wait, actually Swagger UI needs "Bearer"!** Let me check...

Actually, based on the Swagger config, you should enter JUST the token (Swagger adds "Bearer" automatically).

4. Click "Authorize"
5. Click "Close"
6. ✅ You should see a 🔒 lock icon

### Step 4: Test AI Endpoint
1. Find **POST /api/ai/analyze-media**
2. Click "Try it out"
3. Click "Choose File"
4. Select your image
5. Enter language: `en`
6. Enter categories: `Lighting,Roads,Water,Waste`
7. Click "Execute"

---

## 🧪 Alternative: Use curl Instead

If Swagger UI keeps failing, use this curl command:

```bash
# 1. Login first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"miloadmin","password":"admin123"}'

# 2. Copy the token from the response

# 3. Test AI municipality detection
curl -X POST http://localhost:3001/api/ai/detect-municipality \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"latitude":33.5731,"longitude":-7.5898}'
```

This works 100% (I just tested it).

---

## 📋 Confirmed Working Token

I just tested this and it WORKS:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImI5ZDc1ZWU5LTQ4YmEtNDRmZC1hNDJjLTQ4ZTJhNzQ0NDZlZSIsInVzZXJuYW1lIjoibWlsb2FkbWluIiwicm9sZSI6InN1cGVyX2FkbWluIiwibXVuaWNpcGFsaXR5X2lkIjoiYWxsIiwicG9ydGFsX2FjY2Vzc19sZXZlbCI6InJlYWRfd3JpdGUiLCJpYXQiOjE3NjEwNzk5NjAsImV4cCI6MTc2MTY4NDc2MH0.SIQVlOxfiAqgVaDjd6qF-TsMdpNZq83pnGoHrr4Q6Tk
```

**Use this token in Swagger UI:**
1. Click Authorize
2. Paste JUST that token (no "Bearer")
3. Click Authorize
4. Test your endpoint

---

## 🔍 Debug Checklist

If it STILL doesn't work:

1. ✅ Server is running (confirmed: http://localhost:3001)
2. ✅ Login works (confirmed: token generated)
3. ✅ Token is valid (confirmed: works with curl)
4. ❓ Swagger UI authorization?

**Try this:**
- Open browser DevTools (F12)
- Go to Network tab
- Click "Execute" on the AI endpoint
- Look at the request headers
- Do you see `Authorization: Bearer eyJhbGci...`?
- If NOT, that's the problem!

---

## 💡 The Real Issue

Swagger UI might not be persisting the authorization across page reloads or between different endpoints.

**Solution:**
1. Refresh Swagger UI page
2. Login immediately
3. Authorize immediately (before testing anything else)
4. Then test AI endpoint

If this doesn't work, just use curl - it works perfectly! 🚀
