# Overhang

A climbing progress tracking application.

## Overview

Overhang enables climbers to create accounts, log their climbing sessions across multiple gym locations, and visualize their progress over time. The application tracks attempts and completions by grade, providing insights into personal climbing progress and gym-wide statistics.

## Features

- User registration and authentication (username + password)
- Track climbing attempts and completions by grade
- Support for multiple gym locations
- Visualize personal progress over time
- View gym-wide statistics and trends
- Mobile-friendly interface for easy logging at the gym

## Tech Stack

- **Backend:** FastAPI (Python 3.11+)
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT tokens
- **Frontend:** Jinja2 templates with Tailwind CSS
- **Charts:** Chart.js
- **Testing:** pytest with coverage
- **Package Manager:** uv

## Quick Start

### Prerequisites

- Python 3.11 or higher
- uv package manager (installed automatically by setup script)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dairycow/overhang.git
cd overhang
```

2. Run the setup script:
```bash
./scripts/setup-dev.sh
```

3. Activate the virtual environment:
```bash
cd packages/backend
source .venv/bin/activate
```

4. Update the `.env` file with your configuration (optional for development)

5. Run the development server:
```bash
tox -e dev
```

The application will be available at http://localhost:8000

## Development Commands

```bash
# Run all tests
tox

# Run development server with hot reload
tox -e dev

# Run linting
tox -e lint

# Format code
tox -e format

# Run type checking
tox -e type

# Seed database with gym locations
tox -e seed

# Run tests with coverage
pytest --cov=app --cov-report=html
```

## Project Structure

```
overhang/
├── packages/backend/        # Backend application
│   ├── app/                # FastAPI application
│   │   ├── routers/       # API route handlers
│   │   ├── static/        # CSS and JavaScript
│   │   └── templates/     # Jinja2 templates
│   ├── scripts/           # Database seeding scripts
│   └── tests/             # Test suite
├── deployment/            # Deployment configurations
├── docs/                  # Documentation
└── scripts/              # Development scripts
```

## Documentation

- [API Documentation](docs/api.md)
- [Setup Guide](docs/setup.md)
- [Deployment Guide](docs/deployment.md)
- [Implementation Plans](docs/plans/)

## Testing

Run the test suite with coverage:

```bash
tox
```

Generate HTML coverage report:

```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

## License

See [LICENSE](LICENSE) file for details.

## Contact

**Product Owner:** Harry Fleming  
**Domain:** overhang.au  
**Repository:** https://github.com/dairycow/overhang
