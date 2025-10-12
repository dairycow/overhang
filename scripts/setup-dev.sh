#!/bin/bash
set -e

echo "========================================"
echo "Overhang Development Environment Setup"
echo "========================================"
echo ""

echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "Error: Python 3.11+ is required. Found: $python_version"
    exit 1
fi
echo "✓ Python $python_version found"

echo ""
echo "Checking for uv package manager..."
if ! command -v uv &> /dev/null; then
    echo "uv not found. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
else
    echo "✓ uv found"
fi

echo ""
echo "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Please install Node.js 16+ to run the frontend."
    exit 1
else
    node_version=$(node --version 2>&1 | sed 's/v//')
    echo "✓ Node.js $node_version found"
fi

echo ""
echo "Creating virtual environment..."
cd packages/backend
if [ ! -d ".venv" ]; then
    uv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""
echo "Installing backend dependencies..."
source .venv/bin/activate
uv pip install -e ".[dev]"
echo "✓ Backend dependencies installed"

echo ""
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ .env file created from .env.example"
    echo "  Please update .env with your configuration"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installing frontend dependencies..."
cd ../frontend
if [ ! -f "package-lock.json" ] && [ ! -d "node_modules" ]; then
    npm install
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
echo ""
echo "To activate the backend virtual environment:"
echo "  cd packages/backend"
echo "  source .venv/bin/activate"
echo ""
echo "Available backend commands:"
echo "  tox          - Run all tests"
echo "  tox -e dev   - Run development server"
echo "  tox -e lint  - Run linting"
echo "  tox -e format - Format code"
echo "  tox -e type  - Run type checking"
echo ""
echo "To run the frontend:"
echo "  cd packages/frontend"
echo "  npm run dev"
echo ""
