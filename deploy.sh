#!/bin/bash

# Real Estate Platform Deployment Script
echo "🚀 Starting deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Link to Railway project (if not already linked)
if [ ! -f ".railway" ]; then
    echo "🔗 Linking to Railway project..."
    railway link
fi

# Deploy to Railway
echo "📦 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at: https://your-app-name.railway.app"
echo ""
echo "📋 Next steps:"
echo "1. Set up your custom domain in Railway dashboard"
echo "2. Configure environment variables"
echo "3. Set up your PostgreSQL database"
echo ""
echo "🔧 To view logs: railway logs"
echo "🔧 To open dashboard: railway open"
