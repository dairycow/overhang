# Backend Agent Guidelines (Python/FastAPI)

## Setup & Commands

- **Install**: `uv pip install -e ".[dev]"`
- **Run**: `uvicorn src.main:app --reload`
- **Test**: `tox` or `pytest`
- **Database**: Reset with `../scripts/db-reset.sh` or seed with `tox -e seed`
- **Code Quality**: `tox -e format`, `tox -e lint`, `tox -e type`

## Code Style

- **Runtime**: Python with virtual environment (uv)
- **Imports**: Use relative imports for local modules, import from typing
- **Types**: Use type hints, dataclasses or pydantic for structure
- **Naming**: snake_case for variables/functions, PascalCase for classes
- **Error handling**: Use try/except blocks, raise exceptions
- **File structure**: Package-based organization
- **Validation**: Use pydantic models
- **Logging**: Use Python logging module