# 🚀 Security Fixes Migration Guide

**Date:** November 16, 2025  
**Status:** ✅ All Critical & High Priority Fixes Implemented  
**Estimated Migration Time:** 30 minutes

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Environment Variables (CRITICAL)

Create or update your `.env` file based on `.env.example`:

```bash
# Copy example file
cp .env.example .env

# Edit .env and set these REQUIRED variables:
# - JWT_SECRET (generate with: openssl rand -base64 32)
# - GEMINI_API_KEY
# - DB_PASSWORD
# - ALLOWED_ORIGINS (your production domain)
```

**⚠️ IMPORTANT:** The app will **exit immediately** if `JWT_SECRET` is not set.

---

### 2. Install New Dependencies

```bash
cd server
npm install helmet express-rate-limit express-validator node-cache --save
cd ..
```

---

### 3. Database Changes

No schema changes required! All fixes are backward-compatible.

---

### 4. Test in Development

```bash
# Start the application
npm run dev

# Run E2E tests to ensure nothing broke
npm test

# Test authentication rate limiting
# (try logging in 6 times with wrong password - 6th should fail)

# Test password complexity
# (try registering with weak password - should fail)
```

---

## 🔄 DEPLOYMENT STEPS

### Option A: Zero-Downtime Deployment (Recommended)

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
cd server && npm install && cd ..

# 3. Update .env with production values
# Set ALLOWED_ORIGINS to your production domain
# Set NODE_ENV=production

# 4. Restart server (graceful shutdown will kick in)
pm2 restart mshkltk-server
# OR
systemctl restart mshkltk

# 5. Verify deployment
curl -I https://your-domain.com/api/config/categories
# Should see X-Frame-Options, X-Content-Type-Options headers
```

### Option B: Manual Restart

```bash
# 1. Stop server
npm run stop  # or pm2 stop mshkltk-server

# 2. Pull code and install deps
git pull && cd server && npm install && cd ..

# 3. Update .env

# 4. Start server
npm run start  # or pm2 start mshkltk-server
```

---

## 🧪 POST-DEPLOYMENT VERIFICATION

### 1. Security Headers Check

```bash
curl -I https://your-domain.com/
```

Should see:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (if HTTPS)

### 2. CORS Check

```bash
# Should succeed from allowed origin
curl https://your-domain.com/api/reports \
  -H "Origin: https://your-frontend-domain.com"

# Should fail from unknown origin
curl https://your-domain.com/api/reports \
  -H "Origin: https://evil.com"
```

### 3. Rate Limiting Check

Try logging in 6 times with wrong credentials - 6th attempt should return:
```json
{
  "error": "Too many authentication attempts, please try again later"
}
```

### 4. Caching Check

```bash
# First request (cache miss)
time curl https://your-domain.com/api/config/categories

# Second request (cache hit - should be instant)
time curl https://your-domain.com/api/config/categories
```

### 5. Monitor Logs

```bash
# Check for any errors
pm2 logs mshkltk-server --lines 100

# OR
journalctl -u mshkltk -n 100 --follow
```

---

## 🔧 TROUBLESHOOTING

### Issue: "JWT_SECRET is required" error on startup

**Solution:** Set `JWT_SECRET` in your `.env` file:
```bash
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
```

### Issue: CORS errors in production

**Solution:** Update `ALLOWED_ORIGINS` in `.env`:
```bash
ALLOWED_ORIGINS=https://mshkltk.com,https://www.mshkltk.com
```

### Issue: "Cannot find module 'helmet'" error

**Solution:** Install dependencies:
```bash
cd server && npm install
```

### Issue: Rate limiting blocking legitimate users

**Solution:** Adjust rate limit in `server/routes/auth.js`:
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increase from 5 to 10
  // ...
});
```

### Issue: Cache not invalidating after data changes

**Solution:** Call `invalidateCache()` after mutations:
```javascript
const { invalidateCache } = require('../middleware/cache');

router.post('/categories', authMiddleware, async (req, res) => {
  // ... create category
  invalidateCache('categories'); // Clear cache
  res.json(newCategory);
});
```

---

## 📊 MONITORING RECOMMENDATIONS

### 1. Set Up Alerts

Monitor these metrics:
- Authentication failure rate (detect brute force)
- 5xx error rate (application errors)
- Database connection pool usage
- Cache hit rate
- Response times

### 2. Log Analysis

```bash
# Check authentication attempts
grep "Authentication attempts" logs/* | wc -l

# Check for CORS errors
grep "Not allowed by CORS" logs/*

# Check cache effectiveness
grep "Cache hit" logs/* | wc -l
grep "Cache miss" logs/* | wc -l
```

### 3. Security Scanning

```bash
# Run npm audit
cd server && npm audit

# Check for known vulnerabilities
npm audit fix

# Security headers check
curl -I https://your-domain.com | grep -E "X-|Strict"
```

---

## 🎯 ROLLBACK PLAN

If issues occur, rollback is safe:

```bash
# 1. Revert to previous git commit
git revert HEAD

# 2. Reinstall old dependencies
cd server && npm install && cd ..

# 3. Restart server
pm2 restart mshkltk-server
```

**Note:** All fixes are additive - no breaking changes to API or database.

---

## 📝 WHAT'S CHANGED FOR USERS

### Frontend Users
- **Password Requirements:** New registrations require stronger passwords (8+ chars, uppercase, lowercase, number)
- **Performance:** Report details load faster (single request vs. 3 separate)
- **Offline:** Better handling when storage is full

### API Consumers
- **CORS:** Requests from unauthorized domains now blocked
- **Rate Limiting:** Max 5 auth attempts per 15 minutes per IP
- **New Endpoint:** `GET /api/reports/:id/full` for combined data
- **Caching:** Static config endpoints cached for 10 minutes

### No Impact On
- Existing user accounts (all still work)
- Existing reports/comments/data
- E2E tests (all still pass)
- API contracts (backward compatible)

---

## 🎓 NEXT STEPS

After successful deployment:

1. ✅ Monitor logs for 24 hours
2. ✅ Run load tests to verify performance improvements
3. ✅ Update API documentation with new endpoint
4. ✅ Train support team on new password requirements
5. ✅ Consider implementing remaining deferred items:
   - Database migration system
   - Frontend context refactor
   - Unit tests
   - APM integration

---

## 📞 SUPPORT

If issues persist:
1. Check logs: `pm2 logs` or `journalctl -u mshkltk`
2. Verify `.env` file has all required variables
3. Test locally first: `npm run dev`
4. Review `SECURITY_FIXES_TRACKING.md` for details

**Good luck with deployment! 🚀**
