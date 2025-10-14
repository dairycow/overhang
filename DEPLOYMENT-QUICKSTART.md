# Deployment Quick Start

Get Overhang running on overhang.au in 6 steps.

## Prerequisites
- Digital Ocean account
- Domain name (overhang.au) configured to point to your server
- SSH access to your server

## Quick Deploy

### 1. Create Droplet
Create Ubuntu 22.04 droplet, note IP address.

### 2. Setup Server
```bash
ssh root@YOUR_DROPLET_IP
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/overhang/main/scripts/setup-server.sh -o setup-server.sh
bash setup-server.sh
```

Log out and back in for Docker permissions.

### 3. Clone & Configure
```bash
cd ~/apps
git clone https://github.com/YOUR_USERNAME/overhang.git
cd overhang

# Create environment file
cp packages/backend/.env.production.example packages/backend/.env.production

# Generate secret key
openssl rand -hex 32

# Edit and paste the secret key
nano packages/backend/.env.production
```

### 4. Configure DNS
Point these records to your droplet IP:
- `A Record: overhang.au → YOUR_DROPLET_IP`
- `A Record: www.overhang.au → YOUR_DROPLET_IP`

Wait for propagation (check with `dig overhang.au`).

### 5. Deploy
```bash
bash scripts/deploy.sh
```

Press enter when prompted (after DNS is ready).

### 6. Verify
Visit https://overhang.au

## Common Commands

```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Update after git pull
docker-compose build && docker-compose up -d

# Backup database
mkdir -p ~/backups
docker cp overhang-backend:/app/data/overhang.db ~/backups/overhang-$(date +%Y%m%d).db
```

## Troubleshooting

**Services won't start:**
```bash
docker-compose logs -f
```

**SSL certificate failed:**
- Verify DNS: `dig overhang.au`
- Check port 80: `curl http://overhang.au`
- Review logs: `docker-compose logs certbot`

**Can't connect:**
```bash
sudo ufw status  # Check firewall
docker-compose ps  # Check services
```

## Optional: Setup CI/CD

For automated deployments on every push to main:

1. Complete initial manual deployment first (steps 1-6)
2. Follow [docs/cicd-setup.md](docs/cicd-setup.md) to configure GitHub Actions
3. Future updates: just `git push origin main`

Benefits:
- Automated testing before deploy
- Zero-touch deployments
- Automatic health checks

## Full Documentation

- [Complete Deployment Guide](docs/deployment.md) - Monitoring, backups, scaling
- [CI/CD Setup Guide](docs/cicd-setup.md) - Automated deployments
