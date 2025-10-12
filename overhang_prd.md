# Overhang MVP - Product Requirements Document

**Version:** 1.0  
**Date:** October 12, 2025  
**Domain:** overhang.au  
**Project Type:** Climbing Progress Tracking Application

---

## 1. Executive Summary

Overhang is a climbing progress tracking application for climbers at a chain of climbing gyms in Australia. The MVP enables climbers to create accounts, log their climbing sessions across multiple gym locations, and visualize their progress over time.

### Goals
- Simple user registration and authentication (username + password only)
- Track climbing attempts and completions by grade across all gym locations
- Visualize personal progress and gym-wide statistics
- Deploy on a cheap VM ($5-10/month) with minimal operational overhead

---

## 2. Technical Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT tokens via python-jose
- **Password Hashing:** passlib with bcrypt
- **Server:** Uvicorn (ASGI)

### Frontend
- **Templates:** Jinja2 (server-side rendering)
- **Styling:** Tailwind CSS (CDN)
- **Charts:** Chart.js (CDN)
- **JavaScript:** Vanilla JS

### Development Tools
- **Package Manager:** uv
- **Dependency Management:** pyproject.toml
- **Testing:** pytest with pytest-asyncio and pytest-cov
- **Linting:** black + ruff
- **Type Checking:** mypy
- **Local CI/CD:** tox

### Deployment
- Single Ubuntu/Debian VM
- Nginx (reverse proxy + SSL termination)
- Let's Encrypt (SSL certificates)
- Systemd (process management)

---

## 3. Project Structure

```
overhang/
├── README.md
├── .gitignore
├── packages/
│   └── backend/
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py             # FastAPI app entry
│       │   ├── config.py           # Settings/environment vars
│       │   ├── database.py         # DB connection
│       │   ├── models.py           # SQLAlchemy models
│       │   ├── schemas.py          # Pydantic schemas
│       │   ├── crud.py             # Database operations
│       │   ├── auth.py             # JWT authentication
│       │   ├── dependencies.py     # FastAPI dependencies
│       │   ├── routers/
│       │   │   ├── __init__.py
│       │   │   ├── auth.py         # Auth endpoints
│       │   │   ├── sessions.py     # Session logging
│       │   │   ├── locations.py    # Location endpoints
│       │   │   ├── stats.py        # Stats/charts endpoints
│       │   │   └── pages.py        # HTML page routes
│       │   ├── static/
│       │   │   ├── css/
│       │   │   │   └── styles.css
│       │   │   └── js/
│       │   │       ├── app.js
│       │   │       └── charts.js
│       │   └── templates/
│       │       ├── base.html
│       │       ├── index.html
│       │       ├── login.html
│       │       ├── register.html
│       │       ├── dashboard.html
│       │       └── location.html
│       ├── scripts/
│       │   └── seed_locations.py
│       ├── tests/
│       │   ├── __init__.py
│       │   ├── conftest.py
│       │   ├── test_auth.py
│       │   └── test_sessions.py
│       ├── pyproject.toml
│       ├── tox.ini
│       ├── .env.example
│       └── README.md
├── deployment/
│   ├── nginx/
│   │   └── overhang.conf
│   ├── systemd/
│   │   └── overhang.service
│   └── README.md
├── docs/
│   ├── api.md
│   ├── setup.md
│   └── deployment.md
└── scripts/
    ├── setup-dev.sh
    └── deploy.sh
```

---

## 4. Database Schema

### Tables

#### locations
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| name | VARCHAR | UNIQUE, NOT NULL |
| slug | VARCHAR | UNIQUE, NOT NULL |
| created_at | DATETIME | DEFAULT NOW |

**Initial Data:**
- Fhyswick, Canberra
- Mitchell, Canberra
- Port Melbourne, Melbourne
- Marrickville, Sydney
- Leichhardt, Sydney

#### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| username | VARCHAR | UNIQUE, NOT NULL |
| password_hash | VARCHAR | NOT NULL |
| home_location_id | INTEGER | FOREIGN KEY → locations.id |
| created_at | DATETIME | DEFAULT NOW |

#### sessions
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY |
| user_id | INTEGER | FOREIGN KEY → users.id |
| location_id | INTEGER | FOREIGN KEY → locations.id |
| grade | VARCHAR | NOT NULL |
| date | DATE | DEFAULT TODAY |
| attempts | INTEGER | NOT NULL |
| completed | BOOLEAN | NOT NULL |
| rating | INTEGER | NULLABLE |
| notes | TEXT | NULLABLE |
| created_at | DATETIME | DEFAULT NOW |

