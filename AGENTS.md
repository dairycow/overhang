# opencode agent guidelines

## Build/Test Commands

- always activate the environment before running any of the following using `. .venv/bin/activate`

- **Install**: `uv pip install .`
- **Local CI/CD**: `tox` (runs install, format, lint, typecheck, and tests via tox.ini)

## Development Flow

1. **Setup**: Run `./scripts/setup-dev.sh` to initialize the environment
2. **Activate**: `cd packages/backend && source .venv/bin/activate`
3. **Run Tests**: `tox` or `pytest`
4. **Run Dev Server**: `tox -e dev` or `uvicorn app.main:app --reload`
5. **Code Quality**: 
   - Format: `tox -e format`
   - Lint: `tox -e lint`
   - Type check: `tox -e type`
6. **Database**: Seed with `tox -e seed` or `python scripts/seed_locations.py`

## Code Style

- **Runtime**: Python with virtual environment (uv)
- **Imports**: Use relative imports for local modules, import from typing
- **Types**: Use type hints, dataclasses or pydantic for structure
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Error handling**: Use try/except blocks, raise exceptions
- **File structure**: Package-based organization
- **Validation**: Use pydantic models
- **Logging**: Use Python logging module
- **Styling**:" Don't use emojis in code or documentation