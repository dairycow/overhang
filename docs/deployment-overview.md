# Deployment Overview

Quick reference for deploying and maintaining Overhang.

## Deployment Options

### Option 1: Manual Deployment (Recommended for Initial Setup)

**When to use:** First deployment, learning the system

**Time:** ~20-30 minutes

**Steps:**
1. Create Digital Ocean droplet
2. Configure DNS
3. Run setup script
4. Deploy application

**Pros:**
- Full control over each step
- Understand the deployment process
- Good for debugging

**Cons:**
- Manual steps required for updates
- Potential for human error

See: [DEPLOYMENT-QUICKSTART.md](../DEPLOYMENT-QUICKSTART.md)

### Option 2: CI/CD with GitHub Actions

**When to use:** After initial deployment, for ongoing updates

**Time:** ~15 minutes setup, then automatic

**Steps:**
1. Complete manual deployment first
2. Create deploy user and SSH keys
3. Configure GitHub secrets
4. Push to main branch → auto-deploy

**Pros:**
- Automated testing before deploy
- Consistent deployments
- Zero-touch updates
- Health checks included

**Cons:**
- Requires GitHub Actions (free for public repos)
- Initial setup complexity

See: [cicd-setup.md](cicd-setup.md)

## Recommended Workflow

### Initial Deployment
```
1. Manual deployment (Option 1)
   ↓
2. Test application thoroughly
   ↓
3. Setup CI/CD (Option 2)
   ↓
4. Future updates via git push
```

### Update Workflow

**Without CI/CD:**
```bash
ssh deploy@overhang.au
cd ~/apps/overhang
git pull
docker-compose build
docker-compose up -d
```

**With CI/CD:**
```bash
git add .
git commit -m "Update feature"
git push origin main
# GitHub Actions handles the rest
```

## Architecture

```
┌─────────────────────────────────────────────┐
│             Internet (HTTPS)                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│     nginx (Reverse Proxy + SSL)             │
│  - Terminates SSL (Let's Encrypt)           │
│  - Routes /api → backend                    │
│  - Routes / → frontend                      │
└─────┬─────────────────────┬─────────────────┘
      │                     │
      │                     │
┌─────▼─────────┐   ┌───────▼──────────┐
│   Backend     │   │    Frontend      │
│   (FastAPI)   │   │  (React/nginx)   │
│   Port 8000   │   │    Port 80       │
└─────┬─────────┘   └──────────────────┘
      │
┌─────▼─────────┐
│   SQLite DB   │
│  (Volume)     │
└───────────────┘
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend | FastAPI (Python 3.11) | REST API |
| Frontend | React + TypeScript | User interface |
| Database | SQLite | Data storage |
| Web Server | nginx | Reverse proxy, static files |
| SSL | Let's Encrypt (certbot) | HTTPS certificates |
| Container | Docker + Docker Compose | Application packaging |
| CI/CD | GitHub Actions | Automated testing & deployment |

## File Structure

```
overhang/
├── packages/
│   ├── backend/
│   │   ├── src/              # Application code
│   │   ├── Dockerfile        # Backend container
│   │   └── .env.production   # Production config (not in git)
│   └── frontend/
│       ├── src/              # React components
│       ├── Dockerfile        # Frontend container
│       └── nginx.conf        # Frontend nginx config
├── nginx/
│   ├── nginx.conf            # Main nginx config
│   └── conf.d/
│       └── overhang.conf     # Site configuration
├── scripts/
│   ├── setup-server.sh       # Initial server setup
│   └── deploy.sh             # Manual deployment
├── .github/
│   └── workflows/
│       ├── ci.yml            # Continuous integration
│       └── deploy.yml        # Continuous deployment
└── docker-compose.yml        # Production orchestration
```

## Ports

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| nginx | - | 80, 443 | HTTP/HTTPS entry point |
| Backend | 8000 | - | API (internal only) |
| Frontend | 80 | - | Static files (internal only) |

## Environment Variables

### Required (Production)

```env
# Generate with: openssl rand -hex 32
SECRET_KEY=your-secret-key-here

# Your domain
ALLOWED_ORIGINS=https://overhang.au,https://www.overhang.au

# Database path
DATABASE_URL=sqlite:////app/data/overhang.db
```

### Optional

```env
# JWT token expiry (minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# Environment
ENVIRONMENT=production
```

## Security Checklist

- [ ] SECRET_KEY is randomly generated (32+ chars)
- [ ] .env.production is not committed to Git
- [ ] Firewall allows only ports 22, 80, 443
- [ ] SSH uses keys, not passwords
- [ ] Deploy user (not root) for deployments
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers enabled (HSTS, XSS protection)
- [ ] Regular system updates scheduled
- [ ] Database backups configured

## Maintenance Tasks

### Daily
- Monitor application logs
- Check uptime/performance

### Weekly
- Review deployment logs (if using CI/CD)
- Check disk space: `df -h`

### Monthly
- Update system packages: `apt update && apt upgrade`
- Review and rotate logs
- Test database backup/restore
- Review SSL certificate status

### As Needed
- Scale droplet size
- Update application code
- Optimize database

## Monitoring

### Basic Health Check
```bash
curl https://overhang.au/health
```

### Check All Services
```bash
docker-compose ps
docker-compose logs -f
```

### Resource Usage
```bash
docker stats
free -h
df -h
```

## Backup Strategy

### Database Backup (Manual)
```bash
# On server
docker cp overhang-backend:/app/data/overhang.db ~/backups/overhang-$(date +%Y%m%d).db
```

### Automated Backups (Recommended)
Set up cron job:
```bash
# Backup database daily at 2 AM
0 2 * * * docker cp overhang-backend:/app/data/overhang.db ~/backups/overhang-$(date +\%Y\%m\%d).db
```

## Costs

### Digital Ocean
- **Basic**: $6/month (1GB RAM) - Minimum
- **Recommended**: $12-18/month (2-4GB RAM)
- **Backups**: +20% (optional)

### GitHub Actions
- **Public repos**: Free unlimited
- **Private repos**: 2,000 minutes/month free

### Domain
- **overhang.au**: ~$10-15/year

**Total: $10-25/month + domain**

## Next Steps

1. **Initial Deployment**: Follow [DEPLOYMENT-QUICKSTART.md](../DEPLOYMENT-QUICKSTART.md)
2. **Setup CI/CD**: Follow [cicd-setup.md](cicd-setup.md)
3. **Configure Monitoring**: Set up UptimeRobot or similar
4. **Setup Backups**: Automate database backups
5. **Optimize**: Review performance and scale as needed

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Site down | `docker-compose ps` then `docker-compose logs -f` |
| SSL error | `docker-compose logs certbot` |
| Deployment failed | Check GitHub Actions logs |
| Database locked | `docker-compose restart backend` |
| Out of disk | Prune images: `docker system prune -a` |

See [deployment.md](deployment.md) for detailed troubleshooting.

## Resources

- [DEPLOYMENT-QUICKSTART.md](../DEPLOYMENT-QUICKSTART.md) - Quick reference
- [deployment.md](deployment.md) - Complete guide
- [cicd-setup.md](cicd-setup.md) - CI/CD setup
- [Digital Ocean Docs](https://docs.digitalocean.com/)
- [Docker Docs](https://docs.docker.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
