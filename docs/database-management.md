# Database Management

Guide for managing the production database.

## Database Location

The SQLite database is stored in a Docker volume at `/app/data/overhang.db` inside the backend container.

## Seeding Data

### Seed Locations (Production-Safe)

The location seeding script is idempotent (safe to run multiple times):

```bash
# Using the helper script
bash scripts/seed-production.sh

# Or directly
docker-compose exec backend python scripts/seed_locations.py
```

**Default locations:**
- Blochaus Fhyswick, Canberra
- Blochaus Mitchell, Canberra
- Blochaus Port Melbourne, Melbourne
- Blochaus Marrickville, Sydney
- Blochaus Leichhardt, Sydney

### View Existing Locations

```bash
docker-compose exec backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import Location

init_db()
db = SessionLocal()
locations = db.query(Location).all()
print('\nAvailable Locations:')
for loc in locations:
    print(f'  ID {loc.id}: {loc.name} ({loc.slug})')
db.close()
"
```

### Add Custom Location

```bash
docker-compose exec backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import Location

init_db()
db = SessionLocal()

# Add your custom location
new_location = Location(
    name='Your Gym Name, City',
    slug='your-gym-slug'
)
db.add(new_location)
db.commit()
print(f'✅ Added location: {new_location.name} (ID: {new_location.id})')
db.close()
"
```

## Backup & Restore

### Create Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Copy database from container
docker-compose exec backend cp /app/data/overhang.db /tmp/overhang.db
docker cp overhang-backend:/tmp/overhang.db ~/backups/overhang-$(date +%Y%m%d-%H%M%S).db

echo "Backup saved to ~/backups/overhang-$(date +%Y%m%d-%H%M%S).db"
```

### Automated Backups

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * cd ~/apps/overhang && docker-compose exec -T backend cp /app/data/overhang.db /tmp/overhang.db && docker cp overhang-backend:/tmp/overhang.db ~/backups/overhang-$(date +\%Y\%m\%d).db

# Keep only last 30 days of backups
0 3 * * * find ~/backups -name "overhang-*.db" -mtime +30 -delete
```

### Restore from Backup

```bash
# Stop the backend
docker-compose stop backend

# Copy backup to container
docker cp ~/backups/overhang-YYYYMMDD-HHMMSS.db overhang-backend:/tmp/restore.db

# Restore the database
docker-compose exec backend cp /tmp/restore.db /app/data/overhang.db

# Restart backend
docker-compose start backend

# Verify
docker-compose logs -f backend
```

## Database Inspection

### Check Database Stats

```bash
docker-compose exec backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import User, Location, Session

init_db()
db = SessionLocal()

print('\nDatabase Statistics:')
print(f'  Users: {db.query(User).count()}')
print(f'  Locations: {db.query(Location).count()}')
print(f'  Sessions: {db.query(Session).count()}')

db.close()
"
```

### View Recent Users

```bash
docker-compose exec backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import User

init_db()
db = SessionLocal()

users = db.query(User).order_by(User.created_at.desc()).limit(10).all()
print('\nRecent Users:')
for user in users:
    print(f'  {user.username} (ID: {user.id}, Created: {user.created_at})')

db.close()
"
```

### View Recent Sessions

```bash
docker-compose exec backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import Session

init_db()
db = SessionLocal()

sessions = db.query(Session).order_by(Session.created_at.desc()).limit(10).all()
print('\nRecent Sessions:')
for session in sessions:
    print(f'  User {session.user_id} at {session.location_name} on {session.date}')

db.close()
"
```

## Database Migrations

Currently using SQLAlchemy with SQLite. For future migrations:

### Option 1: Alembic (Recommended for Schema Changes)

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

### Option 2: Manual Migration

For simple changes:

```python
# Example: Add column to existing table
docker-compose exec backend python -c "
from sqlalchemy import text
from src.database import engine

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE users ADD COLUMN email TEXT'))
    conn.commit()
"
```

## Troubleshooting

### Database Locked Error

SQLite can lock if multiple processes access simultaneously:

```bash
# Restart backend
docker-compose restart backend

# If persists, check for stale connections
docker-compose exec backend lsof /app/data/overhang.db
```

### Database Corrupted

```bash
# Check integrity
docker-compose exec backend sqlite3 /app/data/overhang.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
# See "Restore from Backup" section above
```

### Reset Database (Development Only!)

**WARNING: This deletes all data!**

```bash
# Stop backend
docker-compose stop backend

# Remove database
docker-compose exec backend rm /app/data/overhang.db

# Restart (will create fresh database)
docker-compose start backend

# Seed locations
bash scripts/seed-production.sh
```

## Best Practices

1. **Backup before major updates**
   ```bash
   bash scripts/backup-db.sh  # Create this script
   ```

2. **Test migrations locally first**
   ```bash
   # On dev machine
   cp overhang.db overhang.db.backup
   # Test migration
   # If successful, apply to production
   ```

3. **Monitor database size**
   ```bash
   docker-compose exec backend du -h /app/data/overhang.db
   ```

4. **Regular integrity checks**
   ```bash
   docker-compose exec backend sqlite3 /app/data/overhang.db "PRAGMA integrity_check;"
   ```

5. **Keep multiple backup versions**
   - Daily backups for last 30 days
   - Weekly backups for last 6 months
   - Monthly backups indefinitely

## Scaling Considerations

For high traffic, consider migrating to PostgreSQL:

### PostgreSQL Migration Steps

1. Export SQLite data
2. Create PostgreSQL container
3. Update `DATABASE_URL` in `.env.production`
4. Import data to PostgreSQL
5. Update `docker-compose.yml`

See [scaling guide](deployment.md#scaling) for details.
