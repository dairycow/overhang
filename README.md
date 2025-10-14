# Overhang

A climbing progress tracking application.

## Overview

Overhang enables climbers to log sessions, track progress by grade, and visualize statistics across multiple gym locations.

## Features

- User registration and authentication
- Track climbing attempts and completions by grade
- Support for multiple gym locations
- Progress visualization and statistics

## Tech Stack

- **Backend:** FastAPI (Python 3.11+)
- **Database:** SQLite with SQLAlchemy ORM
- **Frontend:** React with TypeScript
- **Authentication:** JWT tokens

## Quick Start

```bash
git clone https://github.com/dairycow/overhang.git
cd overhang
./scripts/setup-dev.sh
./scripts/run-dev.sh
```

Available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Deployment

Deploy to production with Docker:

```bash
# Quick deployment
See: DEPLOYMENT-QUICKSTART.md

# Complete guide
See: docs/deployment.md
```

## Documentation

### Development
- [API Documentation](docs/api.md)
- [Backend Setup](packages/backend/README.md)
- [Frontend Setup](packages/frontend/README.md)

### Production
- [Deployment Quick Start](DEPLOYMENT-QUICKSTART.md)
- [Complete Deployment Guide](docs/deployment.md)
- [CI/CD Setup](docs/cicd-setup.md)
- [Database Management](docs/database-management.md)
- [Deployment Overview](docs/deployment-overview.md)