# Implementation Plan: Database Models & Authentication

## Status: ✅ COMPLETE

## Overview
Implement SQLAlchemy models, database connection, and JWT-based authentication system.

## Implementation Notes
- **Schema Change:** Instead of separate `Climb` table, implemented `Session.grades` as JSON field for flexibility
- This allows multiple grade entries per session stored as structured JSON
- Simplifies the data model while maintaining full functionality
- All authentication using bcrypt + JWT working perfectly

## Completed Tasks

### 2.1 Database Connection
- [x] Create `src/database.py` with all required functionality
- [x] Add connection pooling configuration for SQLite
- [x] Database file path from config

### 2.2 Database Models (src/models.py)
- [x] Create `Location` model with all required fields and relationships
- [x] Create `User` model with password hashing and relationships
- [x] Create `Session` model with **JSON grades field** (instead of separate Climb table):
  - `grades: list[dict]` stored as JSON
  - Each grade entry: `{grade: str, attempts: int, completed: int}`
  - Supports multiple grades per session
  - `rating: int | None` - session-level rating (1-10)
  - `notes: str | None` - session-level notes

### 2.3 Pydantic Schemas (src/schemas.py)
- [x] Create `LocationBase`, `Location`, `LocationCreate` schemas
- [x] Create `UserBase`, `User`, `UserCreate` schemas
- [x] Create `GradeEntry` schema with validation for grade attempts/completed
- [x] Create `SessionBase`, `SessionCreate`, `SessionUpdate`, `Session` schemas
- [x] Create `Token`, `TokenData` schemas for authentication
- [x] Add validators for:
  - Grade (valid enum: VB, V0, V3, V4-V6, V6-V8, V7-V10)
  - Rating (1-10 range if provided)
  - Attempts (positive integer, must be > 0)
  - Completed (non-negative, must be <= attempts)

### 2.4 Authentication System (src/auth.py)
- [x] Password hashing functions using bcrypt
- [x] JWT token functions using python-jose
- [x] User authentication function

### 2.5 Dependencies (src/dependencies.py)
- [x] Create `get_current_user` dependency with OAuth2PasswordBearer
- [x] Create `get_current_active_user` wrapper

### 2.6 Database Seeding Script
- [x] Create `scripts/seed_data.py` with 5 gym locations:
  - Blochaus Fhyswick, Canberra
  - Blochaus Mitchell, Canberra
  - Blochaus Port Melbourne, Melbourne
  - Blochaus Marrickville, Sydney
  - Blochaus Leichhardt, Sydney

### 2.7 Tests
- [x] Test infrastructure set up in `tests/`
- [x] Integration tests for API endpoints created

## Achievements
- ✅ Clean JSON-based session model simplifies queries
- ✅ All authentication working with JWT + bcrypt
- ✅ Database initialization on app startup
- ✅ Comprehensive Pydantic validation
- ✅ All relationships and foreign keys working correctly

## Next Steps
Proceed to Plan 03: API Endpoints Implementation (COMPLETE)
