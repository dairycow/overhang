"""
Migration script to convert from grades-based to problems-based session logging.

This script:
1. Adds default_grade column to users table
2. Creates problems table
3. Migrates existing session grades to individual problem records
4. Removes grades column from sessions table
5. Removes notes column from sessions table (notes moved to problems)

Run this script ONCE before deploying the new code.
"""

import sys
from pathlib import Path

# Add parent directory to path to import from src
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text

from src.config import settings
from src.database import SessionLocal, engine


def migrate():
    db = SessionLocal()

    try:
        print("Starting migration...")

        # Check if migration has already been run
        inspector_query = text("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='problems'
        """)
        result = db.execute(inspector_query).fetchone()
        if result:
            print("Migration already completed (problems table exists)")
            return

        # 1. Add default_grade column to users table
        print("Adding default_grade column to users table...")
        db.execute(text("""
            ALTER TABLE users ADD COLUMN default_grade VARCHAR NOT NULL DEFAULT 'V0'
        """))
        db.commit()

        # 2. Create problems table
        print("Creating problems table...")
        db.execute(text("""
            CREATE TABLE problems (
                id INTEGER PRIMARY KEY,
                session_id INTEGER NOT NULL,
                grade VARCHAR NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                sends INTEGER NOT NULL DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
            )
        """))
        db.execute(text("""
            CREATE INDEX ix_problems_session_id ON problems(session_id)
        """))
        db.commit()

        # 3. Migrate existing grades data to problems table
        print("Migrating existing session grades to problems...")
        sessions_query = text("SELECT id, grades, notes FROM sessions")
        sessions = db.execute(sessions_query).fetchall()

        migrated_count = 0
        for session_id, grades_json, session_notes in sessions:
            if grades_json:
                import json
                grades = json.loads(grades_json) if isinstance(grades_json, str) else grades_json

                for idx, grade_entry in enumerate(grades):
                    # For the first problem, use the session notes if available
                    problem_notes = session_notes if idx == 0 else None

                    insert_query = text("""
                        INSERT INTO problems (session_id, grade, attempts, sends, notes)
                        VALUES (:session_id, :grade, :attempts, :sends, :notes)
                    """)
                    db.execute(insert_query, {
                        'session_id': session_id,
                        'grade': grade_entry.get('grade'),
                        'attempts': grade_entry.get('attempts', 0),
                        'sends': grade_entry.get('completed', 0),  # 'completed' -> 'sends'
                        'notes': problem_notes
                    })
                    migrated_count += 1

        db.commit()
        print(f"Migrated {migrated_count} grade entries to problems")

        # 4. Remove grades and notes columns from sessions table
        # SQLite doesn't support DROP COLUMN, so we need to recreate the table
        print("Recreating sessions table without grades and notes columns...")

        # Create new sessions table
        db.execute(text("""
            CREATE TABLE sessions_new (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                location_id INTEGER NOT NULL,
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                rating INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (location_id) REFERENCES locations(id)
            )
        """))

        # Copy data from old table to new table
        db.execute(text("""
            INSERT INTO sessions_new (id, user_id, location_id, date, rating, created_at)
            SELECT id, user_id, location_id, date, rating, created_at FROM sessions
        """))

        # Drop old table and rename new table
        db.execute(text("DROP TABLE sessions"))
        db.execute(text("ALTER TABLE sessions_new RENAME TO sessions"))

        # Recreate indexes
        db.execute(text("CREATE INDEX ix_sessions_id ON sessions(id)"))
        db.execute(text("CREATE INDEX ix_sessions_user_id ON sessions(user_id)"))
        db.execute(text("CREATE INDEX ix_sessions_location_id ON sessions(location_id)"))
        db.execute(text("CREATE INDEX ix_sessions_date ON sessions(date)"))

        db.commit()

        print("Migration completed successfully!")

    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    print(f"Using database: {settings.database_url}")

    # Check if running in non-interactive mode (like CI/CD)
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        migrate()
    else:
        confirm = input("This will modify the database schema. Continue? (yes/no): ")
        if confirm.lower() == 'yes':
            migrate()
        else:
            print("Migration cancelled")
