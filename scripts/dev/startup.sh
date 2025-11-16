#!/bin/bash

# Mshkltk Startup Script
# Starts Docker database + development servers in one command

set -e

echo "🚀 Starting Mshkltk..."
echo ""

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
if docker ps --format '{{.Names}}' | grep -q "^mshkltk-postgres$"; then
    echo "   Container already running ✓"
else
    if docker ps -a --format '{{.Names}}' | grep -q "^mshkltk-postgres$"; then
        echo "   Starting existing container..."
        docker start mshkltk-postgres > /dev/null
    else
        echo "   Creating new container..."
        docker run --name mshkltk-postgres \
            -e POSTGRES_PASSWORD=mshkltk123 \
            -e POSTGRES_DB=mshkltk_db \
            -p 5432:5432 \
            -v mshkltk_db_volume:/var/lib/postgresql/data \
            -d postgis/postgis:15-3.4 > /dev/null
    fi
    echo "   Waiting for database to be ready..."
    sleep 3
fi

echo ""
echo "✅ Database ready"
echo ""
echo "🌐 Starting development servers..."
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001/api-docs"
echo ""

npm run dev
