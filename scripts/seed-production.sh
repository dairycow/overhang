#!/bin/bash
set -e

echo "Seeding production database with locations..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if backend container is running
if ! docker-compose ps backend | grep -q "Up"; then
    echo -e "${RED}Backend container is not running!${NC}"
    echo "Start it with: docker-compose up -d backend"
    exit 1
fi

echo -e "${BLUE}Seeding gym locations...${NC}"
docker-compose exec -T backend python scripts/seed_locations.py

echo ""
echo -e "${GREEN}Database seeding complete!${NC}"
echo ""
echo "Available locations:"
docker-compose exec -T backend python -c "
import sys
sys.path.insert(0, 'src')
from database import SessionLocal, init_db
from models import Location

init_db()
db = SessionLocal()
locations = db.query(Location).all()
for loc in locations:
    print(f'  - {loc.name} (ID: {loc.id})')
db.close()
"
