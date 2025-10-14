"""
Master script to seed all test data in the correct order.
This will populate the database with locations, test users, and test sessions.

Usage: python scripts/seed_all_test_data.py
Or: tox -e seed-test

⚠️  WARNING: This is for development/testing only! DO NOT run in production!
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from seed_locations import seed_locations
from seed_test_users import seed_test_users
from seed_test_sessions import seed_test_sessions


def seed_all_test_data():
    """Seed all test data in the correct order."""
    print("=" * 60)
    print("🌱 SEEDING ALL TEST DATA")
    print("=" * 60)
    print()

    print("Step 1/3: Seeding locations...")
    print("-" * 60)
    seed_locations()
    print()

    print("Step 2/3: Seeding test users...")
    print("-" * 60)
    seed_test_users()
    print()

    print("Step 3/3: Seeding test sessions...")
    print("-" * 60)
    seed_test_sessions()
    print()

    print("=" * 60)
    print("✅ ALL TEST DATA SEEDED SUCCESSFULLY!")
    print("=" * 60)
    print()
    print("🎉 Your database is now populated with test data!")
    print()
    print("📝 Next steps:")
    print("   1. Start the frontend: cd packages/frontend && npm run dev")
    print("   2. Login with any test user:")
    print("      - Username: harry, alice, bob, charlie, or diana")
    print("      - Password: password123")
    print("   3. View the Dashboard to see populated charts!")
    print()


if __name__ == "__main__":
    try:
        seed_all_test_data()
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ ERROR: Test data seeding failed")
        print("=" * 60)
        print(f"Error: {e}")
        sys.exit(1)
