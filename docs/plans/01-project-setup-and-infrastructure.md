# Implementation Plan: Project Setup & Infrastructure

## Overview
Set up the foundational project structure, development environment, and configuration for the Overhang climbing tracker application.

## Prerequisites
- Python 3.11+
- uv package manager installed
- Git configured
- Access to deployment server (for later phases)

## Tasks

### 1.1 Repository & Project Structure
- [ ] Create initial directory structure as per PRD section 3
- [ ] Initialize git repository (if not done)
- [ ] Create `.gitignore` for Python, environments, SQLite DB files, and IDE files
- [ ] Set up `packages/backend/` directory with proper `__init__.py` files

### 1.2 Dependency Management
- [ ] Create `packages/backend/pyproject.toml` with:
  - FastAPI
  - uvicorn[standard]
  - SQLAlchemy
  - python-jose[cryptography]
  - passlib[bcrypt]
  - python-multipart
  - jinja2
  - pytest, pytest-asyncio, pytest-cov
  - black, ruff, mypy
- [ ] Create `tox.ini` with environments for: dev, test, lint, format, type, seed
- [ ] Create `.env.example` with all required environment variables (see PRD section 13)
- [ ] Create `.env` file for local development (not committed)

### 1.3 Configuration Module
- [ ] Create `app/config.py` using Pydantic Settings:
  - DATABASE_URL
  - SECRET_KEY
  - ALGORITHM (default: HS256)
  - ACCESS_TOKEN_EXPIRE_MINUTES (default: 10080)
  - ENVIRONMENT (development/production)
  - ALLOWED_ORIGINS
- [ ] Add validation for required settings
- [ ] Add method to generate SECRET_KEY if missing in development

### 1.4 Development Scripts
- [ ] Create `scripts/setup-dev.sh`:
  - Check Python version
  - Install uv if not present
  - Create virtual environment
  - Install dependencies
  - Copy `.env.example` to `.env` if not exists
  - Print setup success message
- [ ] Make script executable (`chmod +x`)

### 1.5 Documentation
- [ ] Create `README.md` with:
  - Project description
  - Setup instructions
  - Development commands
  - Testing instructions
- [ ] Create `packages/backend/README.md` with backend-specific details
- [ ] Create placeholder files for `docs/api.md`, `docs/setup.md`, `docs/deployment.md`

### 1.6 Testing Infrastructure
- [ ] Create `tests/conftest.py` with:
  - Test database fixture (in-memory SQLite)
  - Test client fixture
  - Authentication fixtures (test user, test token)
  - Cleanup fixtures
- [ ] Create `tests/__init__.py`

## Acceptance Criteria
- [ ] Project structure matches PRD section 3
- [ ] `uv pip install .` installs all dependencies successfully
- [ ] `tox` command is recognized and configured
- [ ] Environment variables load correctly from `.env`
- [ ] `pytest` runs (even with no tests yet)
- [ ] All Python files have proper imports and no syntax errors

## Time Estimate
2-3 hours

## Dependencies
None - this is the starting point

## Next Steps
After completion, proceed to Plan 02: Database Models & Authentication
