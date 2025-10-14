#!/bin/bash

# Run both backend and frontend development servers

set -e

echo "========================================"
echo "Starting Overhang Development Servers"
echo "========================================"
echo ""

# Check if dependencies are installed
if [ ! -d "packages/backend/.venv" ]; then
    echo "❌ Backend virtual environment not found. Run setup first:"
    echo "   ./scripts/setup-dev.sh"
    exit 1
fi

if [ ! -d "packages/frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not found. Run setup first:"
    echo "   ./scripts/setup-dev.sh"
    exit 1
fi

echo "Starting backend server..."
cd packages/backend
source .venv/bin/activate
echo "📡 Backend starting on http://localhost:8000"
echo "📚 API docs available at http://localhost:8000/docs"
echo ""

# Start backend in background
tox -e dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "Starting frontend server..."
cd ../frontend
echo "🌐 Frontend starting on http://localhost:3000"
echo ""

# Start frontend in background
npm run dev &
FRONTEND_PID=$!

echo "========================================"
echo "Development servers started!"
echo "========================================"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "📡 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait