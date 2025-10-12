import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal, init_db
from app.models import Location


def seed_locations():
    init_db()
    
    db = SessionLocal()
    
    try:
        existing_count = db.query(Location).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} location(s). Skipping seed.")
            return
        
        locations = [
            {"name": "Blochaus Fhyswick, Canberra", "slug": "bh-fhyswick-canberra"},
            {"name": "Blochaus Mitchell, Canberra", "slug": "bh-mitchell-canberra"},
            {"name": "Blochaus Port Melbourne, Melbourne", "slug": "bh-port-melbourne-melbourne"},
            {"name": "Blochaus Marrickville, Sydney", "slug": "bh-marrickville-sydney"},
            {"name": "Blochaus Leichhardt, Sydney", "slug": "bh-leichhardt-sydney"},
        ]
        
        for loc_data in locations:
            location = Location(**loc_data)
            db.add(location)
        
        db.commit()
        print(f"Successfully seeded {len(locations)} gym locations:")
        for loc in locations:
            print(f"  - {loc['name']} ({loc['slug']})")
    
    except Exception as e:
        db.rollback()
        print(f"Error seeding locations: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_locations()
