# Implementation Plan: API Endpoints

## Overview
Implement all REST API endpoints for authentication, locations, sessions, and statistics as defined in PRD section 6.

## Prerequisites
- Plan 02 (Database & Authentication) completed
- Database models and auth system working
- Test infrastructure in place

## Tasks

### 3.1 Main Application Setup (app/main.py)
- [ ] Create FastAPI app instance
- [ ] Configure CORS middleware (from config.ALLOWED_ORIGINS)
- [ ] Mount static files directory (`/static`)
- [ ] Configure Jinja2 templates
- [ ] Add startup event to create database tables
- [ ] Include all routers
- [ ] Add root path redirect or info endpoint

### 3.2 CRUD Operations (app/crud.py)
- [ ] User operations:
  - `create_user(db, username, password, home_location_id)`
  - `get_user_by_id(db, user_id)`
  - `get_user_by_username(db, username)`
- [ ] Location operations:
  - `get_locations(db)`
  - `get_location_by_id(db, location_id)`
  - `get_location_by_slug(db, slug)`
- [ ] Session operations:
  - `create_session(db, session_data, user_id)`
  - `get_sessions(db, user_id, location_id, start_date, end_date)`
  - `get_session_by_id(db, session_id, user_id)`
  - `update_session(db, session_id, user_id, session_data)`
  - `delete_session(db, session_id, user_id)`
- [ ] Statistics operations:
  - `get_user_progress(db, user_id, location_id, start_date, end_date)`
  - `get_user_distribution(db, user_id, location_id, period)`
  - `get_location_stats(db, location_id)`
  - `get_aggregate_stats(db, period)`

### 3.3 Authentication Router (app/routers/auth.py)
- [ ] `POST /auth/register`:
  - Validate input (UserCreate schema)
  - Check username uniqueness
  - Hash password
  - Create user record
  - Generate JWT token
  - Return token + user info
- [ ] `POST /auth/login`:
  - Validate credentials
  - Authenticate user
  - Generate JWT token
  - Return token + user info
- [ ] `GET /auth/me`:
  - Require authentication
  - Return current user info
- [ ] Error handling for duplicate username, invalid credentials

### 3.4 Locations Router (app/routers/locations.py)
- [ ] `GET /locations`:
  - Return all gym locations
  - No authentication required
- [ ] `GET /locations/{slug}`:
  - Return specific location by slug
  - Include basic stats (total sessions)
  - No authentication required

### 3.5 Sessions Router (app/routers/sessions.py)
- [ ] `POST /sessions`:
  - Require authentication
  - Validate SessionCreate schema
  - Validate location_id exists
  - Validate grade enum
  - Create session record
  - Return created session
- [ ] `GET /sessions`:
  - Require authentication
  - Filter by location_id (query param, optional)
  - Filter by start_date and end_date (query params, optional)
  - Return user's sessions
  - Order by date descending
- [ ] `GET /sessions/{id}`:
  - Require authentication
  - Verify session belongs to current user
  - Return session details
- [ ] `PUT /sessions/{id}`:
  - Require authentication
  - Verify session belongs to current user
  - Validate SessionUpdate schema
  - Update session
  - Return updated session
- [ ] `DELETE /sessions/{id}`:
  - Require authentication
  - Verify session belongs to current user
  - Delete session
  - Return 204 No Content

### 3.6 Statistics Router (app/routers/stats.py)
- [ ] `GET /stats/user/progress`:
  - Require authentication
  - Query params: location_id, start_date, end_date (all optional)
  - Return completed sessions over time with dates and grades
  - Format for Chart.js line chart
- [ ] `GET /stats/user/distribution`:
  - Require authentication
  - Query params: location_id, period (today/week/month/all)
  - Return count per grade
  - Format for Chart.js pie chart with grade colors
- [ ] `GET /stats/location/{id}`:
  - No authentication required
  - Return aggregate stats for location
  - Total climbs, grade distribution, activity trends
- [ ] `GET /stats/aggregate`:
  - No authentication required
  - Query param: period (week/month/all)
  - Return network-wide statistics
  - Total climbs, breakdown by location, grade distribution

### 3.7 Error Handling
- [ ] Add exception handlers for:
  - 404 Not Found
  - 401 Unauthorized
  - 403 Forbidden
  - 422 Validation Error
  - 500 Internal Server Error
- [ ] Return consistent error response format

### 3.8 Tests
- [ ] `tests/test_auth_endpoints.py`:
  - Test registration (success, duplicate username, weak password)
  - Test login (success, wrong password, non-existent user)
  - Test /auth/me (authenticated, unauthenticated)
- [ ] `tests/test_sessions.py`:
  - Test session creation (success, invalid data, invalid location)
  - Test session retrieval (own sessions only)
  - Test session filtering
  - Test session update (own session, other user's session)
  - Test session deletion (own session, other user's session)
- [ ] `tests/test_stats.py`:
  - Test progress endpoint
  - Test distribution endpoint
  - Test location stats
  - Test aggregate stats
  - Test filtering parameters

## Acceptance Criteria
- [ ] All API endpoints from PRD section 6 implemented
- [ ] All endpoints return correct status codes
- [ ] Protected endpoints require valid JWT token
- [ ] Users can only access/modify their own sessions
- [ ] Statistics calculations are accurate
- [ ] Input validation works via Pydantic schemas
- [ ] All endpoint tests pass
- [ ] Test coverage for routers > 85%

## Time Estimate
6-8 hours

## Dependencies
- Plan 02 must be complete

## Next Steps
After completion, proceed to Plan 04: Frontend & Visualizations
