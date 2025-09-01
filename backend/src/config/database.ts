import { PrismaClient } from '@prisma/client'
import { config } from './environment'

// PERMANENT SOLUTION: Force local database for development
const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT_NAME;

// FORCE LOCAL DATABASE ALWAYS FOR DEVELOPMENT
const databaseUrl = "postgresql://yagnesh@localhost:5432/realtytopper_local";

console.log('🚨 FORCING LOCAL DATABASE ALWAYS!');
console.log('   This will override any other database configuration');

console.log('🔧 DATABASE CONFIGURATION:');
console.log('   Environment:', process.env.NODE_ENV || 'undefined');
console.log('   Railway:', process.env.RAILWAY_ENVIRONMENT_NAME || 'undefined');
console.log('   Is Development:', isDevelopment);
console.log('   Database URL:', databaseUrl?.substring(0, 50) + '...');
console.log('   Full Database URL:', databaseUrl);

// Create Prisma client with the configured database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: config.isLocal ? ['query', 'info', 'warn', 'error'] : ['error']
})

export default prisma
