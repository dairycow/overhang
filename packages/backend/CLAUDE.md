# Backend CLAUDE.md (Python/FastAPI)

## Commands
```bash
cd packages/backend && source .venv/bin/activate
tox -e dev  # Start dev server
tox         # Run tests
```

## Architecture

**Core modules:**
- `src/main.py` - FastAPI app, routers
- `src/models.py` - SQLAlchemy models
- `src/auth.py` - bcrypt, JWT tokens
- `src/crud.py` - Database operations

**Routers:** `/auth`, `/locations`, `/sessions`, `/stats`

## Key Patterns

- `Depends(get_current_user)` for auth