# Database Setup Guide

## Current Situation

You have PostgreSQL 14 installed and running, but it requires a password that we don't have. Here are your options:

## Option 1: Reset PostgreSQL Password (Recommended for Production-like Setup)

1. **Stop the existing PostgreSQL service:**
   ```bash
   sudo /Library/PostgreSQL/14/scripts/ctl.sh stop
   ```

2. **Edit the pg_hba.conf to allow trust authentication temporarily:**
   ```bash
   sudo nano /Library/PostgreSQL/14/data/pg_hba.conf
   ```
   Change all `md5` or `scram-sha-256` to `trust` temporarily

3. **Restart PostgreSQL:**
   ```bash
   sudo /Library/PostgreSQL/14/scripts/ctl.sh start
   ```

4. **Connect and reset password:**
   ```bash
   /Library/PostgreSQL/14/bin/psql -U postgres -d postgres
   ALTER USER postgres WITH PASSWORD 'your_new_password';
   \q
   ```

5. **Restore secure authentication in pg_hba.conf and restart**

6. **Then run this setup:**
   ```bash
   export PGPASSWORD='your_new_password'
   /Library/PostgreSQL/14/bin/createdb -U postgres mshkltk_db
   /Library/PostgreSQL/14/bin/psql -U postgres -d mshkltk_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   /Library/PostgreSQL/14/bin/psql -U postgres -d mshkltk_db -f server/db/schema.sql
   ```

7. **Update your `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=mshkltk_db
   DB_USER=postgres
   DB_PASSWORD=your_new_password
   ```

## Option 2: Use SQLite for Local Development (Quickest)

SQLite requires no authentication and is perfect for local development. We'd need to:

1. Install `better-sqlite3` npm package
2. Create a simple adapter in the backend to use SQLite instead of PostgreSQL
3. All the API functionality will work the same

Run this command to set up SQLite:
```bash
cd server && npm install better-sqlite3
```

## Option 3: Use Docker PostgreSQL (Isolated & Clean)

Run PostgreSQL in Docker with known credentials:

```bash
# 1. Install Docker Desktop from docker.com (if not installed)

# 2. Run PostgreSQL in Docker
docker run --name mshkltk-postgres \
  -e POSTGRES_PASSWORD=mshkltk123 \
  -e POSTGRES_DB=mshkltk_db \
  -p 5432:5432 \
  -d postgis/postgis:15-3.4

# 3. Wait a few seconds for it to start, then run the schema
docker exec -i mshkltk-postgres psql -U postgres -d mshkltk_db < server/db/schema.sql

# 4. Update .env
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mshkltk_db
# DB_USER=postgres
# DB_PASSWORD=mshkltk123
```

To stop the container later:
```bash
docker stop mshkltk-postgres
```

To start it again:
```bash
docker start mshkltk-postgres
```

## My Recommendation

**Option 3 (Docker)** is the cleanest solution:
- ✅ No conflicts with existing PostgreSQL installation
- ✅ Known credentials
- ✅ Easy to start/stop/reset
- ✅ Closest to production environment
- ✅ Includes PostGIS extension

**Would you like me to help you set up Option 3 with Docker?**
