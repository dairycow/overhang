# Overhang Backend

FastAPI backend for the Overhang climbing progress tracking application.

## Setup

From the repository root:

```bash
./scripts/setup-dev.sh
```

Or manually:

```bash
cd packages/backend

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
uv pip install -e ".[dev]"

# Copy environment variables
cp .env.example .env
```

## Development

```bash
# Activate environment
source .venv/bin/activate

# Run development server
tox -e dev

# Run tests
tox

# Run linting
tox -e lint

# Format code
tox -e format

# Type checking
tox -e type

# Seed database
tox -e seed
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - SQLite database file path
- `SECRET_KEY` - JWT secret key (auto-generated in development)
- `ALGORITHM` - JWT algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiry time (default: 10080 = 1 week)
- `ENVIRONMENT` - Environment name (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins

## API Endpoints

See [API Documentation](../../docs/api.md) for detailed endpoint specifications.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/me` - Get current user info

### Locations
- `GET /locations` - List all gym locations
- `GET /locations/{slug}` - Get specific location

### Sessions
- `POST /sessions` - Log climbing session
- `GET /sessions` - Get user's sessions (with filters)
- `GET /sessions/{id}` - Get specific session
- `PUT /sessions/{id}` - Update session
- `DELETE /sessions/{id}` - Delete session

### Statistics
- `GET /stats/user/progress` - User progress over time
- `GET /stats/user/distribution` - User grade distribution
- `GET /stats/location/{id}` - Location statistics
- `GET /stats/aggregate` - Network-wide statistics

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run tests in parallel
pytest -n auto
```

## Code Quality

```bash
# Format code
black app tests
ruff check --fix app tests

# Check types
mypy app

# Run all checks
tox
```

## Database

The application uses SQLite with SQLAlchemy ORM.

### Models

- `Location` - Gym locations
- `User` - User accounts
- `Session` - Climbing session logs

### Seeding

Seed the database with initial gym locations:

```bash
tox -e seed
```

Or manually:

```bash
python scripts/seed_locations.py
```

## Deployment

See [Deployment Guide](../../docs/deployment.md) for production deployment instructions.


