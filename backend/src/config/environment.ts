import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from the correct location
// Priority: .env.local (local development) > .env (default)
const envPath = path.join(__dirname, '../../../.env.local')
const defaultEnvPath = path.join(__dirname, '../../.env')

console.log('🔍 Environment file paths:');
console.log('   .env.local path:', envPath);
console.log('   .env path:', defaultEnvPath);
console.log('   .env.local exists:', require('fs').existsSync(envPath));
console.log('   .env exists:', require('fs').existsSync(defaultEnvPath));

// FORCE LOCAL DATABASE CONFIGURATION
console.log('🚨 FORCING LOCAL DATABASE CONFIGURATION');

// Load local environment file first (if exists)
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('📁 Loaded local environment file (.env.local)')
} else {
  // Fallback to default .env file
  dotenv.config({ path: defaultEnvPath })
  console.log('📁 Loaded default environment file (.env)')
}

// FORCE OVERRIDE DATABASE URL FOR LOCAL DEVELOPMENT
process.env.DATABASE_URL = process.env.LOCAL_DATABASE_URL || "postgresql://yagnesh@localhost:5432/realtytopper_local";
console.log('🔧 FORCED DATABASE_URL to local database');
console.log('   DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME === 'production'
const isLocal = !isProduction && !isRailway

// Database configuration
const getDatabaseUrl = (): string => {
  let databaseUrl: string | undefined

  console.log('🔍 Database URL Selection Debug:');
  console.log('   isLocal:', isLocal);
  console.log('   isRailway:', isRailway);
  console.log('   isProduction:', isProduction);
  console.log('   LOCAL_DATABASE_URL:', process.env.LOCAL_DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

  // ALWAYS USE LOCAL DATABASE FOR DEVELOPMENT
if (isLocal) {
  // Always use local database for local development
  databaseUrl = process.env.DATABASE_URL || "postgresql://yagnesh@localhost:5432/realtytopper_local"
  console.log('✅ FORCED: Using local database for development')
  console.log('   Database URL:', databaseUrl?.substring(0, 50) + '...')
} else if (isRailway || isProduction) {
  // Production/Railway - use Railway database
  databaseUrl = process.env.DATABASE_URL
  console.log('✅ Using Railway production database')
} else {
  // Fallback
  databaseUrl = process.env.DATABASE_URL
  console.log('⚠️  Using default DATABASE_URL')
}

  if (!databaseUrl) {
    console.error('❌ No database URL found for current environment')
    console.error('   Local development: Set LOCAL_DATABASE_URL')
    console.error('   Production: Set DATABASE_URL')
    process.exit(1)
  }

  // Validate database URL
  if (!databaseUrl.includes('postgresql://')) {
    console.error('❌ Invalid DATABASE_URL format')
    process.exit(1)
  }

  return databaseUrl
}

// Environment configuration
export const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // Database
  DATABASE_URL: getDatabaseUrl(),
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  
  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Commission Configuration
  COMMISSION_LEVEL_1: parseFloat(process.env.COMMISSION_LEVEL_1 || '10.0'),
  COMMISSION_LEVEL_2: parseFloat(process.env.COMMISSION_LEVEL_2 || '5.0'),
  COMMISSION_LEVEL_3: parseFloat(process.env.COMMISSION_LEVEL_3 || '2.5'),
  
  // Booking Configuration
  DEFAULT_BOOKING_DURATION_DAYS: parseInt(process.env.DEFAULT_BOOKING_DURATION_DAYS || '3', 10),
  
  // Admin Configuration
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Nikku@25',
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'TestUserPass123!',
  
  // Security Configuration
  PAYMENTS_MODE: process.env.PAYMENTS_MODE || 'auto',
  
  // AWS S3 (optional)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Mailgun (optional)
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || '',
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || '',
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Environment flags
  isProduction,
  isRailway,
  isLocal
}

// Log configuration
console.log('🔧 Environment Configuration:')
console.log('  Environment:', config.NODE_ENV)
console.log('  Railway Environment:', process.env.RAILWAY_ENVIRONMENT_NAME || 'none')
console.log('  Is Production:', config.isProduction)
console.log('  Is Railway:', config.isRailway)
console.log('  Is Local:', config.isLocal)
console.log('  Port:', config.PORT)
console.log('  Database URL:', config.DATABASE_URL ? `${config.DATABASE_URL.split('@')[1] || 'configured'}` : 'not configured')

export default config
