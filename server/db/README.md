# Database Setup Instructions

This directory contains all database-related code for the Mshkltk backend.

## Files

- `schema.sql`: Complete PostgreSQL schema with all tables, indexes, and constraints
- `connection.js`: Database connection pool configuration
- `queries/`: Directory containing organized query functions for each entity

## Local Development Setup

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15 postgis
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis
```

### 2. Create the Database

```bash
# Connect to PostgreSQL
psql postgres

# Create the database
CREATE DATABASE mshkltk;

# Connect to the new database
\c mshkltk

# Run the schema file
\i /path/to/your/server/db/schema.sql

# Verify tables were created
\dt

# Exit
\q
```

### 3. Configure Environment Variables

Add these to your `.env` file in the project root:

```env
# Database Configuration (Local Development)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mshkltk
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 4. Test the Connection

From your project root, run:
```bash
npm run dev
```

You should see "✅ Connected to PostgreSQL database" in the backend terminal.

## Google Cloud SQL Setup (Production)

When you're ready to deploy to Google Cloud:

### 1. Create Cloud SQL Instance

```bash
gcloud sql instances create mshkltk-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD
```

### 2. Enable PostGIS

```bash
gcloud sql databases create mshkltk --instance=mshkltk-db

gcloud sql connect mshkltk-db --user=postgres

# Inside psql:
\c mshkltk
CREATE EXTENSION postgis;
\q
```

### 3. Run Schema

Upload and run the `schema.sql` file:
```bash
gcloud sql connect mshkltk-db --user=postgres < server/db/schema.sql
```

### 4. Update Environment Variables

For Cloud Run deployment, set these as secrets:
```bash
DB_HOST=/cloudsql/YOUR_PROJECT_ID:us-central1:mshkltk-db
DB_USER=postgres
DB_PASSWORD=your_cloud_sql_password
DB_NAME=mshkltk
```

## Database Schema Overview

### Core Tables
- **users**: All user accounts (citizens, portal staff, admins)
- **reports**: Civic issue reports with geospatial data
- **comments**: User comments on reports
- **notifications**: System notifications for users
- **report_history**: Audit trail of report status changes

### Admin Tables
- **dynamic_categories**: Configurable report categories
- **dynamic_badges**: Configurable achievement badges
- **gamification_settings**: Points system configuration
- **audit_logs**: Admin action tracking

## Important Notes

- The schema uses PostGIS for geospatial queries (nearby reports, heatmaps)
- All timestamps are stored with timezone information
- Cascading deletes are configured per the data model specifications
- Indexes are optimized for common query patterns
