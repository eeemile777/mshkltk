# 🎯 Quick Start Guide - Database Setup

## Current Status

✅ Backend API fully implemented (29 endpoints)
✅ Frontend refactored to use real API  
❌ PostgreSQL was removed from your system
✅ Docker setup script ready to go!

---

## Next Step: Set Up Database with Docker

Since you removed PostgreSQL, the easiest solution is to use **Docker** - it's isolated, clean, and exactly what you'll use in production!

### 🐳 Step 1: Install Docker Desktop

1. **Download Docker Desktop:** https://www.docker.com/products/docker-desktop
2. **Install it** (just drag to Applications folder)
3. **Start Docker Desktop** and wait for it to be running (check menu bar icon)

### 🚀 Step 2: Run the Setup Script

Once Docker is running, just execute:

```bash
./setup-database-docker.sh
```

**The script will:**
1. ✅ Check if Docker is running
2. � Pull PostgreSQL 15 with PostGIS from Docker Hub
3. � Create and start the database container
4. 🗺️ Enable PostGIS extension automatically
5. 📋 Import the database schema (9 tables)
6. 📝 Update your `.env` file with connection details

**Database credentials that will be set:**
- Host: `localhost`
- Port: `5432`
- Database: `mshkltk_db`
- User: `postgres`
- Password: `mshkltk123`

---

## What This Gives You

✅ **Isolated Database** - Won't interfere with anything on your system
✅ **Easy Management** - Simple commands to start/stop/reset
✅ **Production-Ready** - PostGIS extension included
✅ **Zero Configuration** - Everything automated

---

## After Database Setup

Once the script completes, start the application:

```bash
npm run dev
```

This will start:
- **Frontend** on http://localhost:3000
- **Backend** on http://localhost:3001

### Test the Application

1. **Open** http://localhost:3000 in your browser
2. **Register** a new user account
3. **Login** with your credentials
4. **Submit a report** with a photo
5. **View the report** on the map
6. **Try confirming** another user's report (register a 2nd user in incognito mode)

---

## Managing Your Database

### Stop the database (when you're done working):
```bash
docker stop mshkltk-postgres
```

### Start the database (when you resume work):
```bash
docker start mshkltk-postgres
```

### View database logs:
```bash
docker logs mshkltk-postgres
```

### Connect to database directly:
```bash
docker exec -it mshkltk-postgres psql -U postgres -d mshkltk_db
```

### Reset everything (fresh start):
```bash
docker rm -f mshkltk-postgres
./setup-database-docker.sh
```

---

## Troubleshooting

### "Docker is not running"
- Make sure Docker Desktop is started (check menu bar for whale icon)
- Wait a few seconds for Docker daemon to be ready

### "Port 5432 already in use"
- Something else is using that port
- Check with: `lsof -i :5432`
- Kill the process or modify the script to use a different port (e.g., 5433)

### "Container already exists"
- The script will ask if you want to remove and recreate
- Choose option 1 for a fresh start

### Schema import errors
- Make sure you're in the project root directory
- Check that `server/db/schema.sql` exists

---

## No Docker? Alternative Options

If you can't use Docker, you have two other options:

### Option 1: Reinstall PostgreSQL with Homebrew

```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start the service
brew services start postgresql@15

# Add to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Create database
createdb mshkltk_db

# Enable PostGIS
psql mshkltk_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Import schema
psql mshkltk_db < server/db/schema.sql

# Update .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mshkltk_db
# DB_USER=your_username
# DB_PASSWORD=
```

### Option 2: Use SQLite (Simpler but Limited)

I can help you set up SQLite which requires no authentication, but you'll lose PostGIS geospatial features. Let me know if you want this option.

---

## Need Help?

- Check `DATABASE_SETUP.md` for detailed setup options
- Check `PRODUCTION_STATUS.md` for overall project status
- Check `server/db/README.md` for database documentation

**Ready to proceed?**

1. **Install Docker Desktop** (if not installed)
2. **Start Docker Desktop**
3. **Run `./setup-database-docker.sh`**
4. **Run `npm run dev`**
5. **Test at http://localhost:3000** 🚀
