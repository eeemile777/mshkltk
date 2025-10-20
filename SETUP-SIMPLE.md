# 🚀 Super Simple Setup - Just 3 Steps!

Since you deleted PostgreSQL, here's the fastest way to get your app running:

---

## Step 1️⃣: Install Docker Desktop (5 minutes)

1. Go to: https://www.docker.com/products/docker-desktop
2. Download **Docker Desktop for Mac**
3. Open the downloaded `.dmg` file
4. Drag Docker to Applications folder
5. Open Docker Desktop app
6. Wait for the whale icon in menu bar to stop animating (means it's ready)

**That's it! Docker is ready.**

---

## Step 2️⃣: Run ONE Command (30 seconds)

Open your terminal in the project folder and run:

```bash
./setup-database-docker.sh
```

The script will:
- Download PostgreSQL with PostGIS automatically
- Create your database
- Import all tables
- Configure everything

**You don't need to do anything else - just wait for it to finish!**

---

## Step 3️⃣: Start Your App (10 seconds)

```bash
npm run dev
```

**Open your browser:** http://localhost:3000

**Done! Your app is running! 🎉**

---

## Quick Reference

### Daily Use:

**Start working on the project:**
```bash
docker start mshkltk-postgres  # Start database
npm run dev                     # Start app
```

**Stop working:**
```bash
# Just press Ctrl+C to stop the app
docker stop mshkltk-postgres    # Stop database (optional)
```

### If Something Goes Wrong:

**Reset everything:**
```bash
docker rm -f mshkltk-postgres
./setup-database-docker.sh
```

**Check if Docker is running:**
```bash
docker ps
```

**View database logs:**
```bash
docker logs mshkltk-postgres
```

---

## What You Get

✅ **Complete Database** - PostgreSQL 15 with PostGIS
✅ **Zero Configuration** - Everything automated
✅ **Isolated** - Won't mess with your Mac
✅ **Production-Ready** - Same setup you'll use in cloud

---

## Credentials (Auto-configured)

The script automatically sets these in your `.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mshkltk_db
DB_USER=postgres
DB_PASSWORD=mshkltk123
```

You don't need to remember these - they're already configured!

---

## Need Help?

1. Make sure Docker Desktop is running (check menu bar)
2. Run the script from the project root directory
3. If port 5432 is busy, the script will tell you what to do

**Questions?** Check `QUICKSTART.md` for detailed info.

---

**Ready? Just do these 3 things:**

1. 📥 Install Docker Desktop
2. ▶️ Run `./setup-database-docker.sh`
3. 🚀 Run `npm run dev`

**That's literally it!** 🎯
