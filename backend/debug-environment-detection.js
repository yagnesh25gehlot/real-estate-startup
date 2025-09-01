const dotenv = require('dotenv');
const path = require('path');

console.log('🔍 Environment Detection Debug Script');
console.log('=====================================\n');

// Step 1: Check current working directory
console.log('📁 Current working directory:', process.cwd());

// Step 2: Check environment file paths
const envPath = path.join(__dirname, '../.env.local');
const defaultEnvPath = path.join(__dirname, '.env');

console.log('🔍 Environment file paths:');
console.log('   .env.local path:', envPath);
console.log('   .env path:', defaultEnvPath);
console.log('   .env.local exists:', require('fs').existsSync(envPath));
console.log('   .env exists:', require('fs').existsSync(defaultEnvPath));

// Step 3: Load environment files
console.log('\n📁 Loading environment files...');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded local environment file (.env.local)');
} else {
  dotenv.config({ path: defaultEnvPath });
  console.log('✅ Loaded default environment file (.env)');
}

// Step 4: Check environment variables
console.log('\n🔧 Environment Variables:');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('   RAILWAY_ENVIRONMENT_NAME:', process.env.RAILWAY_ENVIRONMENT_NAME || 'undefined');
console.log('   PORT:', process.env.PORT || 'undefined');

// Step 5: Environment detection logic
console.log('\n🎯 Environment Detection Logic:');
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME === 'production';
const isLocal = !isProduction && !isRailway;

console.log('   isProduction:', isProduction);
console.log('   isRailway:', isRailway);
console.log('   isLocal:', isLocal);

// Step 6: Database URL selection
console.log('\n🗄️ Database URL Selection:');
console.log('   LOCAL_DATABASE_URL:', process.env.LOCAL_DATABASE_URL ? 'SET' : 'NOT SET');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

let databaseUrl;
let databaseSource;

if (isLocal) {
  databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL;
  if (process.env.LOCAL_DATABASE_URL) {
    databaseSource = 'LOCAL_DATABASE_URL (local development)';
    console.log('✅ Using local database for development');
  } else {
    databaseSource = 'DATABASE_URL (fallback)';
    console.log('⚠️  WARNING: Using Railway database for local development');
  }
} else if (isRailway || isProduction) {
  databaseUrl = process.env.DATABASE_URL;
  databaseSource = 'DATABASE_URL (production/railway)';
  console.log('✅ Using Railway production database');
} else {
  databaseUrl = process.env.DATABASE_URL;
  databaseSource = 'DATABASE_URL (fallback)';
  console.log('⚠️  Using default DATABASE_URL');
}

console.log('\n🔗 Final Database Configuration:');
console.log('   Database URL:', databaseUrl ? databaseUrl.substring(0, 50) + '...' : 'NOT SET');
console.log('   Source:', databaseSource);

// Step 7: Environment summary
console.log('\n📊 Environment Summary:');
console.log('   Environment Type:', isLocal ? 'LOCAL DEVELOPMENT' : isRailway ? 'RAILWAY PRODUCTION' : 'UNKNOWN');
console.log('   Database Type:', databaseUrl?.includes('localhost') ? 'LOCAL POSTGRESQL' : databaseUrl?.includes('railway') ? 'RAILWAY POSTGRESQL' : 'UNKNOWN');

// Step 8: Recommendations
console.log('\n💡 Recommendations:');
if (isLocal && !process.env.LOCAL_DATABASE_URL) {
  console.log('   ⚠️  Set LOCAL_DATABASE_URL in .env.local for proper environment separation');
}
if (isLocal && process.env.LOCAL_DATABASE_URL) {
  console.log('   ✅ Local development properly configured');
}
if (isRailway || isProduction) {
  console.log('   ✅ Production environment properly configured');
}

console.log('\n🎯 Environment Detection Complete!');
