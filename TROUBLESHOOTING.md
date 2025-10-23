# Troubleshooting Guide

## White Screen / App Not Opening Issue - SOLVED ✅

### Problem
When opening http://localhost:3000 in the browser, you see a white screen or the page doesn't load.

### Root Cause
**The development servers were not running!**

Specifically:
- ❌ **Port 3000 (Vite frontend)** - Was NOT running
- ✅ **Port 3001 (Express backend)** - Was running, but isolated

### Solution

Always ensure BOTH servers are running before opening the app:

```bash
cd /Users/milo/Downloads/mshkltk_git/mshkltk
npm run dev
```

This command starts BOTH:
1. **Frontend (Vite)** on http://localhost:3000
2. **Backend (Express)** on http://localhost:3001

### How to Verify Servers Are Running

**Option 1: Check the terminal output**
You should see:
```
[dev-frontend]   ➜  Local:   http://localhost:3000/
[dev-backend] Backend server listening on http://localhost:3001
```

**Option 2: Check ports manually**
```bash
lsof -ti:3000  # Should show a process ID
lsof -ti:3001  # Should show a process ID
```

**Option 3: Test with curl**
```bash
curl http://localhost:3000  # Should return HTML
curl http://localhost:3001  # Should return "Mshkltk Backend is running!"
```

---

## Common Issues & Quick Fixes

### Issue 1: "Port already in use"
**Symptom:** Error message like `EADDRINUSE: address already in use :::3000`

**Fix:**
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000,3001 | xargs kill -9

# Then restart
npm run dev
```

### Issue 2: Backend keeps exiting with "clean exit"
**Symptom:** You see `[nodemon] clean exit - waiting for changes before restart`

**What it means:** The backend server started successfully and is now waiting. This is NORMAL! ✅

**Note:** The backend only shows activity when API requests come in.

### Issue 3: Frontend shows "Failed to fetch"
**Symptom:** White screen, console shows fetch errors

**Causes:**
1. Backend (port 3001) is not running
2. Database (PostgreSQL) is not running

**Fix:**
```bash
# 1. Check if database is running
docker ps | grep postgres

# 2. If not running, start it
docker start mshkltk-postgres

# 3. Restart dev servers
npm run dev
```

### Issue 4: Database connection errors
**Symptom:** Backend logs show "Connection refused" or "database does not exist"

**Fix:**
```bash
# 1. Check if PostgreSQL container is running
docker ps | grep postgres

# 2. If not running:
docker start mshkltk-postgres

# 3. If database doesn't exist, set it up:
./setup-database.sh

# 4. Seed with data:
./seed-database.sh
```

---

## Startup Checklist ✅

Before opening the app, ensure:

1. ✅ **PostgreSQL is running:**
   ```bash
   docker ps | grep postgres
   # Should show: mshkltk-postgres
   ```

2. ✅ **Dev servers are running:**
   ```bash
   npm run dev
   # Wait for both servers to show "ready"
   ```

3. ✅ **Both ports are active:**
   ```bash
   lsof -ti:3000,3001
   # Should show two process IDs
   ```

4. ✅ **Open browser:**
   ```
   http://localhost:3000
   ```

---

## Complete Fresh Start (Nuclear Option)

If nothing works, do a complete reset:

```bash
# 1. Kill all processes
lsof -ti:3000,3001 | xargs kill -9

# 2. Clear node modules and reinstall
rm -rf node_modules server/node_modules
npm install
cd server && npm install && cd ..

# 3. Restart database
docker restart mshkltk-postgres

# 4. Wait for database to be ready
sleep 3

# 5. Start dev servers
npm run dev

# 6. Wait for "ready" messages, then open:
#    http://localhost:3000
```

---

## Understanding the Dev Server Output

**Normal output when everything is working:**

```
[dev-frontend]   VITE v6.4.0  ready in 237 ms
[dev-frontend]   ➜  Local:   http://localhost:3000/

[dev-backend] Backend server listening on http://localhost:3001
[dev-backend] [nodemon] clean exit - waiting for changes before restart
```

✅ **This is perfect!** The backend "clean exit" means it's idle and waiting for requests.

**When you open http://localhost:3000**, you should see:
- The beautiful landing page with floating icons
- Arabic text: "مشكلتك - نحن نسمع"
- A pulsing logo

**If you see a white screen:**
1. Open browser DevTools (F12)
2. Check the Console tab for errors
3. Check the Network tab to see if API calls are failing
4. Most common issue: Backend not running or database not connected

---

## Test Credentials (After Seeding Database)

### Super Admin
```
Username: admin
Password: password
URL: http://localhost:3000/#/superadmin/login
```

### Portal Accounts
```
Beirut Portal:
Username: beirut_portal
Password: password
URL: http://localhost:3000/#/portal/login
```

### Citizen Users
```
Power User:
Username: ali_hassan
Password: password

New User:
Username: nadine_labaki
Password: password

URL: http://localhost:3000/#/auth/login
```

---

## Quick Commands Reference

```bash
# Start everything
npm run dev

# Kill servers
lsof -ti:3000,3001 | xargs kill -9

# Check if servers are running
lsof -ti:3000  # Frontend
lsof -ti:3001  # Backend

# Check database
docker ps | grep postgres

# Restart database
docker restart mshkltk-postgres

# Reseed database
./seed-database.sh

# View server logs
tail -f /tmp/dev-server.log
```

---

## Still Having Issues?

1. **Check this file first:** `TROUBLESHOOTING.md` (you're reading it!)
2. **Check backend logs:** The terminal running `npm run dev`
3. **Check browser console:** Open DevTools (F12) → Console tab
4. **Check database:** `docker logs mshkltk-postgres`
5. **Try the nuclear option above** (fresh restart)

---

## Success Indicators

You know everything is working when:

✅ Terminal shows both servers "ready"
✅ `lsof -ti:3000,3001` returns two PIDs
✅ http://localhost:3000 shows the landing page
✅ No errors in browser console
✅ Database has 100 reports (check Super Admin panel)

**Happy developing! 🚀**
