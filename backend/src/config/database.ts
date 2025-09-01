import { PrismaClient } from '@prisma/client'
import { config } from './environment'

console.log('🔧 DATABASE CONFIGURATION:');
console.log('   Environment:', process.env.NODE_ENV || 'undefined');
console.log('   Railway:', process.env.RAILWAY_ENVIRONMENT_NAME || 'undefined');
console.log('   Is Development:', config.isLocal);
console.log('   Database URL:', config.DATABASE_URL ? 'configured' : 'not configured');

// Create Prisma client with the configured database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.DATABASE_URL
    }
  },
  log: config.isLocal ? ['query', 'info', 'warn', 'error'] : ['error']
})

export default prisma
