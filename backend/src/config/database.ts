import { PrismaClient } from '@prisma/client'
import { config } from './environment'

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
