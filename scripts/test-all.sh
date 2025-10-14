#!/bin/bash

# Run tests for both backend and frontend

set -e

echo "========================================"
echo "Running Overhang Test Suite"
echo "========================================"
echo ""

# Test backend
echo "🧪 Testing Backend (Python)..."
cd packages/backend
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "Running Python tests..."
    tox
    echo "✅ Backend tests completed"
else
    echo "❌ Backend virtual environment not found. Run setup first."
    exit 1
fi

echo ""

# Test frontend
echo "🧪 Testing Frontend (TypeScript)..."
cd ../frontend
if [ -d "node_modules" ]; then
    echo "Running TypeScript type check..."
    npm run type-check
    echo "✅ Frontend type check completed"
else
    echo "❌ Frontend dependencies not found. Run setup first."
    exit 1
fi

echo ""
echo "========================================"
echo "All tests completed successfully! ✅"
echo "========================================"