### Relationships
- User has one home_location (many-to-one with locations)
- User has many sessions (one-to-many)
- Location has many sessions (one-to-many)
- Session belongs to one user and one location

---

## 5. Climbing Grades

The gym uses the V-scale grading system with color coding:

| Grade | Color | Description |
|-------|-------|-------------|
| VB | Blue | Beginner |
| V0 | Red | Entry level |
| V3 | Purple | Intermediate |
| V4-V6 | Black | Advanced |
| V6-V8 | Yellow | Expert |
| V7-V10 | White | Elite |

**Implementation Note:** Store grade as string enum in database (e.g., "VB", "V0", "V3", "V4-V6", "V6-V8", "V7-V10")

---

## 6. API Endpoints

### Authentication
```
POST   /auth/register          Register new user
POST   /auth/login             Login (returns JWT token)
GET    /auth/me                Get current user info
```

### Locations
```
GET    /locations              List all gym locations
GET    /locations/{slug}       Get specific location details
```

### Sessions (Climbing Logs)
```
POST   /sessions               Log a climbing session
GET    /sessions               Get user's sessions (filterable by location, date range)
GET    /sessions/{id}          Get specific session
PUT    /sessions/{id}          Update session
DELETE /sessions/{id}          Delete session
```

### Statistics
```
GET    /stats/user/progress              User's grade progression over time
GET    /stats/user/distribution          User's grade distribution (pie chart data)
GET    /stats/location/{id}              Aggregate stats for a location
GET    /stats/aggregate                  Network-wide aggregate stats
```

### Pages (HTML)
```
GET    /                       Homepage with aggregate stats
GET    /login                  Login page
GET    /register               Registration page
GET    /dashboard              User dashboard with charts
GET    /location/{slug}        Individual gym location page
```

---

## 7. User Stories

### US-1: User Registration
**As a** climber  
**I want to** create an account with a username and password  
**So that** I can start tracking my climbing progress

**Acceptance Criteria:**
- User provides username, password, and selects home gym location
- Username must be unique
- Password must be at least 8 characters
- Upon successful registration, user is logged in automatically
- User receives JWT token for authentication

### US-2: User Login
**As a** registered user  
**I want to** log in with my username and password  
**So that** I can access my climbing data

**Acceptance Criteria:**
- User provides username and password
- System validates credentials
- Upon success, user receives JWT token
- User is redirected to dashboard

### US-3: Log Climbing Session
**As a** logged-in user  
**I want to** log a climbing session  
**So that** I can track my progress

**Acceptance Criteria:**
- User selects grade (Blue, Red, Purple, Black, Yellow, White)
- User selects location (defaults to home gym)
- User enters number of attempts
- User marks whether climb was completed
- User optionally rates their session out of 10
- User can optionally add notes
- User can optionally select date or session is saved with current date

### US-4: View Personal Progress
**As a** logged-in user  
**I want to** see my climbing progress over time  
**So that** I can track my improvement

**Acceptance Criteria:**
- Dashboard shows line graph of grades climbed over time
- Dashboard shows pie chart of grade distribution
- User can filter by location (all gyms or specific gym)
- User can filter by date range (today, week, month, all time)

### US-5: View Location Stats
**As a** logged-in user  
**I want to** see aggregate statistics for each gym location  
**So that** I can understand gym-wide activity

**Acceptance Criteria:**
- Location page shows total climbs for that location
- Shows grade distribution for that location
- Shows activity trends (climbs per day/week)

### US-6: Homepage Statistics
**As a** visitor or logged-in user  
**I want to** see network-wide climbing statistics  
**So that** I can see overall gym activity

**Acceptance Criteria:**
- Homepage shows total climbs across all locations
- Shows breakdown by location
- Shows aggregate grade distribution
- Shows weekly activity trends

---

## 8. Data Visualizations

### User Dashboard

#### Chart 1: Progress Over Time (Line Chart)
- **X-axis:** Date
- **Y-axis:** Grade (VB → V7-V10)
- **Data:** All completed climbs over time
- **Filter:** Location (all/specific), Date range
- **Endpoint:** `GET /stats/user/progress?location_id=X&start_date=Y&end_date=Z`

