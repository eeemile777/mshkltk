#!/bin/bash

# Mshkltk Database Setup Script
# This script helps you set up the PostgreSQL database for local development

set -e  # Exit on error

echo "🚀 Mshkltk Database Setup"
echo "========================"
echo ""

# Check if PostgreSQL 14 is running
if pgrep -f "/Library/PostgreSQL/14/bin/postmaster" > /dev/null; then
    echo "✅ PostgreSQL 14 is running"
    PSQL_BIN="/Library/PostgreSQL/14/bin/psql"
    CREATEDB_BIN="/Library/PostgreSQL/14/bin/createdb"
else
    echo "❌ PostgreSQL 14 is not running"
    echo "Please start PostgreSQL first:"
    echo "sudo /Library/PostgreSQL/14/scripts/ctl.sh start"
    exit 1
fi

echo ""
echo "📝 Database Configuration:"
echo "  Database Name: mshkltk_db"
echo "  User: postgres"
echo "  Host: localhost"
echo "  Port: 5432"
echo ""

# Prompt for password
echo "🔐 Please enter your PostgreSQL 'postgres' user password:"
read -s PGPASSWORD
export PGPASSWORD
echo ""

# Test connection
echo "🔍 Testing connection..."
if ! $PSQL_BIN -U postgres -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Connection failed. Please check your password."
    echo ""
    echo "If you don't know the password, you can reset it by:"
    echo "1. Editing /Library/PostgreSQL/14/data/pg_hba.conf"
    echo "2. Changing authentication from 'md5' to 'trust'"
    echo "3. Restarting PostgreSQL"
    echo "4. Running: $PSQL_BIN -U postgres -d postgres"
    echo "5. Then: ALTER USER postgres WITH PASSWORD 'your_new_password';"
    exit 1
fi

echo "✅ Connection successful!"
echo ""

# Check if database exists
echo "🔍 Checking if database 'mshkltk_db' exists..."
if $PSQL_BIN -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='mshkltk_db'" | grep -q 1; then
    echo "⚠️  Database 'mshkltk_db' already exists."
    echo "Do you want to drop and recreate it? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "🗑️  Dropping existing database..."
        $PSQL_BIN -U postgres -d postgres -c "DROP DATABASE mshkltk_db;"
    else
        echo "⏭️  Skipping database creation."
        DB_EXISTS=true
    fi
fi

if [ -z "$DB_EXISTS" ]; then
    echo "📦 Creating database 'mshkltk_db'..."
    $CREATEDB_BIN -U postgres mshkltk_db
    echo "✅ Database created!"
fi

# Check if PostGIS extension exists
echo "🗺️  Checking PostGIS extension..."
if $PSQL_BIN -U postgres -d mshkltk_db -tAc "SELECT 1 FROM pg_extension WHERE extname='postgis'" | grep -q 1; then
    echo "✅ PostGIS extension already installed"
else
    echo "📦 Installing PostGIS extension..."
    $PSQL_BIN -U postgres -d mshkltk_db -c "CREATE EXTENSION IF NOT EXISTS postgis;"
    echo "✅ PostGIS extension installed!"
fi

# Import schema
echo "📋 Importing database schema..."
if [ ! -f "server/db/schema.sql" ]; then
    echo "❌ Error: server/db/schema.sql not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

$PSQL_BIN -U postgres -d mshkltk_db -f server/db/schema.sql
echo "✅ Schema imported successfully!"

# Update .env file
echo ""
echo "📝 Updating .env file..."
if [ -f ".env" ]; then
    # Backup existing .env
    cp .env .env.backup
    echo "✅ Created backup: .env.backup"
    
    # Update database credentials
    sed -i.tmp "s/^DB_HOST=.*/DB_HOST=localhost/" .env
    sed -i.tmp "s/^DB_PORT=.*/DB_PORT=5432/" .env
    sed -i.tmp "s/^DB_NAME=.*/DB_NAME=mshkltk_db/" .env
    sed -i.tmp "s/^DB_USER=.*/DB_USER=postgres/" .env
    sed -i.tmp "s/^DB_PASSWORD=.*/DB_PASSWORD=$PGPASSWORD/" .env
    rm .env.tmp
    
    echo "✅ .env file updated!"
else
    echo "⚠️  .env file not found. Please create it manually."
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "You can now run the application with:"
echo "  npm run dev"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: mshkltk_db"
echo "  User: postgres"
echo ""
