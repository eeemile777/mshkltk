# 🚀 Mshkltk Quick Start Guide

## First Time Setup

Run these commands **once** to set up your development environment:

```bash
# 1. Ensure database is ready (creates container, starts it, imports schema)
./setup-database-docker.sh

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Start the application
npm run dev
```

## Daily Development

Every time you want to work on the project:

```bash
# Option 1: Use the automated start script (recommended)
./start.sh

# Option 2: Manual start
./setup-database-docker.sh  # Ensures database is running
npm run dev                  # Starts frontend + backend
```

## Important Scripts

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `./setup-database-docker.sh` | Ensures database container is running and schema is ready | **Run anytime** - it's safe and idempotent! |
| `./start.sh` | Starts database + development servers + opens browser | Daily development |
| `./stop.sh` | Stops all development servers | When you're done coding |
| `npm run dev` | Starts frontend (port 3000) + backend (port 3001) | After database is running |

## The Magic Script ✨

**`./setup-database-docker.sh`** is your one-stop solution for database readiness:

- ✅ **Container doesn't exist?** → Creates it
- ✅ **Container stopped?** → Starts it  
- ✅ **Container running?** → Verifies it's ready
- ✅ **Schema missing?** → Imports it
- ✅ **Schema exists?** → Skips import

**You can run it anytime without worry!** It's smart enough to only do what's needed.

## Troubleshooting

### Database Connection Errors?
```bash
./setup-database-docker.sh
```

### Ports Already in Use?
```bash
./stop.sh
npm run dev
```

### Fresh Start?
```bash
docker rm -f mshkltk-postgres
./setup-database-docker.sh
```

## Login Credentials

After starting the app at `http://localhost:3000`:

- **Super Admin**: `admin` / `password`
- **Portal**: `beirut_portal` / `password`  
- **Citizen**: `ali_hassan` / `password`

## What's Running?

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend**: http://localhost:3001
- 🐘 **Database**: PostgreSQL in Docker (port 5432)
