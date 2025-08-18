import { PrismaClient } from '@prisma/client'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME === 'production'
const isLocal = !isProduction && !isRailway

console.log('🔧 Database Configuration:')
console.log('  Environment:', process.env.NODE_ENV || 'development')
console.log('  Railway Environment:', process.env.RAILWAY_ENVIRONMENT_NAME || 'none')
console.log('  Is Production:', isProduction)
console.log('  Is Railway:', isRailway)
console.log('  Is Local:', isLocal)

// Database URL selection logic
let databaseUrl = process.env.DATABASE_URL

if (isLocal) {
  // For local development, use Railway database by default
  // This ensures consistency between local and production environments
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

console.log('  Database URL:', databaseUrl ? `${databaseUrl.split('@')[1] || 'configured'}` : 'not configured')

// Create Prisma client with the selected database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: isLocal ? ['query', 'info', 'warn', 'error'] : ['error']
})

export default prisma
