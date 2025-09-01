# Environment Detection & Database Selection

## 🔍 How Environment Detection Works

The backend automatically detects which environment it's running in and selects the appropriate database based on environment variables.

## 📊 Environment Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Detection                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Check Environment Variables                              │
│    • NODE_ENV                                               │
│    • RAILWAY_ENVIRONMENT_NAME                               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Determine Environment Type                               │
│                                                             │
│ isProduction = NODE_ENV === 'production'                   │
│ isRailway = RAILWAY_ENVIRONMENT_NAME === 'production'      │
│ isLocal = !isProduction && !isRailway                      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Select Database URL                                       │
│                                                             │
│ IF isLocal:                                                  │
│   • Use LOCAL_DATABASE_URL if available                     │
│   • Fallback to DATABASE_URL                                │
│                                                             │
│ IF isRailway OR isProduction:                               │
│   • Always use DATABASE_URL                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Environment Scenarios

### 1. **Local Development** ✅

```
NODE_ENV: undefined
RAILWAY_ENVIRONMENT_NAME: undefined
LOCAL_DATABASE_URL: postgresql://yagnesh@localhost:5432/realtytopper_local
DATABASE_URL: postgresql://postgres:password@ballast.proxy.rlwy.net:47133/railway

Result: Uses LOCAL_DATABASE_URL → Local PostgreSQL
```

### 2. **Local Development (No LOCAL_DATABASE_URL)** ⚠️

```
NODE_ENV: undefined
RAILWAY_ENVIRONMENT_NAME: undefined
LOCAL_DATABASE_URL: undefined
DATABASE_URL: postgresql://postgres:password@ballast.proxy.rlwy.net:47133/railway

Result: Uses DATABASE_URL → Railway PostgreSQL (WARNING!)
```

### 3. **Railway Production** ✅

```
NODE_ENV: production
RAILWAY_ENVIRONMENT_NAME: production
LOCAL_DATABASE_URL: undefined
DATABASE_URL: postgresql://postgres:password@ballast.proxy.rlwy.net:47133/railway

Result: Uses DATABASE_URL → Railway PostgreSQL
```

### 4. **Railway Production (Alternative)** ✅

```
NODE_ENV: undefined
RAILWAY_ENVIRONMENT_NAME: production
LOCAL_DATABASE_URL: undefined
DATABASE_URL: postgresql://postgres:password@ballast.proxy.rlwy.net:47133/railway

Result: Uses DATABASE_URL → Railway PostgreSQL
```

## 📁 Environment File Structure

```
real-estate-startup/
├── .env.local                    # Local development overrides
│   └── LOCAL_DATABASE_URL=postgresql://yagnesh@localhost:5432/realtytopper_local
│
└── backend/
    └── .env                      # Default environment variables
        └── DATABASE_URL=postgresql://postgres:password@ballast.proxy.rlwy.net:47133/railway
```

## 🔧 Environment File Loading Priority

1. **First**: Load `.env.local` from project root (if exists)
2. **Fallback**: Load `.env` from backend directory
3. **Override**: Railway environment variables (in production)

## 🚀 Deployment Scenarios

### Local Development

- **File**: `/.env.local`
- **Database**: Local PostgreSQL
- **Purpose**: Development and testing

### Railway Production

- **File**: Railway environment variables
- **Database**: Railway PostgreSQL
- **Purpose**: Live production

## ⚠️ Important Notes

1. **Environment Separation**: Always set `LOCAL_DATABASE_URL` for local development
2. **Railway Auto-Detection**: Railway automatically sets `RAILWAY_ENVIRONMENT_NAME=production`
3. **Fallback Behavior**: If `LOCAL_DATABASE_URL` is not set, local development will use Railway DB
4. **Security**: Never commit `.env.local` to version control (it's in `.gitignore`)

## 🧪 Testing Environment Detection

Run the debug script to see current environment:

```bash
node debug-environment-detection.js
```

Run the simulation to see all scenarios:

```bash
node simulate-environments.js
```

## ✅ Current Status

**Your current setup is correctly configured:**

- ✅ Local development uses local PostgreSQL
- ✅ Production will use Railway PostgreSQL
- ✅ Environment separation is working properly
- ✅ No more accidental production database usage