#### Chart 2: Grade Distribution (Pie Chart)
- **Segments:** Each grade (VB, V0, V3, etc.)
- **Colors:** Match gym color coding (Blue, Red, Purple, Black, Yellow, White)
- **Data:** Count of climbs per grade
- **Filter:** Location (all/specific), Date range (today/week/month/all)
- **Endpoint:** `GET /stats/user/distribution?location_id=X&period=today|week|month|all`

### Homepage

#### Chart 3: Network Activity (Bar Chart)
- **X-axis:** Location name
- **Y-axis:** Total climbs
- **Data:** Aggregate climbs per location
- **Period:** Last 7 days
- **Endpoint:** `GET /stats/aggregate?period=week`

### Location Page

#### Chart 4: Location Grade Distribution (Pie Chart)
- Same as Chart 2 but for all users at that location
- **Endpoint:** `GET /stats/location/{id}/distribution`

---

## 9. Authentication Flow

### Registration
1. User submits registration form (username, password, home_location_id)
2. Backend validates input (username unique, password length)
3. Backend hashes password with bcrypt
4. Backend creates user record
5. Backend generates JWT token
6. Backend returns token + user info
7. Frontend stores token in localStorage
8. Frontend redirects to dashboard

### Login
1. User submits login form (username, password)
2. Backend validates credentials
3. Backend generates JWT token
4. Backend returns token + user info
5. Frontend stores token in localStorage
6. Frontend redirects to dashboard

### Protected Routes
1. Frontend includes JWT token in Authorization header
2. Backend validates token using dependency injection
3. Backend extracts user_id from token
4. Backend processes request with authenticated user context

**Token Expiry:** 1 week (10,080 minutes)

---

## 10. UI/UX Guidelines

### Design Principles
- **Simple and clean:** Minimal UI, focus on functionality
- **Mobile-friendly:** Responsive design for phone use at gym
- **Fast data entry:** Quick session logging is priority
- **Visual feedback:** Use grade colors throughout interface

### Key Pages

#### Login Page
- Simple form: username, password, submit button
- Link to registration page
- No social login

#### Registration Page
- Form: username, password, home gym dropdown, submit button
- Validation messages inline
- Link back to login

#### Dashboard
- Header: Username, current location, logout button
- Quick log session form at top (collapsed/expandable)
- Two charts: Progress line chart, Distribution pie chart
- Location filter dropdown
- Date range filter
- Recent sessions list (last 10)

#### Homepage (Public)
- Brief description of Overhang
- Network statistics (total climbs, active climbers)
- Location breakdown chart
- Login/Register buttons for non-authenticated users

#### Location Page
- Location name and details
- Aggregate statistics for that location
- Grade distribution chart
- Weekly activity chart

