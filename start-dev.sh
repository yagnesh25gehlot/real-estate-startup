#!/bin/bash

echo "🚀 Starting Real Estate Platform Development Environment"
echo ""

# Set Railway database URL for local development
export DATABASE_URL="postgresql://postgres:zsRbzKWWgdypYUCscVHwYmoOYVoSmLxL@ballast.proxy.rlwy.net:47133/railway"

echo "🔧 Environment Configuration:"
echo "  Database: Railway PostgreSQL (Production DB)"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:3001"
echo ""

echo "📦 Starting both frontend and backend..."
echo ""

# Start both frontend and backend concurrently
npm run dev
