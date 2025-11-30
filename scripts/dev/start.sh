#!/bin/bash

# Mshkltk Startup Script
# This script ensures everything is running before opening the app

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🚀  Starting Mshkltk Development Environment       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Ensure PostgreSQL database is ready
echo "📊 Step 1/3: Ensuring database is ready..."
echo ""
./setup-database-docker.sh
if [ $? -ne 0 ]; then
    echo "   ❌ Failed to setup database"
    exit 1
fi
echo ""

# Step 2: Kill any existing processes on ports 3000 and 3001
echo "🔄 Step 2/3: Clearing any existing processes..."
if lsof -ti:3000,3001 >/dev/null 2>&1; then
    echo "   ⚠️  Found existing processes. Killing..."
    lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "   ✅ Cleared"
else
    echo "   ✅ Ports are clear"
fi
echo ""

# Step 3: Start development servers
echo "🚀 Step 3/3: Starting development servers..."
echo "   This will start both frontend (port 3000) and backend (port 3001)"
echo ""

# Start in background and redirect to log file
npm run dev > /tmp/mshkltk-dev.log 2>&1 &
DEV_PID=$!

# Wait for servers to start
echo "   ⏳ Waiting for servers to initialize..."
sleep 5

# Check if both servers started successfully
if lsof -ti:3000 >/dev/null 2>&1 && lsof -ti:3001 >/dev/null 2>&1; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║        ✅  ALL SYSTEMS GO! Mshkltk is ready! ✅            ║"
    echo "║                                                           ║"
    echo "╠═══════════════════════════════════════════════════════════╣"
    echo "║                                                           ║"
    echo "║  🌐 Frontend:  http://localhost:3000                      ║"
    echo "║  🔌 Backend:   http://localhost:3001                      ║"
    echo "║  📚 API Docs:  http://localhost:3001/api-docs             ║"
    echo "║                                                           ║"
    echo "║  📝 Logs:      tail -f /tmp/mshkltk-dev.log               ║"
    echo "║  🛑 Stop:      ./stop.sh or Ctrl+C                        ║"
    echo "║                                                           ║"
    echo "╠═══════════════════════════════════════════════════════════╣"
    echo "║                                                           ║"
    echo "║  🔑 LOGIN CREDENTIALS:                                    ║"
    echo "║                                                           ║"
    echo "║  Super Admin:  admin / password                           ║"
    echo "║  Portal:       beirut_portal / password                   ║"
    echo "║  Citizen:      ali_hassan / password                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "👀 Opening browser..."
    sleep 2
    
    # Open browser (works on macOS, Linux, Windows)
    if command -v open >/dev/null 2>&1; then
        open http://localhost:3000
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:3000
    elif command -v start >/dev/null 2>&1; then
        start http://localhost:3000
    else
        echo "   ℹ️  Please open http://localhost:3000 in your browser"
    fi
    
    echo ""
    echo "Press Ctrl+C to stop the servers"
    echo ""
    
    # Keep script running and show logs
    tail -f /tmp/mshkltk-dev.log
else
    echo ""
    echo "❌ ERROR: Servers failed to start!"
    echo ""
    echo "Checking logs..."
    tail -30 /tmp/mshkltk-dev.log
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check if ports 3000 and 3001 are available"
    echo "2. Run: npm install (to install dependencies)"
    echo "3. Check database: docker ps | grep postgres"
    echo "4. See TROUBLESHOOTING.md for more help"
    exit 1
fi
