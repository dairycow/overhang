#!/bin/bash
set -e

echo "Initializing SSL certificates for Overhang..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN="overhang.au"
EMAIL="${LETSENCRYPT_EMAIL}"

# Check if email is provided
if [ -z "$EMAIL" ]; then
    echo -e "${BLUE}Let's Encrypt Email Configuration${NC}"
    echo "Please enter your email for SSL certificate notifications:"
    read -p "Email: " EMAIL
    if [ -z "$EMAIL" ]; then
        echo -e "${RED}Email is required!${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}This script will obtain SSL certificates for $DOMAIN${NC}"
echo ""
echo "Prerequisites:"
echo "  1. DNS must point to this server"
echo "  2. Ports 80 and 443 must be open"
echo "  3. Docker services must be stopped"
echo ""
read -p "Press enter to continue or Ctrl+C to cancel..."

# Stop all services
echo -e "${BLUE}Stopping all services...${NC}"
docker-compose down

# Backup existing nginx config
echo -e "${BLUE}Setting up temporary nginx config...${NC}"
if [ -f "nginx/conf.d/overhang.conf" ]; then
    mv nginx/conf.d/overhang.conf nginx/conf.d/overhang.conf.backup
fi
cp nginx/conf.d/overhang-http-only.conf nginx/conf.d/overhang.conf

# Create necessary directories
mkdir -p nginx/ssl

# Start nginx temporarily for certificate validation
echo -e "${BLUE}Starting nginx for certificate validation...${NC}"
docker-compose up -d nginx

# Wait for nginx to be ready
sleep 3

# Obtain certificate
echo -e "${BLUE}Obtaining SSL certificate from Let's Encrypt...${NC}"
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

    # Restore production nginx config
    echo -e "${BLUE}Restoring production nginx config...${NC}"
    if [ -f "nginx/conf.d/overhang.conf.backup" ]; then
        mv nginx/conf.d/overhang.conf.backup nginx/conf.d/overhang.conf
    else
        # Copy from the original location
        cp nginx/conf.d/overhang-http-only.conf.template nginx/conf.d/overhang.conf 2>/dev/null || true
    fi

    # Stop nginx
    docker-compose stop nginx

    echo -e "${GREEN}SSL initialization complete!${NC}"
    echo ""
    echo "Next step: Run 'docker-compose up -d' to start all services"
else
    echo -e "${RED}Failed to obtain SSL certificate!${NC}"
    echo ""
    echo "Common issues:"
    echo "  1. DNS not propagated yet (check with: dig $DOMAIN)"
    echo "  2. Port 80 blocked by firewall"
    echo "  3. Domain doesn't point to this server"
    echo ""
    echo "Restoring original config..."
    if [ -f "nginx/conf.d/overhang.conf.backup" ]; then
        mv nginx/conf.d/overhang.conf.backup nginx/conf.d/overhang.conf
    fi
    exit 1
fi
