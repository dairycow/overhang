# Migration Guide: Problem-Based Session Logging

This guide covers the migration from grade-aggregated sessions to individual problem tracking.

## Overview of Changes

### What Changed

**Before:**
- Sessions stored aggregated grades as JSON (e.g., "V3: 5 attempts, 3 sends")
- Session-level notes only
- No default grade preference

**After:**
- Each problem is tracked individually with its own grade, attempts, sends, and notes
- Users can set a default grade preference
- When adding a new problem, it defaults to the user's preferred grade
- Notes are per-problem instead of per-session

### Key Benefits

1. **Granular tracking** - Log each individual problem you work on
2. **Problem-specific notes** - Keep detailed notes for each problem
3. **Better defaults** - New problems default to your preferred grade
4. **More accurate statistics** - Statistics now reflect individual problem attempts

## Database Schema Changes

### New Tables/Columns

1. **`users` table** - Added `default_grade` column (VARCHAR, default 'V0')
2. **`problems` table** - New table with columns:
   - `id` (INTEGER, primary key)
   - `session_id` (INTEGER, foreign key to sessions)
   - `grade` (VARCHAR)
   - `attempts` (INTEGER)
   - `sends` (INTEGER)
   - `notes` (TEXT, nullable)
   - `created_at` (DATETIME)

### Modified Tables

1. **`sessions` table** - Removed columns:
   - `grades` (JSON field)
   - `notes` (moved to problems table)

## Migration Steps

### 1. Backup Your Database

```bash
# If using SQLite (default)
cp packages/backend/climbing.db packages/backend/climbing.db.backup

# Or wherever your database file is located
```

### 2. Run the Migration Script

```bash
cd packages/backend
python scripts/migrate_to_problems.py
```

The script will:
1. Add `default_grade` column to users (defaults to 'V0')
2. Create the `problems` table
3. Migrate existing grade data to individual problem records
4. Transfer session notes to the first problem in each session
5. Remove the old `grades` and `notes` columns from sessions

### 3. Verify Migration

The script will print progress and confirm successful completion. Check that:
- All your existing sessions are present
- Problem counts match your old grade entries
- No data was lost

### 4. Deploy Updated Code

```bash
# Install any new dependencies (if needed)
cd packages/backend
pip install -r requirements.txt

cd ../frontend
npm install

# Restart the application
# (Use your normal deployment process)
```

## API Changes

### New Endpoints

#### User Settings
- `PATCH /api/auth/me` - Update user settings including `default_grade`
  ```json
  {
    "default_grade": "V3",
    "home_location_id": 1
  }
  ```

#### Problems
- `POST /api/sessions/{session_id}/problems` - Add a problem to a session
  ```json
  {
    "grade": "V5",
    "attempts": 3,
    "sends": 1,
    "notes": "Great heel hook on the start"
  }
  ```
- `PUT /api/sessions/problems/{problem_id}` - Update a problem
- `DELETE /api/sessions/problems/{problem_id}` - Delete a problem

### Modified Endpoints

#### Sessions
- `POST /api/sessions` - Now accepts `problems` array instead of `grades`
  ```json
  {
    "location_id": 1,
    "date": "2025-01-15",
    "rating": 8,
    "problems": [
      {
        "grade": "V3",
        "attempts": 2,
        "sends": 1,
        "notes": "Really fun overhang problem"
      },
      {
        "grade": "V5",
        "attempts": 5,
        "sends": 0,
        "notes": "Couldn't get past the crux"
      }
    ]
  }
  ```

- `GET /api/sessions` - Now returns `problems` array instead of `grades`
  - `notes` field removed from sessions (now on problems)

## Frontend Changes

### New Components

- **UserSettings** (`/settings`) - Manage user preferences
  - Set default location
  - Set default grade

### Modified Components

#### SessionForm
- Click "add problem" to log individual problems
- Each problem has:
  - Grade selector (defaults to user's preferred grade)
  - Attempts counter
  - Sends counter
  - Notes field
- Remove individual problems with the remove button
- Session rating is still at the session level

#### SessionList
- Now displays each problem individually
- Shows problem-specific notes
- Summary statistics updated to count problems

## User Workflow Changes

### Old Workflow
1. Select date and location
2. Add grades with aggregate attempts/sends
3. Add session notes
4. Submit

### New Workflow
1. Select date and location
2. Click "add problem" for each problem you climbed
3. For each problem:
   - Select grade (defaults to your preference)
   - Set attempts and sends
   - Add notes about that specific problem
4. Set overall session rating
5. Submit

## Rollback Procedure

If you need to rollback:

1. Restore your database backup:
   ```bash
   cp packages/backend/climbing.db.backup packages/backend/climbing.db
   ```

2. Check out the previous commit:
   ```bash
   git checkout <previous-commit-hash>
   ```

3. Restart the application

## Testing Checklist

- [ ] Migration script runs without errors
- [ ] Existing sessions are visible
- [ ] Can create new session with problems
- [ ] Can add multiple problems to one session
- [ ] Problem notes are saved and displayed
- [ ] Default grade setting works
- [ ] Statistics/charts still work correctly
- [ ] Can edit user settings
- [ ] Session deletion works (cascade deletes problems)

## Support

If you encounter issues:

1. Check the migration script output for errors
2. Verify database backup was created before migration
3. Check backend logs for API errors
4. Ensure all dependencies are installed
