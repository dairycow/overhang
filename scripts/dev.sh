#!/bin/bash

# Development workflow helper script

set -e

show_help() {
    echo "========================================"
    echo "Overhang Development Workflow"
    echo "========================================"
    echo ""
    echo "Available commands:"
    echo ""
    echo "Setup & Installation:"
    echo "  setup          - Initial setup of both backend and frontend"
    echo ""
    echo "Development Servers:"
    echo "  run            - Start both backend and frontend servers"
    echo "  backend        - Start only backend server"
    echo "  frontend       - Start only frontend server"
    echo ""
    echo "Database:"
    echo "  db-reset       - Reset and reseed database"
    echo ""
    echo "Testing:"
    echo "  test           - Run all tests (backend + frontend)"
    echo "  test-backend   - Run only backend tests"
    echo ""
    echo "Code Quality:"
    echo "  lint           - Run linting on backend"
    echo "  format         - Format code on backend"
    echo "  type-check     - Run type checking on backend"
    echo ""
    echo "Usage: ./scripts/dev.sh <command>"
    echo "Example: ./scripts/dev.sh run"
    echo ""
}

case "${1:-help}" in
    "setup")
        echo "Running setup..."
        ./scripts/setup-dev.sh
        ;;
    "run")
        echo "Starting development servers..."
        ./scripts/run-dev.sh
        ;;
    "backend")
        echo "Starting backend server..."
        cd packages/backend
        source .venv/bin/activate
        tox -e dev
        ;;
    "frontend")
        echo "Starting frontend server..."
        cd packages/frontend
        npm run dev
        ;;
    "db-reset")
        echo "Resetting database..."
        ./scripts/db-reset.sh
        ;;
    "test")
        echo "Running all tests..."
        ./scripts/test-all.sh
        ;;
    "test-backend")
        echo "Running backend tests..."
        cd packages/backend
        source .venv/bin/activate
        tox
        ;;
    "lint")
        echo "Running linting..."
        cd packages/backend
        source .venv/bin/activate
        tox -e lint
        ;;
    "format")
        echo "Formatting code..."
        cd packages/backend
        source .venv/bin/activate
        tox -e format
        ;;
    "type-check")
        echo "Running type checking..."
        cd packages/backend
        source .venv/bin/activate
        tox -e type
        ;;
    "help"|*)
        show_help
        ;;
esac