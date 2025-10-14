# Database Seeding Scripts

This directory contains scripts for populating the database with initial data.

## Scripts Overview

### Production Scripts

#### `seed_locations.py`
Seeds the 5 gym locations into the database.

**Usage:**
```bash
python scripts/seed_locations.py
# Or: tox -e seed
```

**Creates:**
- Blochaus Fhyswick, Canberra
- Blochaus Mitchell, Canberra
- Blochaus Port Melbourne, Melbourne
- Blochaus Marrickville, Sydney
- Blochaus Leichhardt, Sydney

**Safe for production:** ✅ Yes

---

### Development/Testing Scripts

#### `seed_test_users.py`
Creates test user accounts for development.

**Usage:**
```bash
python scripts/seed_test_users.py
```

**Creates:**
- 5 test users (harry, alice, bob, charlie, diana)
- Each assigned to a different home location
- All with password: `password123`

**Safe for production:** ❌ No - Contains test credentials

---

#### `seed_test_sessions.py`
Generates realistic climbing session data for testing.

**Usage:**
```bash
python scripts/seed_test_sessions.py
```

**Creates:**
- ~100 realistic climbing sessions
- Distributed across 5 users
- Spread over last 60 days
- Simulates different skill levels:
  - harry: beginner (VB, V0, V3)
  - alice: intermediate (V0, V3, V4-V6)
  - bob: advanced (V3, V4-V6, V6-V8)
  - charlie: expert (V4-V6, V6-V8, V7-V10)
  - diana: intermediate (V0, V3, V4-V6)

**Features:**
- Realistic attempt/completion ratios
- Random ratings (1-10, weighted toward 6-8)
- Occasional session notes
- More recent sessions than older ones
- Users favor their home location 60% of the time

**Safe for production:** ❌ No - Test data only

---

#### `seed_all_test_data.py`
Master script that runs all test seeding in the correct order.

**Usage:**
```bash
python scripts/seed_all_test_data.py
# Or: tox -e seed-test
```

**Creates:**
1. Locations (if not exist)
2. Test users (if not exist)
3. Test sessions (always creates new)

**Safe for production:** ❌ No - Test data only

---

### Legacy Scripts

#### `seed_data.py`
Original seeding script (now superseded by the scripts above).

**Status:** Deprecated - Use `seed_locations.py` instead

---

## Quick Reference

### Production Deployment
```bash
# Seed locations only
tox -e seed
```

### Development Setup
```bash
# Seed everything (locations + test data)
tox -e seed-test
```

### Reset Database
```bash
# From repo root
./scripts/db-reset.sh
# Choose option:
#   1 = Production seed (locations only)
#   2 = Test seed (locations + users + sessions)
```

---

## Test User Credentials

**Username:** `harry`, `alice`, `bob`, `charlie`, or `diana`
**Password:** `password123`

### User Details

| Username | Skill Level  | Home Location                    | Sessions |
|----------|-------------|----------------------------------|----------|
| harry    | Beginner    | Blochaus Fhyswick, Canberra      | ~20-25   |
| alice    | Intermediate| Blochaus Mitchell, Canberra      | ~15-20   |
| bob      | Advanced    | Blochaus Port Melbourne          | ~15-20   |
| charlie  | Expert      | Blochaus Marrickville, Sydney    | ~15-20   |
| diana    | Intermediate| Blochaus Leichhardt, Sydney      | ~20-25   |

---

## Testing the Visualizations

After seeding test data:

1. **Start the servers:**
   ```bash
   ./scripts/run-dev.sh
   ```

2. **Login with a test user:**
   - Go to http://localhost:3001
   - Username: `harry` (or any test user)
   - Password: `password123`

3. **View populated charts:**
   - Dashboard: Progress over time + Grade distribution
   - Homepage: Network activity chart
   - Location pages: Location-specific stats

4. **Test filters:**
   - Filter by location
   - Filter by date range (Today/Week/Month/All)
   - Custom date range

---

## Data Volume

### Production Seed
- 5 locations
- 0 users
- 0 sessions
- **Database size:** ~20 KB

### Test Seed
- 5 locations
- 5 users
- ~100 sessions (15-25 per user)
- ~200-300 grade entries total
- **Database size:** ~100-200 KB

---

## Safety Notes

⚠️ **Never run test seeding scripts in production!**

- `seed_locations.py` ✅ Safe for production
- `seed_test_users.py` ❌ Contains hardcoded passwords
- `seed_test_sessions.py` ❌ Creates fake data
- `seed_all_test_data.py` ❌ Runs test scripts

Always use `tox -e seed` (not `tox -e seed-test`) for production deployments.

---

## Troubleshooting

### "No locations found"
Run `seed_locations.py` first before seeding users or sessions.

### "User already exists"
The script will skip existing users. To recreate, delete the database and reseed.

### "Database locked"
Make sure the backend server is not running when seeding.

### Sessions not appearing
Check that you're logged in as the correct user. Each user only sees their own sessions.

---

## Future Enhancements

Possible additions for test data:
- More varied session patterns (injuries, vacations, etc.)
- Team/friend sessions at same location/date
- Route-specific data (when feature is added)
- Export/import test data as JSON

---

**Last Updated:** 2025-10-13
