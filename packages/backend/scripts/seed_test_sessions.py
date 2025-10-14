"""
Seed test climbing sessions into the database for development/testing.
Creates realistic session data to visualise charts and test functionality.
DO NOT run this in production!
"""
import sys
from pathlib import Path
from datetime import date, timedelta
import random

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import SessionLocal, init_db
from src.models import Location, User
from src.schemas import SessionCreate, GradeEntry


def seed_test_sessions():
    """Create test climbing sessions with realistic progression."""
    init_db()
    db = SessionLocal()

    try:
        # Check if users and locations exist
        users = db.query(User).all()
        locations = db.query(Location).all()

        if not users:
            print("❌ No users found! Please run seed_test_users.py first.")
            return

        if not locations:
            print("❌ No locations found! Please run seed_locations.py first.")
            return

        print(f"Found {len(users)} user(s) and {len(locations)} location(s)")

        # Grade progression patterns (simulates improvement over time)
        grade_progressions = {
            "beginner": ["VB", "V0", "V3"],
            "intermediate": ["V0", "V3", "V4-V6"],
            "advanced": ["V3", "V4-V6", "V6-V8"],
            "expert": ["V4-V6", "V6-V8", "V7-V10"],
        }

        # Assign progression levels to users
        user_progressions = {
            users[0].id: "beginner",      # harry - beginner
            users[1].id: "intermediate" if len(users) > 1 else "beginner",  # alice
            users[2].id: "advanced" if len(users) > 2 else "beginner",      # bob
            users[3].id: "expert" if len(users) > 3 else "intermediate",    # charlie
            users[4].id: "intermediate" if len(users) > 4 else "beginner",  # diana
        }

        total_sessions = 0
        today = date.today()

        # Create sessions for each user
        for user in users:
            progression = user_progressions.get(user.id, "beginner")
            available_grades = grade_progressions[progression]

            # Create 15-25 sessions spread over the last 60 days
            num_sessions = random.randint(15, 25)

            print(f"\n👤 Creating sessions for {user.username} ({progression} climber)...")

            for i in range(num_sessions):
                # Distribute sessions over last 60 days (more recent = more sessions)
                days_ago = int(60 * (1 - (i / num_sessions) ** 0.5))  # Weighted toward recent dates
                session_date = today - timedelta(days=days_ago)

                # Select random location (favor home location 60% of the time)
                if random.random() < 0.6:
                    location_id = user.home_location_id
                else:
                    location_id = random.choice(locations).id

                # Create 2-4 grade entries per session
                num_grades = random.randint(2, 4)
                grades_to_use = random.sample(available_grades, min(num_grades, len(available_grades)))

                grade_entries = []
                for grade in grades_to_use:
                    # More attempts on easier grades, fewer on harder grades
                    grade_index = available_grades.index(grade)
                    max_attempts = 12 - (grade_index * 3)  # 12 for easiest, fewer for harder
                    attempts = random.randint(3, max_attempts)

                    # Success rate decreases for harder grades
                    success_rate = 0.8 - (grade_index * 0.2)  # 80% for easiest, lower for harder
                    completed = sum(1 for _ in range(attempts) if random.random() < success_rate)

                    grade_entries.append(GradeEntry(
                        grade=grade,
                        attempts=attempts,
                        completed=completed
                    ))

                # Add session rating (1-10, weighted toward 6-8)
                rating = random.choices(
                    range(1, 11),
                    weights=[1, 1, 2, 3, 5, 8, 8, 5, 3, 2]  # Bell curve around 6-7
                )[0]

                # Create session notes (sometimes)
                notes_options = [
                    "Great session! Felt strong today.",
                    "Struggled on overhangs but nailed the slabs.",
                    "Fingers felt tired, maybe overtrained.",
                    "New route set - very fun!",
                    "Worked on technique, less on grades.",
                    None, None, None  # 60% chance of no notes
                ]
                notes = random.choice(notes_options)

                # Create the session
                from src.crud import create_session
                session_data = SessionCreate(
                    location_id=location_id,
                    date=session_date,
                    grades=grade_entries,
                    rating=rating,
                    notes=notes
                )

                create_session(db, session_data, user.id)
                total_sessions += 1

            print(f"   ✅ Created {num_sessions} sessions")

        print(f"\n✨ Successfully created {total_sessions} test sessions across {len(users)} users!")
        print("\n📊 Session statistics:")

        # Print some stats
        for user in users:
            from src.models import Session
            user_sessions = db.query(Session).filter(Session.user_id == user.id).count()
            print(f"   {user.username}: {user_sessions} sessions")

        print("\n💡 Now you can:")
        print("   1. Login with any test user (password: password123)")
        print("   2. View the Dashboard to see charts populated with data")
        print("   3. Test filters (location, date range)")
        print("   4. View location pages to see aggregate stats")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding test sessions: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🧪 Seeding test climbing sessions for development...")
    print("⚠️  WARNING: This is for development/testing only!\n")
    seed_test_sessions()
