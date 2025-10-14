# Deployment Guide

This guide covers deploying Overhang to a Digital Ocean droplet with Docker, nginx, and SSL certificates.

## Prerequisites

- Domain name (overhang.au) pointing to your server
- Digital Ocean account
- Basic command line knowledge

## Architecture

The production deployment consists of:
- **Backend:** FastAPI application in Docker container
- **Frontend:** React SPA served by nginx in Docker container
- **nginx:** Reverse proxy with SSL termination
- **certbot:** Automatic SSL certificate management

## Step 1: Create Digital Ocean Droplet

1. Create a new Droplet with:
   - **Distribution:** Ubuntu 22.04 LTS
   - **Plan:** Basic ($6/month minimum recommended)
   - **Region:** Choose closest to your users
   - **Authentication:** SSH keys (recommended) or password

2. Note your droplet's IP address

## Step 2: Configure DNS

Point your domain to the droplet:

```
A Record:     overhang.au      → YOUR_DROPLET_IP
A Record:     www.overhang.au  → YOUR_DROPLET_IP
```

Wait for DNS propagation (can take up to 48 hours, usually much faster).

## Step 3: Initial Server Setup

SSH into your server:

```bash
ssh root@YOUR_DROPLET_IP
```

Download and run the server setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/overhang/main/scripts/setup-server.sh -o setup-server.sh
bash setup-server.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Install Git
- Configure firewall (UFW)
- Create application directory

**IMPORTANT:** Log out and back in after this script completes for Docker permissions.

## Step 4: Clone Repository

```bash
cd ~/apps
git clone https://github.com/YOUR_USERNAME/overhang.git
cd overhang
```

## Step 5: Configure Environment

Create production environment file:

```bash
cp packages/backend/.env.production.example packages/backend/.env.production
```

Generate a secure SECRET_KEY:

```bash
openssl rand -hex 32
```

Edit the production environment file:

```bash
nano packages/backend/.env.production
```

Update these values:

```env
# Database
DATABASE_URL=sqlite:////app/data/overhang.db

# Security - IMPORTANT: Use the generated secret key!
SECRET_KEY=your_generated_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Environment
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=https://overhang.au,https://www.overhang.au
```

## Step 6: Deploy Application

Run the deployment script:

```bash
bash scripts/deploy.sh
```

The script will:
1. Check prerequisites (Docker, Docker Compose)
2. Verify environment configuration
3. Build Docker images
4. Start services
5. Obtain SSL certificate from Let's Encrypt
6. Start all services with HTTPS
7. Seed database with gym locations

**Notes:**
- When prompted for email, enter your real email (for SSL certificate notifications)
- When prompted for DNS, confirm your domain is pointing to the server
- The script automatically seeds Australian Blochaus gym locations

## Step 7: Verify Deployment

Check if all services are running:

```bash
docker-compose ps
```

You should see:
- overhang-backend (running)
- overhang-frontend (running)
- overhang-nginx (running)
- overhang-certbot (running)

View logs:

```bash
docker-compose logs -f
```

Test the application:
- Visit https://overhang.au
- Try registering a user
- Log a climbing session

## Common Operations

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Restart Services

```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop Application

```bash
docker-compose down
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d
```

### Seed/Reseed Locations

If you need to add locations after initial deployment:

```bash
bash scripts/seed-production.sh
```

Or manually:

```bash
docker-compose exec backend python scripts/seed_locations.py
```

### Database Backup

The SQLite database is stored in a Docker volume. To backup:

```bash
# Create backup directory
mkdir -p ~/backups

# Copy database from container
docker-compose exec backend cp /app/data/overhang.db /tmp/overhang.db
docker cp overhang-backend:/tmp/overhang.db ~/backups/overhang-$(date +%Y%m%d).db
```

### SSL Certificate Renewal

Certificates auto-renew via the certbot container. To manually renew:

```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

## Monitoring

### Check Service Health

```bash
# Backend health check
curl http://localhost:8000/health

# Check nginx status
docker-compose exec nginx nginx -t
```

### Monitor Resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

## Troubleshooting

### Services Won't Start

1. Check logs: `docker-compose logs -f`
2. Verify environment file exists and is valid
3. Check port conflicts: `sudo netstat -tulpn | grep -E ':(80|443|8000)'`

### SSL Certificate Issues

1. Verify DNS is correctly configured: `dig overhang.au`
2. Check port 80 is accessible: `curl http://overhang.au/.well-known/acme-challenge/test`
3. Review certbot logs: `docker-compose logs certbot`

### Database Issues

1. Check database file exists: `docker-compose exec backend ls -la /app/data/`
2. Verify permissions: `docker-compose exec backend ls -la /app/data/overhang.db`
3. Run database migration if needed

### Connection Refused

1. Check backend is running: `docker-compose ps backend`
2. Check nginx configuration: `docker-compose exec nginx nginx -t`
3. Verify firewall: `sudo ufw status`

## Security Considerations

1. **SECRET_KEY:** Never commit your production secret key to Git
2. **Firewall:** Only ports 22, 80, and 443 should be open
3. **SSH:** Use SSH keys instead of passwords
4. **Updates:** Regularly update system packages and Docker images
5. **Backups:** Set up automated database backups
6. **Monitoring:** Consider setting up uptime monitoring (UptimeRobot, etc.)

## Performance Optimization

### Enable HTTP/2

Already enabled in nginx configuration.

### Add Caching Headers

Already configured for static assets.

### Database Optimization

For higher traffic, consider:
- Migrating from SQLite to PostgreSQL
- Adding Redis for session caching
- Implementing database connection pooling

## Scaling

### Vertical Scaling

Upgrade your droplet size in Digital Ocean dashboard.

### Horizontal Scaling

For multiple servers:
1. Use PostgreSQL instead of SQLite
2. Set up a load balancer
3. Use shared storage for uploads
4. Implement session store (Redis)

## Cost Estimate

Monthly costs for Digital Ocean:

- **Basic Droplet:** $6-12/month (1-2GB RAM)
- **Recommended Droplet:** $18/month (4GB RAM)
- **Backups:** +20% of droplet cost (optional)
- **Domain:** ~$12/year (separate)

Total: ~$10-25/month depending on configuration

## CI/CD with GitHub Actions

For automated deployments, see [CI/CD Setup Guide](cicd-setup.md).

Benefits of CI/CD:
- **Automated testing**: Tests run on every push/PR
- **Consistent deployments**: No manual steps
- **Quick updates**: Push to main, deploy automatically
- **Rollback capability**: Easy to revert changes

Quick setup:
1. Configure GitHub secrets (see cicd-setup.md)
2. Push to main branch
3. GitHub Actions handles testing and deployment

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check GitHub issues
4. Open a new issue with logs and error messages
