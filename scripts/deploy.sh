#!/bin/bash

# JoyousSite Deployment Script
# Supports multiple deployment targets: Vercel, Netlify, and static hosting
# Usage: ./scripts/deploy.sh [target] [environment]
# Examples:
#   ./scripts/deploy.sh vercel production
#   ./scripts/deploy.sh netlify staging
#   ./scripts/deploy.sh static

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TARGET=${1:-vercel}
ENVIRONMENT=${2:-production}
BUILD_DIR="build"

echo -e "${BLUE}🚀 JoyousSite Deployment Script${NC}"
echo -e "${BLUE}=================================${NC}"
echo -e "Target: ${GREEN}$TARGET${NC}"
echo -e "Environment: ${GREEN}$ENVIRONMENT${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Found package.json - in correct directory"

# Check Node.js version
NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm ci
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Run pre-deployment checks
echo ""
echo -e "${BLUE}🔍 Pre-deployment checks${NC}"
echo -e "${BLUE}========================${NC}"

# Validate posts if they exist
if [ -f "scripts/manage-posts.js" ]; then
    print_info "Validating blog posts..."
    npm run posts:validate
    print_status "Blog posts validated"
fi

# Generate sitemap
if [ -f "scripts/generate-sitemap.js" ]; then
    print_info "Generating sitemap..."
    npm run sitemap:generate
    print_status "Sitemap generated"
fi

# Clean previous build
if [ -d "$BUILD_DIR" ]; then
    print_info "Cleaning previous build..."
    rm -rf "$BUILD_DIR"
fi

# Build the project
echo ""
echo -e "${BLUE}📦 Building project${NC}"
echo -e "${BLUE}===================${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Building for production..."
    npm run build
else
    print_info "Building for $ENVIRONMENT..."
    NODE_ENV=$ENVIRONMENT npm run build
fi

if [ $? -ne 0 ]; then
    print_error "Build failed. Please fix build errors before deploying."
    exit 1
fi

print_status "Build completed successfully"

# Run build optimizations
if [ -f "scripts/vercel-build.js" ]; then
    print_info "Running build optimizations..."
    node scripts/vercel-build.js
fi

# Deploy based on target
echo ""
echo -e "${BLUE}🚀 Deploying to $TARGET${NC}"
echo -e "${BLUE}$(printf '=%.0s' {1..20})${NC}"

case $TARGET in
    "vercel")
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi

        # Check if logged in to Vercel
        if ! vercel whoami &> /dev/null; then
            print_info "Please login to Vercel..."
            vercel login
        fi

        # Deploy to Vercel
        if [ "$ENVIRONMENT" = "production" ]; then
            print_info "Deploying to Vercel production..."
            vercel --prod --yes
        else
            print_info "Deploying to Vercel preview..."
            vercel --yes
        fi
        ;;

    "netlify")
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            print_warning "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi

        # Check if logged in to Netlify
        if ! netlify status &> /dev/null; then
            print_info "Please login to Netlify..."
            netlify login
        fi

        # Deploy to Netlify
        if [ "$ENVIRONMENT" = "production" ]; then
            print_info "Deploying to Netlify production..."
            netlify deploy --prod --dir=$BUILD_DIR
        else
            print_info "Deploying to Netlify preview..."
            netlify deploy --dir=$BUILD_DIR
        fi
        ;;

    "static")
        print_info "Preparing static files for manual deployment..."
        
        # Create deployment package
        DEPLOY_PACKAGE="joyous-site-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "$DEPLOY_PACKAGE" -C "$BUILD_DIR" .
        
        print_status "Static deployment package created: $DEPLOY_PACKAGE"
        print_info "Upload the contents of the '$BUILD_DIR' directory to your web server"
        ;;

    *)
        print_error "Unknown deployment target: $TARGET"
        print_info "Supported targets: vercel, netlify, static"
        exit 1
        ;;
esac

# Post-deployment checks
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment Successful!${NC}"
    echo -e "${GREEN}========================${NC}"
    echo ""
    
    case $TARGET in
        "vercel")
            print_status "Your site is now live on Vercel!"
            print_info "Check your Vercel dashboard for the deployment URL"
            ;;
        "netlify")
            print_status "Your site is now live on Netlify!"
            print_info "Check your Netlify dashboard for the deployment URL"
            ;;
        "static")
            print_status "Static files are ready for deployment!"
            print_info "Upload the build directory contents to your web server"
            ;;
    esac
    
    echo ""
    print_info "🔧 Post-deployment checklist:"
    echo "   1. Verify the site loads correctly"
    echo "   2. Test navigation and key functionality"
    echo "   3. Check that blog posts display properly"
    echo "   4. Verify service worker and PWA features"
    echo "   5. Test contact form (if applicable)"
    echo ""
else
    print_error "Deployment failed. Please check the error messages above."
    exit 1
fi
