# Implementation Plan: Testing, Documentation & Deployment

## Status: 🔴 NOT STARTED

## Overview
Complete comprehensive testing, write documentation, and deploy the React SPA + FastAPI application to production.

## Prerequisites
- Plans 01-04 completed ✅ (Plan 04 in progress - visualizations needed)
- Application fully functional locally
- All features implemented

## Architecture Notes
- **Frontend:** React SPA built with Vite, served as static files
- **Backend:** FastAPI serving API + static frontend files
- **Deployment:** Single server, Nginx reverse proxy to FastAPI
- **Build process:** `npm run build` → `dist/` folder served by FastAPI

## Tasks

### 5.1 Comprehensive Testing

#### Backend Testing
- [ ] Achieve 80%+ test coverage:
  - Run `pytest --cov=src --cov-report=html`
  - Identify untested code paths
  - Add tests for uncovered areas
- [ ] Integration tests:
  - Full authentication flow (register → login → protected endpoint)
  - Session CRUD flow
  - Statistics calculation accuracy
  - Filter parameters work correctly
- [ ] Edge case tests:
  - Empty database (no sessions)
  - Invalid date ranges
  - Non-existent location IDs
  - Expired JWT tokens
  - Malformed requests
- [ ] Performance tests:
  - Statistics endpoints with large datasets (simulate 1000+ sessions)
  - Concurrent user sessions

#### Frontend Testing
- [ ] Add frontend test framework (optional for MVP):
  - Consider Vitest for unit tests
  - Consider React Testing Library for component tests
- [ ] Manual testing checklist (critical for SPA):
  - [ ] Homepage loads without authentication
  - [ ] Register new user
  - [ ] Login with correct credentials
  - [ ] Login with wrong credentials fails
  - [ ] Dashboard loads with charts
  - [ ] Log climbing session (multi-grade)
  - [ ] View session list
  - [ ] Charts display data correctly
  - [ ] Progress chart shows climbs over time
  - [ ] Distribution pie chart shows grade breakdown
  - [ ] Filter by location updates charts
  - [ ] Filter by date range updates charts
  - [ ] Edit session (if implemented)
  - [ ] Delete session (if implemented)
  - [ ] View location page with stats
  - [ ] View homepage network stats chart
  - [ ] Logout clears token and redirects
  - [ ] Test on mobile device (responsive charts)
  - [ ] Test on tablet (iPad)
  - [ ] Browser testing (Chrome, Firefox, Safari)

### 5.2 Documentation

#### API Documentation (docs/api.md)
- [ ] Document all endpoints with:
  - HTTP method and path
  - Request parameters/body schema
  - Response schema
  - Status codes
  - Authentication requirements
  - Example requests/responses (curl commands)
- [ ] Document error responses
- [ ] Document authentication flow with JWT

#### Setup Guide (docs/setup.md)
- [ ] Prerequisites section
- [ ] Step-by-step local development setup
- [ ] Environment variable configuration
- [ ] Database seeding instructions
- [ ] Running tests
- [ ] Running development server
- [ ] Troubleshooting common issues

#### Deployment Guide (docs/deployment.md)
- [ ] Server requirements (PRD section 13)
- [ ] Initial server setup:
  - Update system packages
  - Install Python 3.11
  - Install Nginx
  - Install Certbot
  - Configure firewall (ports 80, 443)
- [ ] Application deployment:
  - Clone repository
  - Create production .env file
  - Install uv and dependencies
  - Run database migrations
  - Seed gym locations
- [ ] Systemd service configuration:
  - Create `deployment/systemd/overhang.service`
  - User, WorkingDirectory, ExecStart
  - Restart policy
  - Enable and start service
- [ ] Nginx configuration:
  - Create `deployment/nginx/overhang.conf`
  - Reverse proxy to localhost:8000
  - Static file serving
  - GZIP compression
  - Security headers
  - Rate limiting (basic)
  - Test and reload Nginx
- [ ] SSL certificate setup:
  - Run certbot for overhang.au
  - Configure automatic renewal
  - Update Nginx for HTTPS
- [ ] Database backup strategy:
  - Daily cron job to copy SQLite file
  - Retention policy (keep 7 days)
  - Backup location
- [ ] Monitoring setup:
  - Log location (journalctl)
  - External uptime monitoring recommendation
  - Health check endpoint consideration
- [ ] Deployment checklist
- [ ] Rollback procedure

#### README Updates
- [ ] Update main README.md with:
  - Project description
  - Features list
  - Tech stack
  - Quick start guide
  - Link to full documentation
  - Contributing guidelines (if applicable)
  - License information

### 5.3 Frontend Build Integration

#### Serve React Build from FastAPI
- [ ] Update `src/main.py` to serve static files:
  ```python
  from fastapi.staticfiles import StaticFiles

  # Serve React build files
  app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

  # Catch-all route for React SPA (must be last)
  @app.get("/{full_path:path}")
  async def serve_spa(full_path: str):
      return FileResponse("../frontend/dist/index.html")
  ```
- [ ] Create build script:
  ```bash
  # scripts/build-frontend.sh
  cd packages/frontend
  npm run build
  cd ../..
  ```