### Color Scheme
- Use gym grade colors for data visualization
- Neutral background (white/light gray)
- Primary action color: Blue (#3B82F6)
- Error color: Red (#EF4444)
- Success color: Green (#10B981)

---

## 11. Development Environment Setup

### Prerequisites
- Python 3.11+
- uv (package manager)
- Git

### Setup Steps
```bash
# Clone repository
git clone <repo-url>
cd overhang

# Run setup script
./scripts/setup-dev.sh

# Activate environment
cd packages/backend
source .venv/bin/activate

# Run development server
tox -e dev
```

### Development Commands
```bash
# Run tests
tox

# Run linting
tox -e lint

# Format code
tox -e format

# Type checking
tox -e type

# Run dev server
tox -e dev

# Seed database
tox -e seed
```

---

## 12. Testing Requirements

### Unit Tests
- All CRUD operations (create, read, update, delete)
- Authentication logic (registration, login, token validation)
- Password hashing and verification
- Input validation

### Integration Tests
- Full authentication flow
- Session creation with valid/invalid data
- Statistics endpoints return correct aggregations
- Location filtering works correctly

### API Tests
- All endpoints return correct status codes
- Protected endpoints reject unauthenticated requests
- Request/response schemas match Pydantic models

### Minimum Coverage
- 80% code coverage required
- All critical paths must be tested

---

## 13. Deployment Requirements

### Environment Variables
```bash
DATABASE_URL=sqlite:///./overhang.db
SECRET_KEY=<random-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=production
ALLOWED_ORIGINS=https://overhang.au
```

### Server Requirements
- **OS:** Ubuntu 22.04 LTS
- **RAM:** 1GB minimum
- **Storage:** 10GB minimum
- **Network:** Public IP, ports 80 and 443 open

### Deployment Steps
1. Provision VM
2. Install system dependencies (Python 3.11, Nginx, certbot)
3. Clone repository
4. Install uv and dependencies
5. Configure environment variables
6. Seed database with locations
7. Set up Systemd service
8. Configure Nginx reverse proxy
9. Obtain SSL certificate from Let's Encrypt
10. Start services

### Nginx Configuration
- Reverse proxy to Uvicorn on port 8000
- SSL termination
- Static file serving
- GZIP compression
- Security headers

### Monitoring
- Application logs via Systemd journal
- Basic uptime monitoring (external service)
- Database backups (daily SQLite file copy)

---

## 14. Security Considerations

### Authentication
- Passwords hashed with bcrypt (cost factor 12+)
- JWT tokens with 1-week expiry
- Tokens stored client-side in localStorage
- No password reset functionality in MVP (manual admin process)

### Input Validation
- All API inputs validated via Pydantic schemas
- SQL injection prevented via SQLAlchemy ORM
- XSS prevented via Jinja2 auto-escaping

### HTTPS
- All traffic over HTTPS in production
- Let's Encrypt SSL certificates
- HTTP redirects to HTTPS

### Rate Limiting
- Not required for MVP (small user base)
- Consider adding if abuse detected

---

## 15. Out of Scope (Post-MVP)

The following features are explicitly **not** included in MVP:

- Password reset/recovery
- Email verification
- User profiles (beyond username)
- Social features (following, comments, likes)
- Climb-specific details (route setters, wall sections)
- Photo uploads
- Mobile apps (iOS/Android)
- Admin dashboard
- User roles/permissions
- Public profiles
- Leaderboards/competitions
- Route rating system
- Gym check-in system
- Payment/subscription system

---

## 16. Success Metrics

### MVP Launch Criteria
- [ ] All API endpoints functional and tested
- [ ] All three visualizations working (line, pie, bar charts)
- [ ] User registration and login working
- [ ] Session logging and retrieval working
- [ ] Deployed to production with SSL
- [ ] At least 80% test coverage
- [ ] Documentation complete

### Initial Success Indicators (First Month)
- 50+ registered users
- 500+ logged climbing sessions
- System uptime > 99%
- No critical bugs reported

---

## 17. Timeline Estimate

**Total Estimate:** 3-5 days for experienced developer

### Day 1: Setup & Core Backend
- Project structure setup
- Database models and migrations
- Authentication system (JWT, password hashing)
- Basic CRUD operations

### Day 2: API Endpoints
- All router implementations
- Request/response schemas
- Input validation
- Basic error handling

### Day 3: Frontend & Visualization
- HTML templates (Jinja2)
- Tailwind CSS styling
- Chart.js integration
- Frontend JavaScript

### Day 4: Testing & Polish
- Unit tests
- Integration tests
- Bug fixes
- Documentation

### Day 5: Deployment
- Server setup
- Nginx configuration
- SSL certificates
- Production deployment
- Smoke testing

---

## 18. Open Questions

1. Should users be able to edit/delete past sessions? Yes
2. Should we show other users' activity publicly? No, only in aggregate for MVP
3. What happens if a gym location closes?
   - **Recommendation:** Soft delete (mark inactive, preserve historical data)
4. Should we validate that location_id exists when logging sessions?
   - **Recommendation:** Yes, enforce foreign key constraints

---

## 19. Handoff Checklist

Before starting development, ensure:
- [ ] Repository created with initial structure
- [ ] Domain (overhang.au) DNS configured
- [ ] VM provisioned and accessible
- [ ] Initial gym locations list confirmed
- [ ] Design mockups reviewed (if any)
- [ ] This PRD reviewed and approved
- [ ] Access to deployment server

---

## 20. Contact & Support

**Product Owner:** Harry Fleming 
**Domain:** overhang.au  
**Repository:** https://github.com/dairycow/overhang 
**Documentation:** `/docs` folder in repository

For questions during implementation, refer to:
- API documentation: `/docs/api.md`
- Setup guide: `/docs/setup.md`
- Deployment guide: `/docs/deployment.md`

---

**Document Version History**
- v1.0 (2025-10-12): Initial PRD for MVP