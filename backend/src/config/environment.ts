import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from the correct location
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME === 'production'
const isLocal = !isProduction && !isRailway

// Database configuration
const getDatabaseUrl = (): string => {
  let databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables')
    process.exit(1)
  }

  // For local development, use Railway database by default
  if (isLocal) {
    console.log('✅ Using Railway database for local development')
    
    // If you want to use a local database instead, set LOCAL_DATABASE_URL environment variable
    if (process.env.LOCAL_DATABASE_URL) {
      databaseUrl = process.env.LOCAL_DATABASE_URL
      console.log('✅ Using local database (LOCAL_DATABASE_URL set)')
    }
  } else if (isRailway || isProduction) {
    console.log('✅ Using Railway production database')
  } else {
    console.log('⚠️  Using default DATABASE_URL')
  }

  // Validate database URL
  if (!databaseUrl || !databaseUrl.includes('postgresql://')) {
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
