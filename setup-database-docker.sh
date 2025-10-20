#!/bin/bash

# Mshkltk Database Setup - Docker PostgreSQL
# Since you removed the local PostgreSQL installation, this script uses Docker

set -e  # Exit on error

echo "🐳 Mshkltk Database Setup with Docker"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed on your system."
    echo ""
    echo "📥 Please install Docker Desktop first:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo ""
    echo "After installing Docker Desktop:"
    echo "1. Start Docker Desktop application"
    echo "2. Wait for Docker to be running (check the menu bar icon)"
    echo "3. Run this script again: ./setup-database-docker.sh"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is installed and running!"
echo ""

# Configuration
CONTAINER_NAME="mshkltk-postgres"
POSTGRES_PASSWORD="mshkltk123"
POSTGRES_DB="mshkltk_db"
POSTGRES_PORT="5432"

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  Container '${CONTAINER_NAME}' already exists."
    echo ""
    echo "Options:"
    echo "  1) Remove and recreate (fresh start)"
    echo "  2) Start existing container"
    echo "  3) Exit"
    echo ""
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            echo "🗑️  Removing existing container..."
            docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
            ;;
        2)
            echo "▶️  Starting existing container..."
            docker start ${CONTAINER_NAME}
            echo "✅ Container started!"
            echo ""
            echo "Database connection details:"
            echo "  Host: localhost"
            echo "  Port: ${POSTGRES_PORT}"
            echo "  Database: ${POSTGRES_DB}"
            echo "  User: postgres"
            echo "  Password: ${POSTGRES_PASSWORD}"
            exit 0
            ;;
        3)
            echo "👋 Exiting..."
            exit 0
            ;;
        *)
            echo "❌ Invalid choice"
            exit 1
            ;;
    esac
fi

echo "📦 Creating PostgreSQL container with PostGIS..."
echo "   Container name: ${CONTAINER_NAME}"
echo "   Database: ${POSTGRES_DB}"
echo "   Port: ${POSTGRES_PORT}"
echo ""

# Pull and run PostgreSQL with PostGIS
docker run --name ${CONTAINER_NAME} \
  -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
  -e POSTGRES_DB=${POSTGRES_DB} \
  -p ${POSTGRES_PORT}:5432 \
  -d postgis/postgis:15-3.4

echo "✅ Container created and started!"
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

for i in {1..30}; do
    if docker exec ${CONTAINER_NAME} pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start. Check logs with: docker logs ${CONTAINER_NAME}"
        exit 1
    fi
    sleep 1
done

echo ""

# Enable PostGIS extension
echo "🗺️  Enabling PostGIS extension..."
docker exec ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} -c "CREATE EXTENSION IF NOT EXISTS postgis;"
echo "✅ PostGIS extension enabled!"
echo ""

# Import schema
echo "📋 Importing database schema..."
if [ ! -f "server/db/schema.sql" ]; then
    echo "❌ Error: server/db/schema.sql not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

docker exec -i ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} < server/db/schema.sql
echo "✅ Schema imported successfully!"
echo ""

# Update .env file
echo "📝 Updating .env file..."
if [ -f ".env" ]; then
    # Backup existing .env
    cp .env .env.backup
    echo "✅ Created backup: .env.backup"
    
    # Update database credentials using a more reliable method
    cat .env | \
        sed "s|^DB_HOST=.*|DB_HOST=localhost|" | \
        sed "s|^DB_PORT=.*|DB_PORT=${POSTGRES_PORT}|" | \
        sed "s|^DB_NAME=.*|DB_NAME=${POSTGRES_DB}|" | \
        sed "s|^DB_USER=.*|DB_USER=postgres|" | \
        sed "s|^DB_PASSWORD=.*|DB_PASSWORD=${POSTGRES_PASSWORD}|" > .env.new
    
    mv .env.new .env
    echo "✅ .env file updated!"
else
    echo "⚠️  .env file not found. Creating one..."
    cat > .env << EOF
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (change this to a random string in production!)
JWT_SECRET=mshkltk-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=${POSTGRES_PORT}
DB_NAME=${POSTGRES_DB}
DB_USER=postgres
DB_PASSWORD=${POSTGRES_PASSWORD}

# Google Cloud Storage (optional for local development)
# GOOGLE_CLOUD_PROJECT_ID=your-project-id
# GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
EOF
    echo "✅ .env file created!"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📊 Database connection details:"
echo "  Host: localhost"
echo "  Port: ${POSTGRES_PORT}"
echo "  Database: ${POSTGRES_DB}"
echo "  User: postgres"
echo "  Password: ${POSTGRES_PASSWORD}"
echo ""
echo "🚀 You can now run the application with:"
echo "   npm run dev"
echo ""
echo "📝 Useful Docker commands:"
echo "   Stop database:   docker stop ${CONTAINER_NAME}"
echo "   Start database:  docker start ${CONTAINER_NAME}"
echo "   View logs:       docker logs ${CONTAINER_NAME}"
echo "   Connect to DB:   docker exec -it ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB}"
echo "   Remove container: docker rm -f ${CONTAINER_NAME}"
echo ""
