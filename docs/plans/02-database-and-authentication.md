# Implementation Plan: Database Models & Authentication

## Overview
Implement SQLAlchemy models, database connection, and JWT-based authentication system.

## Prerequisites
- Plan 01 (Project Setup) completed
- Project structure in place
- Dependencies installed

## Tasks

### 2.1 Database Connection
- [ ] Create `app/database.py`:
  - SQLAlchemy engine configuration
  - SessionLocal factory
  - Base declarative class
  - `get_db()` dependency function
  - Database initialization function
- [ ] Add connection pooling configuration for SQLite
- [ ] Add database file path from config

### 2.2 Database Models (app/models.py)
- [ ] Create `Location` model (PRD section 4):
  - id (Integer, primary key)
  - name (String, unique, not null)
  - slug (String, unique, not null)
  - created_at (DateTime, default now)
  - Relationship to sessions
- [ ] Create `User` model (PRD section 4):
  - id (Integer, primary key)
  - username (String, unique, not null)
  - password_hash (String, not null)
  - home_location_id (Integer, FK to locations.id)
  - created_at (DateTime, default now)
  - Relationship to sessions
  - Relationship to home_location
- [ ] Create `Session` model (PRD section 4):
  - id (Integer, primary key)
  - user_id (Integer, FK to users.id)
  - location_id (Integer, FK to locations.id)
  - grade (String enum: VB, V0, V3, V4-V6, V6-V8, V7-V10)
  - date (Date, default today)
  - attempts (Integer, not null)
  - completed (Boolean, not null)
  - rating (Integer, nullable, 1-10)
  - notes (Text, nullable)
  - created_at (DateTime, default now)
  - Relationships to user and location

### 2.3 Pydantic Schemas (app/schemas.py)
- [ ] Create `LocationBase`, `Location`, `LocationCreate` schemas
- [ ] Create `UserBase`, `User`, `UserCreate`, `UserLogin` schemas
- [ ] Create `SessionBase`, `SessionCreate`, `SessionUpdate`, `Session` schemas
- [ ] Create `Token`, `TokenData` schemas for authentication
- [ ] Add validators for:
  - Username (alphanumeric, 3-30 chars)
  - Password (min 8 chars)
  - Grade (valid enum values)
  - Rating (1-10 range if provided)
  - Attempts (positive integer)

### 2.4 Authentication System (app/auth.py)
- [ ] Password hashing functions:
  - `get_password_hash(password: str) -> str`
  - `verify_password(plain_password: str, hashed_password: str) -> bool`
- [ ] JWT token functions:
  - `create_access_token(data: dict, expires_delta: timedelta) -> str`
  - `decode_access_token(token: str) -> TokenData`
- [ ] User authentication:
  - `authenticate_user(db: Session, username: str, password: str) -> User | None`

### 2.5 Dependencies (app/dependencies.py)
- [ ] Create `get_current_user(token: str, db: Session) -> User` dependency:
  - Extract token from Authorization header
  - Decode and validate JWT token
  - Query user from database
  - Raise 401 if invalid/expired
- [ ] Create `get_current_active_user` (for future use)

### 2.6 Database Seeding Script
- [ ] Create `scripts/seed_locations.py`:
  - Connect to database
  - Create tables if not exist
  - Seed 5 gym locations from PRD section 4:
    - Fhyswick, Canberra
    - Mitchell, Canberra
    - Port Melbourne, Melbourne
    - Marrickville, Sydney
    - Leichhardt, Sydney
  - Generate slugs (lowercase, replace spaces with hyphens)
  - Skip if locations already exist
  - Print success message

### 2.7 Tests
- [ ] `tests/test_models.py`:
  - Test model creation
  - Test relationships
  - Test unique constraints
- [ ] `tests/test_auth.py`:
  - Test password hashing/verification
  - Test JWT token creation/decoding
  - Test user authentication
  - Test invalid credentials
  - Test expired tokens
  - Test get_current_user dependency

## Acceptance Criteria
- [ ] Database tables created successfully via SQLAlchemy
- [ ] All relationships work correctly
- [ ] Password hashing uses bcrypt with appropriate cost factor
- [ ] JWT tokens generate and validate correctly
- [ ] Seed script populates 5 locations
- [ ] All auth tests pass
- [ ] Test coverage for auth module > 90%

## Time Estimate
4-5 hours

## Dependencies
- Plan 01 must be complete

## Next Steps
After completion, proceed to Plan 03: API Endpoints Implementation
