"""
Seed test users into the database for development/testing.
DO NOT run this in production!
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import SessionLocal, init_db
from src.models import Location, User
from src import crud


def seed_test_users():
    """Create test users for development."""
    init_db()
    db = SessionLocal()

    try:
        # Check if locations exist first
        locations = db.query(Location).all()
        if not locations:
            print("❌ No locations found! Please run seed_locations.py first.")
            return

        print(f"Found {len(locations)} location(s)")

        # Test users to create
        test_users = [
            {
                "username": "harry",
                "password": "password123",
                "home_location_id": locations[0].id,  # Fhyswick, Canberra
            },
            {
                "username": "alice",
                "password": "password123",
                "home_location_id": locations[1].id,  # Mitchell, Canberra
            },
            {
                "username": "bob",
                "password": "password123",
                "home_location_id": locations[2].id,  # Port Melbourne
            },
            {
                "username": "charlie",
                "password": "password123",
                "home_location_id": locations[3].id,  # Marrickville, Sydney
            },
            {
                "username": "diana",
                "password": "password123",
                "home_location_id": locations[4].id,  # Leichhardt, Sydney
            },
        ]

        created_users = []
        for user_data in test_users:
            # Check if user already exists
            existing_user = (
                db.query(User).filter(User.username == user_data["username"]).first()
            )
            if existing_user:
                print(f"⚠️  User '{user_data['username']}' already exists. Skipping.")
                continue

            # Create user
            user = crud.create_user(
                db=db,
                username=user_data["username"],
                password=user_data["password"],
                home_location_id=user_data["home_location_id"],
            )
            created_users.append(user)
            location = (
                db.query(Location).filter(Location.id == user.home_location_id).first()
            )
            print(
                f"✅ Created user: {user.username} (home: {location.name if location else 'Unknown'})"
            )

        if created_users:
            print(f"\n✨ Successfully created {len(created_users)} test user(s)")
            print("\n📝 Login credentials for all test users:")
            print("   Username: harry, alice, bob, charlie, or diana")
            print("   Password: password123")
        else:
            print("\nℹ️  No new users created (all already exist)")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding test users: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🧪 Seeding test users for development...")
    print("⚠️  WARNING: This is for development/testing only!\n")
    seed_test_users()
