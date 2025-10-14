#!/bin/bash
set -e

echo "Starting Overhang deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="overhang.au"
EMAIL="${LETSENCRYPT_EMAIL:-admin@overhang.au}"  # Override with env var LETSENCRYPT_EMAIL

# Prompt for email if using default
if [ "$EMAIL" = "admin@overhang.au" ]; then
    echo -e "${BLUE}Let's Encrypt Email Configuration${NC}"
    echo "Please enter your email for SSL certificate notifications:"
    read -p "Email: " USER_EMAIL
    if [ -n "$USER_EMAIL" ]; then
        EMAIL="$USER_EMAIL"
    else
        echo -e "${RED}Warning: Using default email. Set LETSENCRYPT_EMAIL env var to avoid this prompt.${NC}"
    fi
fi

echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites check passed!${NC}"

echo -e "${BLUE}Step 2: Setting up environment...${NC}"

# Check if production environment file exists
if [ ! -f "./packages/backend/.env.production" ]; then
    echo -e "${RED}Production environment file not found!${NC}"
    echo "Please create ./packages/backend/.env.production from .env.production.example"
    echo "and update the SECRET_KEY and other settings."
    exit 1
fi

# Verify SECRET_KEY has been changed
if grep -q "CHANGE_THIS" "./packages/backend/.env.production"; then
    echo -e "${RED}Please update the SECRET_KEY in .env.production!${NC}"
    echo "Generate one with: openssl rand -hex 32"
    exit 1
fi

echo -e "${GREEN}Environment configuration verified!${NC}"

echo -e "${BLUE}Step 3: Creating necessary directories...${NC}"
mkdir -p nginx/ssl
mkdir -p data

echo -e "${BLUE}Step 4: Building Docker images...${NC}"
docker-compose build

echo -e "${BLUE}Step 5: Starting services (HTTP only for now)...${NC}"

# First, start without SSL to get certificates
docker-compose up -d backend frontend

echo -e "${BLUE}Step 6: Obtaining SSL certificate...${NC}"
echo "NOTE: Make sure your domain $DOMAIN points to this server's IP address!"
read -p "Press enter when your DNS is configured and ready..."

# Run certbot to get SSL certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}SSL certificate obtained successfully!${NC}"

    echo -e "${BLUE}Step 7: Starting all services with SSL...${NC}"
    docker-compose up -d

    echo -e "${BLUE}Step 8: Seeding database with locations...${NC}"
    docker-compose exec -T backend python scripts/seed_locations.py

    echo -e "${GREEN}Deployment complete!${NC}"
    echo -e "${GREEN}Your application should now be running at https://$DOMAIN${NC}"
    echo ""
    echo "Useful commands:"
    echo "  - View logs: docker-compose logs -f"
    echo "  - Restart: docker-compose restart"
    echo "  - Stop: docker-compose down"
    echo "  - Update: git pull && docker-compose build && docker-compose up -d"
else
    echo -e "${RED}Failed to obtain SSL certificate.${NC}"
    echo "Please check:"
    echo "  1. DNS is correctly configured"
    echo "  2. Port 80 is accessible"
    echo "  3. Domain ownership"
    exit 1
fi
