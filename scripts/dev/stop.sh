#!/bin/bash

# Mshkltk Stop Script
# Gracefully stops all development servers

echo ""
echo "🛑 Stopping Mshkltk development servers..."
echo ""

# Kill processes on ports 3000 and 3001
if lsof -ti:3000,3001 >/dev/null 2>&1; then
    lsof -ti:3000,3001 | xargs kill -9 2>/dev/null
    echo "✅ Stopped frontend (port 3000)"
    echo "✅ Stopped backend (port 3001)"
else
    echo "ℹ️  No servers were running"
fi

echo ""
echo "✅ All servers stopped!"
echo ""
