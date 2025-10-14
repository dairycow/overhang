#!/bin/bash

# Reset and seed the database

set -e

echo "========================================"
echo "Overhang Database Management"
echo "========================================"
echo ""

cd packages/backend

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Backend virtual environment not found. Run setup first:"
    echo "   ./scripts/setup-dev.sh"
    exit 1
fi

source .venv/bin/activate

echo "🗑️  Removing existing database..."
rm -f overhang.db

echo ""
echo "Choose seeding option:"
echo "  1) Production seed (locations only)"
echo "  2) Test seed (locations + test users + test sessions)"
echo ""
read -p "Enter choice [1 or 2]: " choice

echo ""

case "$choice" in
    1)
        echo "🌱 Seeding database with locations only..."
        python scripts/seed_locations.py
        ;;
    2)
        echo "🧪 Seeding database with test data..."
        python scripts/seed_all_test_data.py
        ;;
    *)
        echo "❌ Invalid choice. Defaulting to production seed."
        python scripts/seed_locations.py
        ;;
esac

echo ""
echo "========================================"
echo "Database reset and seeded successfully! ✅"
echo "========================================"
echo ""
echo "Database file: packages/backend/overhang.db"
echo "You can now run the development servers."