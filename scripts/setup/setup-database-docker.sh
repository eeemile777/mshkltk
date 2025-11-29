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
# Allow overriding image/tag via env var if needed
POSTGIS_IMAGE="${POSTGIS_IMAGE:-postgis/postgis:15-3.4}"

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
PLATFORM_FLAG=""
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    # Apple Silicon / ARM: use the arm64/v8 image to avoid qemu emulation warnings
    PLATFORM_FLAG="--platform linux/arm64/v8"
    # Ensure we have the correct platform image by force-pulling it (and removing any cached amd64 image)
    echo "🧰 Ensuring PostGIS image for ARM64..."
    docker image rm -f ${POSTGIS_IMAGE} >/dev/null 2>&1 || true
    # Try a couple of candidate tags known to have arm64 builds
    CANDIDATE_TAGS=("${POSTGIS_IMAGE}" "postgis/postgis:15-3.3" "postgis/postgis:14-3.3")
    ARM_IMAGE_FOUND=""
    for tag in "${CANDIDATE_TAGS[@]}"; do
        if docker pull --platform linux/arm64/v8 "$tag"; then
            ARM_IMAGE_FOUND="$tag"
            break
        fi
    done
    if [ -z "$ARM_IMAGE_FOUND" ]; then
        echo "⚠️  Could not pull an ARM64 PostGIS image; will fallback to amd64 emulation."
        PLATFORM_FLAG="--platform linux/amd64"
        ARM_IMAGE_FOUND="${POSTGIS_IMAGE}"
        docker pull --platform linux/amd64 "$ARM_IMAGE_FOUND" || true
    fi
    POSTGIS_IMAGE="$ARM_IMAGE_FOUND"
fi

echo "🚀 Starting container with image: ${POSTGIS_IMAGE} (${PLATFORM_FLAG:-native})"
if ! docker run ${PLATFORM_FLAG} --name ${CONTAINER_NAME} \
    -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${POSTGRES_DB} \
    -p ${POSTGRES_PORT}:5432 \
    -d ${POSTGIS_IMAGE}; then
    echo "❌ Failed to start with platform ${PLATFORM_FLAG}. Retrying without explicit platform..."
    docker rm -f ${CONTAINER_NAME} >/dev/null 2>&1 || true
    if ! docker run --name ${CONTAINER_NAME} \
        -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
        -e POSTGRES_DB=${POSTGRES_DB} \
        -p ${POSTGRES_PORT}:5432 \
        -d ${POSTGIS_IMAGE}; then
        echo "❌ Unable to start PostGIS container. Please run 'docker run --help' and verify Docker Desktop supports the image on your architecture."
        exit 125
    fi
fi

echo "✅ Container created and started!"
echo ""

echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..60}; do
    if docker exec ${CONTAINER_NAME} pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ PostgreSQL failed to start. Check logs with: docker logs ${CONTAINER_NAME}"
        exit 1
    fi
    sleep 1
done

# Extra buffer to ensure Postgres accepts stdin imports inside container
sleep 3

echo ""

# Enable PostGIS extension
echo "🗺️  Enabling PostGIS extension..."
# Retry enabling extension a few times to tolerate initial startup latency
for i in {1..5}; do
    if docker exec ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} -c "CREATE EXTENSION IF NOT EXISTS postgis;"; then
        echo "✅ PostGIS extension enabled!"
        break
    fi
    if [ $i -eq 5 ]; then
        echo "❌ Failed to enable PostGIS extension after multiple attempts. Check logs: docker logs ${CONTAINER_NAME}"
        exit 2
    fi
    echo "⏳ PostGIS enable attempt $i failed; retrying in 2s..."
    sleep 2
done
echo ""

# Import schema
echo "📋 Importing database schema..."
if [ ! -f "server/db/schema.sql" ]; then
    echo "❌ Error: server/db/schema.sql not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Use docker cp + docker exec to avoid rare stdin issues
docker cp server/db/schema.sql ${CONTAINER_NAME}:/tmp/schema.sql
docker exec -i ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} -f /tmp/schema.sql
echo "✅ Schema imported successfully!"
echo ""

# Optional next step: load demo data (fake users + reports)
echo "💡 Tip: To load demo data (demo users + 100 reports), run:"
echo "   docker exec -i ${CONTAINER_NAME} psql -U postgres -d ${POSTGRES_DB} < server/db/seed.sql"
echo "   Note: This resets reports/comments/history/audit_logs, inserts demo users if missing, and keeps admin/categories/badges."
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
