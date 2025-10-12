#!/bin/bash

# Setup script for Overhang development environment

set -e

echo "Setting up Overhang development environment..."

# Setup backend
echo "Setting up backend..."
cd packages/backend
./scripts/setup-dev.sh

# Setup frontend
echo "Setting up frontend..."
cd ../frontend
npm install

echo "Development environment setup complete!"
echo "To run the application:"
echo "  1. In one terminal: cd packages/backend && tox -e dev"
echo "  2. In another terminal: cd packages/frontend && npm run dev"