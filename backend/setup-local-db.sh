#!/bin/bash

echo "🐘 Setting up local PostgreSQL database for development..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first:"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "   Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL service is not running. Please start PostgreSQL:"
    echo "   macOS: brew services start postgresql"
    echo "   Ubuntu: sudo systemctl start postgresql"
    echo "   Windows: Start PostgreSQL service from Services"
    exit 1
fi

# Create database
echo "📦 Creating database 'real_estate'..."
createdb real_estate 2>/dev/null || echo "Database 'real_estate' already exists"

# Create user if it doesn't exist
echo "👤 Creating user 'postgres' with password 'password'..."
psql -d real_estate -c "CREATE USER postgres WITH PASSWORD 'password' SUPERUSER;" 2>/dev/null || echo "User 'postgres' already exists"

# Grant privileges
echo "🔐 Granting privileges..."
psql -d real_estate -c "GRANT ALL PRIVILEGES ON DATABASE real_estate TO postgres;"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "✅ Local database setup complete!"
echo ""
echo "📝 To use local database, set this environment variable:"
echo "   export LOCAL_DATABASE_URL=postgresql://postgres:password@localhost:5432/real_estate"
echo ""
echo "🚀 Start the development server:"
echo "   npm run dev"
