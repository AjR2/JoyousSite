# JoyousSite Deployment Guide

This guide covers all deployment options for the JoyousSite project, including manual deployments, automated CI/CD, and various hosting platforms.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git repository access

### Basic Deployment Commands

```bash
# Deploy to Vercel (production)
./scripts/deploy.sh vercel production

# Deploy to Vercel (preview)
./scripts/deploy.sh vercel staging

# Deploy to Netlify (production)
./scripts/deploy.sh netlify production

# Generate static files for manual deployment
./scripts/deploy.sh static
```

## Deployment Targets

### 1. Vercel (Recommended)

Vercel is the primary deployment target with full support for serverless functions and edge optimization.

**Setup:**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `./scripts/deploy.sh vercel production`

**Environment Variables:**
Set these in your Vercel dashboard:
- `NODE_ENV=production`
- `ADMIN_USERNAME=your-admin-username` (if using admin features)
- `ADMIN_PASSWORD=your-secure-password` (if using admin features)

**Configuration:**
The `vercel.json` file contains all necessary configuration for:
- API routes
- Static file serving
- Service worker handling
- Redirects and rewrites

### 2. Netlify

Alternative deployment option with excellent static site hosting.

**Setup:**
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Deploy: `./scripts/deploy.sh netlify production`

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `build`
- Node version: 18

### 3. Static Hosting

For traditional web servers or CDN deployment.

**Generate Files:**
```bash
./scripts/deploy.sh static
```

This creates a compressed archive with all static files ready for upload.

## Automated Deployment (CI/CD)

### GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- Runs tests on every push
- Deploys to staging on `develop` branch
- Deploys to production on `main` branch
- Runs Lighthouse performance tests
- Supports manual deployments

**Required Secrets:**
Add these to your GitHub repository secrets:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

**Setup Steps:**
1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the required secrets
3. Push to `develop` or `main` branch to trigger deployment

### Manual Workflow Trigger

You can manually trigger deployments from GitHub:
1. Go to Actions tab in your repository
2. Select "Deploy JoyousSite" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)

## Pre-Deployment Checklist

The deployment script automatically runs these checks:

### ✅ Code Quality
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] No TypeScript/ESLint errors

### ✅ Content Validation
- [ ] Blog posts validate successfully
- [ ] Sitemap generates correctly
- [ ] All required static files exist

### ✅ Performance
- [ ] Build optimizations run
- [ ] Service worker validates
- [ ] Manifest file is valid JSON

## Environment Configuration

### Development
```bash
NODE_ENV=development
# Source maps enabled
# No minification
```

### Staging
```bash
NODE_ENV=staging
# Source maps enabled
# Minification enabled
# Preview deployment
```

### Production
```bash
NODE_ENV=production
# Source maps disabled
# Full minification
# Production deployment
```

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Vercel Deployment Issues:**
```bash
# Check login status
vercel whoami

# Re-login if needed
vercel login

# Check project linking
vercel link
```

**Missing Environment Variables:**
- Check Vercel dashboard → Project → Settings → Environment Variables
- Ensure all required variables are set for the correct environment

### Debug Mode

Run deployment with verbose output:
```bash
DEBUG=1 ./scripts/deploy.sh vercel production
```

## Post-Deployment Verification

After deployment, verify:

1. **Site loads correctly** - Check main pages
2. **Navigation works** - Test all menu items
3. **Blog posts display** - Verify content renders
4. **Service worker active** - Check browser dev tools
5. **Contact form works** - Test form submissions (if applicable)
6. **Performance** - Run Lighthouse audit

## Rollback Procedure

### Vercel Rollback
1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments tab
4. Find previous working deployment
5. Click "Promote to Production"

### Manual Rollback
1. Checkout previous working commit
2. Run deployment script
3. Verify rollback successful

## Support

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Check Vercel/Netlify deployment logs
4. Verify environment variables
5. Test local build first

## Advanced Configuration

### Custom Build Commands

Edit `deploy.config.js` to customize:
- Build commands per environment
- Static file handling
- Validation scripts
- Notification settings

### Multiple Environments

The deployment script supports custom environments:
```bash
./scripts/deploy.sh vercel custom-env
```

Set `NODE_ENV=custom-env` and configure accordingly.
