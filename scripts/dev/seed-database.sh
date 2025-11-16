#!/bin/bash

# Mshkltk Database Seeder
# Populates the database with default categories, badges, and demo data

set -e

echo "🌱 Starting database seed..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default database connection
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-mshkltk_db}
DB_USER=${DB_USER:-mshkltk_user}

echo "📊 Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"

# Run seed file
echo "🌱 Seeding data..."

# Check if running in Docker or local psql
if command -v docker &> /dev/null && docker ps | grep -q postgres; then
    echo "📦 Using Docker PostgreSQL..."
    docker exec -i mshkltk-postgres psql -U $DB_USER -d $DB_NAME < server/db/seed.sql
elif command -v psql &> /dev/null; then
    echo "💻 Using local PostgreSQL..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f server/db/seed.sql
else
    echo "❌ Error: Neither Docker nor psql command found!"
    echo "   Install PostgreSQL client or use Docker."
    exit 1
fi

echo ""
echo "✅ Database seeded successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 DEFAULT LOGIN CREDENTIALS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔴 Super Admin:"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "🏛️  Beirut Portal:"
echo "   Username: beirut_portal"
echo "   Password: password"
echo ""
echo "🏛️  Tripoli Portal:"
echo "   Username: tripoli_portal"  
echo "   Password: password"
echo ""
echo "👤 Demo Citizen:"
echo "   Username: ali_hassan"
echo "   Password: password"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DATABASE CONTENTS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 12 Categories (Infrastructure, Waste, etc.)"
echo "✅ 12 Badges (Pioneer, Civic Leader, etc.)"
echo "✅ 4 Point Rules (Submit: 10pts, Confirm: 3pts, etc.)"
echo "✅ 8 Users (1 admin, 3 portals, 5 citizens)"
echo "✅ 3 Sample Reports"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Ready to start the app!"
echo "   Run: npm run dev"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
