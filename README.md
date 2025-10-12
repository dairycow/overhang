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
- **Frontend:** React with TypeScript
- **Build Tool:** Vite
- **Charts:** Chart.js (will be integrated in frontend)
- **Testing:** pytest with coverage (backend), Jest/React Testing Library (frontend)
- **Package Manager:** uv (backend), npm (frontend)

## Quick Start

### Prerequisites

- Python 3.11 or higher
- uv package manager (installed automatically by setup script)
- Node.js 16 or higher (for frontend)
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

3. Setup backend environment:
```bash
cd packages/backend
source .venv/bin/activate
```

4. Setup frontend environment:
```bash
cd packages/frontend
npm install
```

5. Run the development servers:
```bash
# In one terminal, run backend
cd packages/backend
tox -e dev

# In another terminal, run frontend
cd packages/frontend
npm run dev
```

The application will be available at:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

## Development Commands

```bash
# Setup backend
cd packages/backend
./scripts/setup-dev.sh

# Setup frontend
cd packages/frontend
npm install

# Run backend development server
cd packages/backend
tox -e dev

# Run frontend development server
cd packages/frontend
npm run dev

# Run all tests
tox

# Run linting
tox -e lint

# Format code
tox -e format

# Run type checking
tox -e type

# Seed database
tox -e seed
```

## Project Structure

```
overhang/
├── packages/
│   ├── backend/            # Python FastAPI backend
│   │   ├── app/            # FastAPI application
│   │   │   ├── routers/    # API route handlers
│   │   │   └── ...         # Other backend components
│   │   ├── scripts/        # Database seeding scripts
│   │   └── tests/          # Test suite
│   └── frontend/           # TypeScript React frontend
│       ├── src/            # Source code
│       ├── public/         # Static assets
│       └── package.json    # Frontend dependencies
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
