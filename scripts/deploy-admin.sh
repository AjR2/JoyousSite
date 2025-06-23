#!/bin/bash

# Blog Admin Deployment Script for Vercel
# This script helps deploy the blog with admin functionality

echo "🚀 Akeyreu Blog Admin Deployment Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🔍 Pre-deployment checks..."

# Check if build works
echo "📦 Testing build process..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Check if admin files exist
echo "🔍 Checking admin files..."
ADMIN_FILES=(
    "src/components/AdminAuth.js"
    "src/components/BlogAdmin.js"
    "api/auth.js"
    "api/posts/index.js"
    "api/posts/[slug].js"
)

for file in "${ADMIN_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing admin file: $file"
        exit 1
    fi
done

echo "✅ All admin files present!"

# Environment variables check
echo "🔧 Environment Variables Setup"
echo "==============================="
echo "Please ensure these environment variables are set in Vercel:"
echo ""
echo "ADMIN_USERNAME=your-admin-username"
echo "ADMIN_PASSWORD=your-secure-password-here"
echo "NODE_ENV=production"
echo ""

read -p "Have you set the environment variables in Vercel? (y/n): " env_confirm
if [ "$env_confirm" != "y" ]; then
    echo "⚠️  Please set environment variables in Vercel dashboard first:"
    echo "   1. Go to your project in Vercel dashboard"
    echo "   2. Navigate to Settings > Environment Variables"
    echo "   3. Add the variables listed above"
    echo "   4. Re-run this script"
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "========================="

# Check if already logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

# Deploy
echo "📤 Starting deployment..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment Successful!"
    echo "========================"
    echo ""
    echo "✅ Your blog admin is now live!"
    echo ""
    echo "📍 Admin Access:"
    echo "   URL: https://your-domain.vercel.app/admin"
    echo "   Username: admin (or your custom username)"
    echo "   Password: (the password you set in environment variables)"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Visit the admin URL above"
    echo "   2. Login with your credentials"
    echo "   3. Test creating a new blog post"
    echo "   4. Verify the post appears on your live blog"
    echo ""
    echo "📚 For detailed documentation, see: ADMIN_DEPLOYMENT_GUIDE.md"
    echo ""
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi
