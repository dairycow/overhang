# Implementation Plan: Frontend & Visualizations

## Overview
Implement server-side rendered HTML pages using Jinja2 templates, Tailwind CSS styling, and Chart.js visualizations.

## Prerequisites
- Plan 03 (API Endpoints) completed
- All API endpoints functional and tested
- Understanding of climbing grade colors (PRD section 5)

## Tasks

### 4.1 Static Assets Setup
- [ ] Create `app/static/css/styles.css`:
  - Grade color variables (Blue, Red, Purple, Black, Yellow, White)
  - Custom utility classes
  - Form styling
  - Chart container styling
- [ ] Create `app/static/js/app.js`:
  - Authentication helpers (get/set/clear token from localStorage)
  - API request wrapper with Authorization header
  - Form submission handlers
  - Session logging form handler
  - Error display functions
  - Date range filter handlers

### 4.2 Chart.js Integration (app/static/js/charts.js)
- [ ] Progress line chart function:
  - Fetch data from `/stats/user/progress`
  - Configure Chart.js line chart
  - X-axis: dates
  - Y-axis: grades (VB through V7-V10)
  - Handle empty data state
- [ ] Grade distribution pie chart function:
  - Fetch data from `/stats/user/distribution`
  - Configure Chart.js pie chart
  - Use grade colors from PRD section 5
  - Show percentages
  - Handle empty data state
- [ ] Network activity bar chart function:
  - Fetch data from `/stats/aggregate`
  - Configure Chart.js bar chart
  - Show climbs per location
  - Handle empty data state
- [ ] Location distribution pie chart function:
  - Fetch data from `/stats/location/{id}/distribution`
  - Similar to user distribution
  - Handle empty data state

### 4.3 Base Template (app/templates/base.html)
- [ ] HTML structure with DOCTYPE, head, body
- [ ] Include Tailwind CSS CDN in head
- [ ] Include Chart.js CDN in head
- [ ] Navigation bar:
  - Logo/site name
  - Login/Register buttons (if not authenticated)
  - Dashboard link (if authenticated)
  - Logout button (if authenticated)
- [ ] Main content area with block for page content
- [ ] Footer with links
- [ ] Include app.js and charts.js at end of body
- [ ] Authentication state detection script

### 4.4 Homepage (app/templates/index.html)
- [ ] Extend base.html
- [ ] Hero section:
  - Site description
  - Call-to-action (Register/Login)
- [ ] Network statistics section:
  - Total climbs across network
  - Active locations count
- [ ] Network activity bar chart (last 7 days)
- [ ] List of gym locations with links
- [ ] If authenticated, show link to dashboard

### 4.5 Authentication Pages
- [ ] `app/templates/login.html`:
  - Extend base.html
  - Login form (username, password)
  - Submit button
  - Link to registration
  - Error message display area
  - Form submission to `/auth/login`
  - Store token and redirect to dashboard on success
- [ ] `app/templates/register.html`:
  - Extend base.html
  - Registration form (username, password, home_location dropdown)
  - Submit button
  - Link to login
  - Validation message display
  - Form submission to `/auth/register`
  - Store token and redirect to dashboard on success

### 4.6 Dashboard (app/templates/dashboard.html)
- [ ] Extend base.html
- [ ] Require authentication (redirect to login if not authenticated)
- [ ] Header with username and current location
- [ ] Quick log session form (expandable):
  - Grade dropdown (VB, V0, V3, V4-V6, V6-V8, V7-V10)
  - Location dropdown (all locations)
  - Date picker (default today)
  - Attempts input (number)
  - Completed checkbox
  - Rating input (optional, 1-10)
  - Notes textarea (optional)
  - Submit button
  - Form submission to `POST /sessions`
- [ ] Filters section:
  - Location filter dropdown (All/specific)
  - Date range filter (Today/Week/Month/All)
  - Apply button
- [ ] Progress line chart container
- [ ] Grade distribution pie chart container
- [ ] Recent sessions list:
  - Last 10 sessions
  - Show date, location, grade, attempts, completed status
  - Edit/Delete buttons
  - Fetch from `GET /sessions`

### 4.7 Location Page (app/templates/location.html)
- [ ] Extend base.html
- [ ] Location name and details header
- [ ] Aggregate statistics:
  - Total climbs at this location
  - Active climbers count
- [ ] Location grade distribution pie chart
- [ ] Weekly activity trend chart
- [ ] Back to homepage link

### 4.8 Pages Router (app/routers/pages.py)
- [ ] `GET /`:
  - Render index.html
  - Pass aggregate stats to template
- [ ] `GET /login`:
  - Render login.html
- [ ] `GET /register`:
  - Render register.html
  - Pass locations list for dropdown
- [ ] `GET /dashboard`:
  - Require authentication (redirect to /login if not)
  - Render dashboard.html
  - Pass user info to template
- [ ] `GET /location/{slug}`:
  - Render location.html
  - Pass location info and stats to template
  - Handle location not found

### 4.9 Responsive Design
- [ ] Ensure all pages are mobile-friendly
- [ ] Test on phone viewport (320px, 375px, 414px)
- [ ] Use Tailwind responsive classes
- [ ] Charts resize appropriately
- [ ] Forms are easy to use on mobile
- [ ] Navigation menu collapses on mobile (if needed)

### 4.10 UX Enhancements
- [ ] Loading states for API requests
- [ ] Success messages for actions (session logged, profile updated)
- [ ] Error messages for failed requests
- [ ] Form validation feedback
- [ ] Confirm dialog for delete actions
- [ ] Auto-refresh dashboard after logging session
- [ ] Smooth scrolling to charts after filter change

## Acceptance Criteria
- [ ] All pages render correctly
- [ ] Authentication flow works (register → login → dashboard)
- [ ] Session logging form works and refreshes data
- [ ] All three visualizations display correctly with real data
- [ ] Charts show "No data" message when appropriate
- [ ] Filters work and update charts
- [ ] Mobile responsive on all pages
- [ ] No console errors in browser
- [ ] JWT token persists across page loads
- [ ] Logout clears token and redirects to homepage

## Time Estimate
8-10 hours

## Dependencies
- Plan 03 must be complete

## Next Steps
After completion, proceed to Plan 05: Testing, Documentation & Deployment
