const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables the same way as the backend
const envPath = path.join(__dirname, '../.env.local');
const defaultEnvPath = path.join(__dirname, '.env');

if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('📁 Loaded local environment file (.env.local)');
} else {
  dotenv.config({ path: defaultEnvPath });
  console.log('📁 Loaded default environment file (.env)');
}

// Get database URL the same way as the backend
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME === 'production';
const isLocal = !isProduction && !isRailway;

const getDatabaseUrl = () => {
  let databaseUrl;

  if (isLocal) {
    databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
    if (process.env.LOCAL_DATABASE_URL) {
      console.log('✅ Using local database for development');
    } else {
      console.log('⚠️  WARNING: Using Railway database for local development');
    }
  } else if (isRailway || isProduction) {
    databaseUrl = process.env.DATABASE_URL;
    console.log('✅ Using Railway production database');
  } else {
    databaseUrl = process.env.DATABASE_URL;
    console.log('⚠️  Using default DATABASE_URL');
  }

  if (!databaseUrl) {
    console.error('❌ No database URL found for current environment');
    process.exit(1);
  }

  return databaseUrl;
};

const DATABASE_URL = getDatabaseUrl();
console.log('🔗 Database URL:', DATABASE_URL);

// Test the connection
async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });

  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check user count
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: 'yagneshgehlot2000@gmail.com',
        role: 'ADMIN'
      }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Check for any other users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    if (allUsers.length > 0) {
      console.log('\n👥 All users in database:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.name}`);
      });
    } else {
      console.log('\n👥 No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
