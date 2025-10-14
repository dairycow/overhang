# Backend (Python/FastAPI)

FastAPI backend for the Overhang climbing progress tracking application.

## Features

- RESTful API with automatic OpenAPI documentation
- JWT-based authentication with bcrypt password hashing
- SQLite database with SQLAlchemy ORM
- Comprehensive test suite with pytest

## Quick Start

```bash
cd packages/backend
uv pip install -e ".[dev]"
uv run uvicorn src.main:app --reload
```

API available at http://localhost:8000

## API Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /locations` - List all locations
- `POST /sessions` - Create climbing session
- `GET /sessions` - List user sessions
- `GET /stats/user/progress` - User progress data
- `GET /stats/aggregate` - Network-wide statistics

## Project Structure

```
packages/backend/
├── src/                    # Application source
│   ├── main.py            # FastAPI app initialization
│   ├── models.py          # SQLAlchemy models
│   ├── auth.py            # Authentication utilities
│   └── routers/           # API route handlers
├── tests/                 # Test suite
└── scripts/               # Database seeding scripts
```

## Documentation

- [API Documentation](http://localhost:8000/docs) - Interactive OpenAPI docs
- [Main README](../../README.md) - Project overview


