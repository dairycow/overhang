#!/bin/bash
set -e

echo "Setting up Digital Ocean server for Overhang..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Updating system packages...${NC}"
sudo apt-get update
sudo apt-get upgrade -y

echo -e "${BLUE}Step 2: Installing Docker...${NC}"
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo -e "${BLUE}Step 3: Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo -e "${BLUE}Step 4: Installing Git...${NC}"
sudo apt-get install -y git

echo -e "${BLUE}Step 5: Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo -e "${BLUE}Step 6: Creating application directory...${NC}"
mkdir -p ~/apps
cd ~/apps

echo -e "${GREEN}Server setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> overhang"
echo "2. cd overhang"
echo "3. Copy and configure: cp packages/backend/.env.production.example packages/backend/.env.production"
echo "4. Edit .env.production and set your SECRET_KEY (generate with: openssl rand -hex 32)"
echo "5. Run deployment: bash scripts/deploy.sh"
echo ""
echo "IMPORTANT: You may need to log out and back in for Docker permissions to take effect."
