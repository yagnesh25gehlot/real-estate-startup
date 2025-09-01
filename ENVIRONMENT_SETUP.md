# Environment Setup Guide

## 🚨 **CRITICAL: Environment Separation**

Your local development and production environments are currently sharing the same database, which causes data mixing. This guide will help you set up proper environment separation.

## 📋 **Current Issue**
- Local development uses Railway database
- Production also uses Railway database
- Both environments share the same data
- Test data appears in production

## 🛠️ **Solution: Environment Separation**

### **Option 1: Local PostgreSQL Database (Recommended)**

#### **Step 1: Install PostgreSQL Locally**
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### **Step 2: Create Local Database**
```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE realtytopper_local;
CREATE USER realtytopper_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE realtytopper_local TO realtytopper_user;
\q
```

#### **Step 3: Configure Local Environment**
Edit `backend/.env.local`:
```bash
# Database - Local PostgreSQL
LOCAL_DATABASE_URL=postgresql://realtytopper_user:your_password@localhost:5432/realtytopper_local

# JWT Secret for local development
JWT_SECRET=local-development-jwt-secret-key-change-this

# Frontend URL for local development
FRONTEND_URL=http://localhost:5174

# Admin credentials for local development
ADMIN_PASSWORD=LocalAdmin123!
TEST_USER_PASSWORD=LocalTest123!

# Payment mode for local development
PAYMENTS_MODE=test

# Telegram - Use test bot for local development
TELEGRAM_BOT_TOKEN=your_test_bot_token
TELEGRAM_GROUP_ID=your_test_group_id
TELEGRAM_ENABLED=true
```

#### **Step 4: Run Database Migrations**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### **Option 2: Separate Railway Database**

#### **Step 1: Create New Railway Project**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Create a new project called "RealtyTopper-Dev"
3. Add a PostgreSQL database
4. Copy the database URL

#### **Step 2: Configure Local Environment**
Edit `backend/.env.local`:
```bash
# Database - Separate Railway database for development
LOCAL_DATABASE_URL=postgresql://your_dev_railway_db_url

# Other configurations...
```

#### **Step 3: Run Database Migrations**
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

## 🔧 **Environment Configuration**

### **Local Development (.env.local)**
```bash
# Database
LOCAL_DATABASE_URL=postgresql://username:password@localhost:5432/realtytopper_local

# JWT
JWT_SECRET=local-development-jwt-secret-key-change-this

# Frontend
FRONTEND_URL=http://localhost:5174

# Admin
ADMIN_PASSWORD=LocalAdmin123!
TEST_USER_PASSWORD=LocalTest123!

# Payments
PAYMENTS_MODE=test

# Telegram (test bot)
TELEGRAM_BOT_TOKEN=your_test_bot_token
TELEGRAM_GROUP_ID=your_test_group_id
TELEGRAM_ENABLED=true
```

### **Production (.env on Railway)**
```bash
# Database
DATABASE_URL=postgresql://your_production_railway_db_url

# JWT
JWT_SECRET=your_production_jwt_secret

# Frontend
FRONTEND_URL=https://realtytopper.com

# Admin
ADMIN_PASSWORD=your_production_admin_password

# Payments
PAYMENTS_MODE=live

# Telegram (production bot)
TELEGRAM_BOT_TOKEN=8110714233:AAFH_kwId5WNcPvBcaUpBDxC1SmXlckkquU
TELEGRAM_GROUP_ID=-1003068406152
TELEGRAM_ENABLED=true
```

## 🚀 **Testing Environment Separation**

### **Step 1: Test Local Environment**
```bash
# Start local development
cd backend
npm run dev

# Check logs - should show:
# ✅ Using local database for development
# 📁 Loaded local environment file (.env.local)
```

### **Step 2: Create Test Data Locally**
1. Go to `http://localhost:5174/list-property`
2. Create a test property
3. Verify it appears in local admin panel
4. Check that it does NOT appear on `https://realtytopper.com`

### **Step 3: Test Production Environment**
1. Go to `https://realtytopper.com/list-property`
2. Create a test property
3. Verify it appears on production admin panel
4. Check that it does NOT appear in local environment

## 🔍 **Verification Commands**

### **Check Current Database**
```bash
# Backend logs will show which database is being used
cd backend
npm run dev
```

### **Check Environment Variables**
```bash
# Check which .env file is loaded
cd backend
node -e "console.log('DATABASE_URL:', process.env.DATABASE_URL)"
node -e "console.log('LOCAL_DATABASE_URL:', process.env.LOCAL_DATABASE_URL)"
```

## 🚨 **Important Notes**

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use different admin passwords** for local and production
3. **Use different Telegram bots** for testing and production
4. **Use test payment keys** for local development
5. **Always verify environment separation** before deploying

## 🛠️ **Troubleshooting**

### **Issue: Still using Railway database locally**
**Solution:** Check that `LOCAL_DATABASE_URL` is set in `.env.local`

### **Issue: Can't connect to local PostgreSQL**
**Solution:** 
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql
```

### **Issue: Database migrations fail**
**Solution:**
```bash
# Reset local database
cd backend
npx prisma migrate reset
npx prisma migrate deploy
npx prisma generate
```

## 📞 **Support**

If you encounter issues:
1. Check the backend logs for database connection info
2. Verify environment variables are loaded correctly
3. Ensure PostgreSQL is running (if using local database)
4. Check Railway dashboard for database status

---

**Remember:** Proper environment separation is crucial for safe development and testing!

