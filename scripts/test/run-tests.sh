#!/bin/bash

# Automated Test Runner for Mshkltk
# This script runs all end-to-end tests

echo "🚀 Starting Mshkltk Test Suite..."
echo ""

# Function to cleanup on exit
cleanup() {
    if [ ! -z "$DEV_PID" ]; then
        echo ""
        echo "🧹 Cleaning up..."
        kill $DEV_PID 2>/dev/null
        wait $DEV_PID 2>/dev/null
    fi
}
trap cleanup EXIT INT TERM

# Check if servers are already running
FRONTEND_RUNNING=false
BACKEND_RUNNING=false

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_RUNNING=true
fi

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    BACKEND_RUNNING=true
fi

# Start servers if not running
if [ "$FRONTEND_RUNNING" = false ] || [ "$BACKEND_RUNNING" = false ]; then
    echo "📦 Starting development servers..."
    npm run dev > /dev/null 2>&1 &
    DEV_PID=$!
    
    echo "⏳ Waiting for servers to start..."
    
    # Wait for frontend
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            FRONTEND_RUNNING=true
            break
        fi
        sleep 1
    done
    
    # Wait for backend
    for i in {1..30}; do
        if curl -s http://localhost:3001 > /dev/null 2>&1; then
            BACKEND_RUNNING=true
            break
        fi
        sleep 1
    done
    
    if [ "$FRONTEND_RUNNING" = false ]; then
        echo "❌ Frontend failed to start on port 3000"
        exit 1
    fi
    
    if [ "$BACKEND_RUNNING" = false ]; then
        echo "❌ Backend failed to start on port 3001"
        exit 1
    fi
    
    echo "✅ Servers started successfully"
else
    echo "✅ Servers already running"
fi

echo "✅ Frontend: http://localhost:3000"
echo "✅ Backend: http://localhost:3001"
echo ""
echo "🧪 Running automated tests..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Run Playwright tests
npx playwright test

# Check exit code
TEST_EXIT=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TEST_EXIT -eq 0 ]; then
    echo "✅ All tests passed!"
    echo ""
    echo "📊 View detailed report:"
    echo "   npx playwright show-report"
    echo ""
else
    echo "⚠️  Some tests failed or were interrupted"
    echo ""
    echo "📊 View results:"
    echo "   npx playwright show-report"
    echo ""
    echo "� Common issues:"
    echo "   - Tests timing out? Increase timeout in playwright.config.ts"
    echo "   - Elements not found? Check selectors in test files"
    echo "   - Run in headed mode: npm run test:headed"
    echo ""
fi

exit $TEST_EXIT
