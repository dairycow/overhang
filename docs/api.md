# API Documentation

This document describes the Overhang climbing progress tracking API. All endpoints return JSON responses.

## Base URL
```
http://localhost:8000
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Health Check

### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "healthy"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "home_location_id": 1
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `400 Bad Request`: Username already exists or invalid home location

### POST /auth/login
Authenticate and get access token.

**Request Body (form-encoded):**
```
username=string&password=string
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401 Unauthorized`: Invalid credentials

### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "username": "climber123",
  "home_location_id": 1,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Location Endpoints

### GET /locations
Get all climbing locations.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Crux Climbing Center",
    "slug": "crux-climbing-center",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### GET /locations/{slug}
Get a specific location by slug.

**Parameters:**
- `slug`: Location slug (URL-friendly identifier)

**Response:**
```json
{
  "id": 1,
  "name": "Crux Climbing Center",
  "slug": "crux-climbing-center",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `404 Not Found`: Location not found

---

## Session Endpoints

### POST /sessions
Create a new climbing session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "location_id": 1,
  "date": "2024-01-15",
  "grades": [
    {
      "grade": "V0",
      "attempts": 3,
      "completed": 2
    },
    {
      "grade": "V3",
      "attempts": 5,
      "completed": 1
    }
  ],
  "rating": 8,
  "notes": "Great session, felt strong on V0s"
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "user_id": 1,
  "location_id": 1,
  "location_name": "Crux Climbing Center",
  "date": "2024-01-15",
  "grades": [
    {
      "grade": "V0",
      "attempts": 3,
      "completed": 2
    },
    {
      "grade": "V3",
      "attempts": 5,
      "completed": 1
    }
  ],
  "rating": 8,
  "notes": "Great session, felt strong on V0s",
  "created_at": "2024-01-15T20:00:00Z"
}
```

**Errors:**
- `400 Bad Request`: Invalid location
- `401 Unauthorized`: Not authenticated

### GET /sessions
Get user's climbing sessions with optional filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `location_id` (optional): Filter by location ID
- `start_date` (optional): Filter sessions from this date (YYYY-MM-DD)
- `end_date` (optional): Filter sessions until this date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 123,
    "user_id": 1,
    "location_id": 1,
    "location_name": "Crux Climbing Center",
    "date": "2024-01-15",
    "grades": [
      {
        "grade": "V0",
        "attempts": 3,
        "completed": 2
      }
    ],
    "rating": 8,
    "notes": "Great session",
    "created_at": "2024-01-15T20:00:00Z"
  }
]
```

### GET /sessions/{session_id}
Get a specific session by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `session_id`: Session ID

**Response:**
```json
{
  "id": 123,
  "user_id": 1,
  "location_id": 1,
  "location_name": "Crux Climbing Center",
  "date": "2024-01-15",
  "grades": [
    {
      "grade": "V0",
      "attempts": 3,
      "completed": 2
    }
  ],
  "rating": 8,
  "notes": "Great session",
  "created_at": "2024-01-15T20:00:00Z"
}
```

**Errors:**
- `404 Not Found`: Session not found or doesn't belong to user

### PUT /sessions/{session_id}
Update an existing session.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `session_id`: Session ID

**Request Body:**
```json
{
  "grades": [
    {
      "grade": "V0",
      "attempts": 4,
      "completed": 3
    }
  ],
  "rating": 9,
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "id": 123,
  "user_id": 1,
  "location_id": 1,
  "location_name": "Crux Climbing Center",
  "date": "2024-01-15",
  "grades": [
    {
      "grade": "V0",
      "attempts": 4,
      "completed": 3
    }
  ],
  "rating": 9,
  "notes": "Updated notes",
  "created_at": "2024-01-15T20:00:00Z"
}
```

**Errors:**
- `404 Not Found`: Session not found or doesn't belong to user

### DELETE /sessions/{session_id}
Delete a session.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `session_id`: Session ID

**Response:** 204 No Content

**Errors:**
- `404 Not Found`: Session not found or doesn't belong to user

---

## Statistics Endpoints

### GET /stats/user/progress
Get user's climbing progress over time (for line charts).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `location_id` (optional): Filter by location ID
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "grade": "V0"
  },
  {
    "date": "2024-01-15",
    "grade": "V3"
  },
  {
    "date": "2024-01-16",
    "grade": "V0"
  }
]
```

### GET /stats/user/distribution
Get user's grade distribution (for pie charts).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `location_id` (optional): Filter by location ID
- `period`: Time period - "today", "week", "month", or "all" (default: "all")

**Response:**
```json
{
  "VB": 5,
  "V0": 12,
  "V3": 8,
  "V4-V6": 3,
  "V6-V8": 1,
  "V7-V10": 0
}
```

### GET /stats/location/{location_id}
Get statistics for a specific location.

**Parameters:**
- `location_id`: Location ID

**Response:**
```json
{
  "total_climbs": 245,
  "grade_distribution": {
    "VB": 45,
    "V0": 89,
    "V3": 67,
    "V4-V6": 32,
    "V6-V8": 10,
    "V7-V10": 2
  }
}
```

### GET /stats/aggregate
Get aggregate statistics across all users and locations.

**Query Parameters:**
- `period`: Time period - "today", "week", "month", or "all" (default: "all")
- `location_id` (optional): Filter by specific location

**Response:**
```json
{
  "total_climbs": 1247,
  "by_location": [
    {
      "location_id": 1,
      "name": "Crux Climbing Center",
      "count": 245
    },
    {
      "location_id": 2,
      "name": "Vertical Ventures",
      "count": 189
    }
  ],
  "grade_distribution": {
    "VB": 234,
    "V0": 456,
    "V3": 321,
    "V4-V6": 156,
    "V6-V8": 67,
    "V7-V10": 13
  }
}
```

### GET /stats/aggregate/progress
Get aggregate progress over time across all users (for network-wide line charts).

**Query Parameters:**
- `location_id` (optional): Filter by location ID
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "grade": "V0"
  },
  {
    "date": "2024-01-15",
    "grade": "V3"
  }
]
```

---

## Data Models

### Grades
Valid climbing grades: `VB`, `V0`, `V3`, `V4-V6`, `V6-V8`, `V7-V10`

### Grade Colors (for charts)
- VB: Blue (#3B82F6)
- V0: Red (#EF4444)
- V3: Purple (#A855F7)
- V4-V6: Black (#1F2937)
- V6-V8: Yellow (#EAB308)
- V7-V10: White (#F3F4F6)

### Error Responses
All endpoints may return standard HTTP error responses:
```json
{
  "detail": "Error message"
}
```

---

## Rate Limiting
Currently no rate limiting is implemented.

## CORS
CORS is enabled for all origins in development. In production, configure allowed origins in settings.