- [ ] Update `.gitignore` to exclude `packages/frontend/dist/`
- [ ] Test locally that API routes work and frontend serves correctly

#### Production Build Process
- [ ] Document build steps in deployment guide:
  1. Pull latest code
  2. Build frontend: `cd packages/frontend && npm run build`
  3. Restart FastAPI service
  4. Frontend served from `/`, API at `/api/*` or same origin

### 5.4 Deployment Preparation

#### Environment Configuration
- [ ] Create production `.env` file:
  - Generate secure SECRET_KEY (64+ random characters)
  - Set DATABASE_URL for production SQLite location
  - Set ENVIRONMENT=production
  - Set ALLOWED_ORIGINS=https://overhang.au
  - Set appropriate token expiry
- [ ] Document environment variables in `.env.example`

#### Deployment Scripts
- [ ] Create `scripts/deploy.sh`:
  - Pull latest code
  - Activate virtual environment
  - Install/update dependencies
  - Run any migrations
  - Restart systemd service
  - Test health endpoint
  - Rollback on failure
- [ ] Make script executable

#### Database Migration
- [ ] Seed production database with gym locations:
  - Fhyswick, Canberra
  - Mitchell, Canberra
  - Port Melbourne, Melbourne
  - Marrickville, Sydney
  - Leichhardt, Sydney
- [ ] Verify foreign key constraints
- [ ] Test with sample data

### 5.4 Production Deployment

#### Server Provisioning
- [ ] Provision Ubuntu 22.04 VM:
  - 1GB+ RAM
  - 10GB+ storage
  - Public IP
  - SSH access configured
- [ ] Configure DNS:
  - Point overhang.au to server IP
  - Verify DNS propagation

#### Initial Deployment
- [ ] Follow deployment guide step-by-step
- [ ] Deploy application
- [ ] Configure Nginx and SSL
- [ ] Start services
- [ ] Verify application is accessible at https://overhang.au

#### Smoke Testing
- [ ] Test all critical paths on production:
  - [ ] Homepage loads
  - [ ] Registration works
  - [ ] Login works
  - [ ] Dashboard loads with charts
  - [ ] Log session works
  - [ ] Session appears in dashboard
  - [ ] Location pages load
  - [ ] Stats are accurate
  - [ ] Logout works
  - [ ] HTTPS works (no certificate errors)
  - [ ] HTTP redirects to HTTPS
- [ ] Test from mobile device
- [ ] Check application logs for errors
- [ ] Verify database file permissions

#### Monitoring Setup
- [ ] Set up external uptime monitoring (e.g., UptimeRobot, free tier)
- [ ] Configure alert notifications
- [ ] Document how to check logs:
  - `journalctl -u overhang.service -f`
- [ ] Set up daily database backup cron job
- [ ] Test backup restoration process

### 5.5 Post-Deployment

#### Performance Optimization
- [ ] Check page load times
- [ ] Optimize if needed:
  - Enable GZIP in Nginx
  - Add cache headers for static assets
  - Database query optimization
  - Consider adding indexes if queries are slow

#### Security Hardening
- [ ] Verify HTTPS-only access
- [ ] Check security headers (X-Frame-Options, CSP, etc.)
- [ ] Verify JWT secret is secure
- [ ] Check file permissions (database, logs)
- [ ] Review Nginx configuration for security best practices
- [ ] Test for common vulnerabilities:
  - SQL injection (should be prevented by ORM)
  - XSS (should be prevented by Jinja2 auto-escaping)
  - CSRF (consider adding protection if needed)

#### User Acceptance
- [ ] Create test user account
- [ ] Have product owner test all features
- [ ] Gather initial feedback
- [ ] Fix any critical bugs
- [ ] Create issue tracker for future enhancements

### 5.6 Handoff Documentation
- [ ] Create `docs/maintenance.md`:
  - How to add new gym locations
  - How to handle user issues (password resets manually)
  - How to backup/restore database
  - How to update application
  - Common troubleshooting
  - Log locations and how to read them
- [ ] Document admin procedures (manual password reset process)
- [ ] Document scaling considerations (if needed in future)

## Acceptance Criteria
- [ ] All tests pass with 80%+ coverage
- [ ] All documentation complete and accurate
- [ ] Application deployed to production at https://overhang.au
- [ ] SSL certificate active and auto-renewing
- [ ] Application accessible and functional
- [ ] All MVP features working in production
- [ ] Monitoring and backups configured
- [ ] Smoke tests pass
- [ ] No critical security issues
- [ ] Product owner sign-off received

## Time Estimate
8-10 hours (2-3 hours testing, 3-4 hours documentation, 3-4 hours deployment)

## Dependencies
- Plans 01-04 must be complete
- Access to production server
- DNS configured

## Success Metrics (First Month)
- [ ] 50+ registered users
- [ ] 500+ logged sessions
- [ ] System uptime > 99%
- [ ] No critical bugs reported
- [ ] Average page load time < 2 seconds
- [ ] Mobile usage tracked and functional

## Future Enhancements (Post-MVP)
Document ideas for v2.0:
- Password reset functionality
- Email verification
- User profiles
- Social features
- Route-specific details
- Photo uploads
- Mobile native apps
- Admin dashboard
