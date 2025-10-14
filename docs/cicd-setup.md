# CI/CD Setup Guide

This guide covers setting up continuous integration and deployment with GitHub Actions.

## Overview

The CI/CD pipeline consists of:

1. **CI (Continuous Integration)** - Runs on all pushes and PRs
   - Backend: tests, linting (ruff, black), type checking (mypy)
   - Frontend: tests, linting, type checking, build
   - Docker: validates image builds

2. **CD (Continuous Deployment)** - Runs on pushes to `main`
   - Automatically deploys to production after tests pass
   - Performs health check after deployment

## Initial Setup

### 1. Create Deploy User on Server

SSH into your Digital Ocean droplet:

```bash
ssh root@YOUR_DROPLET_IP

# Create deploy user
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Setup app directory
mkdir -p /home/deploy/apps
chown -R deploy:deploy /home/deploy/apps
```

### 2. Generate SSH Key for GitHub Actions

On your **local machine**, generate a dedicated deploy key:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/overhang_deploy
```

This creates two files:
- `~/.ssh/overhang_deploy` (private key - for GitHub)
- `~/.ssh/overhang_deploy.pub` (public key - for server)

### 3. Add Public Key to Server

Copy the public key to your server:

```bash
# Display the public key
cat ~/.ssh/overhang_deploy.pub

# SSH to server as root
ssh root@YOUR_DROPLET_IP

# Add key to deploy user
mkdir -p /home/deploy/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Test the connection:

```bash
# From local machine
ssh -i ~/.ssh/overhang_deploy deploy@YOUR_DROPLET_IP
```

### 4. Setup Application as Deploy User

While connected as deploy user:

```bash
cd ~/apps
git clone https://github.com/YOUR_USERNAME/overhang.git
cd overhang

# Create production environment
cp packages/backend/.env.production.example packages/backend/.env.production

# Generate and set SECRET_KEY
openssl rand -hex 32
nano packages/backend/.env.production  # Paste the secret key

# Initial deployment
bash scripts/deploy.sh
```

### 5. Configure GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add these secrets:

**DEPLOY_HOST**
```
YOUR_DROPLET_IP_ADDRESS
```

**DEPLOY_USER**
```
deploy
```

**DEPLOY_SSH_KEY**
```
# Paste contents of private key
cat ~/.ssh/overhang_deploy
```

Copy the **entire** private key including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### 6. Test the Workflow

Push to main branch or manually trigger:

```bash
# Push a change
git add .
git commit -m "Test CI/CD pipeline"
git push origin main

# Or manually trigger via GitHub UI:
# Actions → Deploy to Production → Run workflow
```

## Workflow Details

### CI Workflow (.github/workflows/ci.yml)

Triggers on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

Jobs:
1. **backend-tests**: Python linting, type checking, tests
2. **frontend-tests**: TypeScript linting, type checking, tests, build
3. **docker-build**: Validates Docker images build successfully

### Deploy Workflow (.github/workflows/deploy.yml)

Triggers on:
- Push to `main` (after CI passes)
- Manual workflow dispatch

Steps:
1. Runs CI tests first
2. SSH into server as deploy user
3. Pull latest code
4. Build Docker images
5. Restart services with `docker-compose up -d`
6. Prune old images
7. Run health check
8. Notify on failure

## Security Best Practices

1. **Use Deploy User**: Never deploy as root
2. **Dedicated SSH Key**: Use separate key just for deployments
3. **Secrets Management**: Never commit secrets to Git
4. **Key Permissions**: Ensure proper SSH key permissions (600)
5. **Health Checks**: Always verify deployment succeeded

## Monitoring Deployments

### View Deployment Logs

In GitHub:
1. Go to **Actions** tab
2. Click on latest workflow run
3. View logs for each step

### Check Server Status

```bash
# SSH to server
ssh deploy@YOUR_DROPLET_IP

# Check running services
cd ~/apps/overhang
docker-compose ps

# View logs
docker-compose logs -f

# Check recent deployments
git log --oneline -10
```

## Rollback

If a deployment fails:

```bash
# SSH to server
ssh deploy@YOUR_DROPLET_IP
cd ~/apps/overhang

# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard PREVIOUS_COMMIT_SHA

# Rebuild and restart
docker-compose build
docker-compose up -d
```

## Advanced Configuration

### Deploy to Staging First

Create a `develop` branch workflow:

```yaml
# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [develop]

# Deploy to staging server
```

### Add Slack/Discord Notifications

Install GitHub app or add webhook in workflow:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1.25.0
  with:
    payload: |
      {
        "text": "Deployment to overhang.au successful!"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Database Migrations

Add migration step before restart:

```yaml
script: |
  cd ~/apps/overhang
  git pull

  # Run migrations
  docker-compose run --rm backend alembic upgrade head

  docker-compose build
  docker-compose up -d
```

## Troubleshooting

### SSH Connection Failed

Check secrets are set correctly:
```bash
# Test SSH connection manually
ssh -i ~/.ssh/overhang_deploy deploy@YOUR_DROPLET_IP
```

### Tests Failing in CI

Run tests locally first:
```bash
# Backend
cd packages/backend
tox

# Frontend
cd packages/frontend
npm test
npm run build
```

### Deployment Succeeds but Site Down

Check logs on server:
```bash
ssh deploy@YOUR_DROPLET_IP
cd ~/apps/overhang
docker-compose logs -f
```

### Docker Permission Denied

Ensure deploy user is in docker group:
```bash
# On server as root
usermod -aG docker deploy

# Deploy user must log out/in for changes
```

## Cost Considerations

GitHub Actions free tier:
- **Public repos**: Unlimited minutes
- **Private repos**: 2,000 minutes/month

Typical usage:
- CI run: ~5 minutes
- Deploy run: ~2 minutes
- ~20-30 pushes/month: ~150 minutes

For private repos, you're well within the free tier.

## Next Steps

1. Set up branch protection rules (require CI to pass before merge)
2. Add staging environment for testing
3. Implement blue-green deployments for zero downtime
4. Add database backup before deployment
5. Set up monitoring/alerting (UptimeRobot, Sentry)
