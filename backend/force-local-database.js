const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 Force Local Database Configuration');
console.log('=====================================\n');

// Set environment variables to force local database
process.env.LOCAL_DATABASE_URL = "postgresql://yagnesh@localhost:5432/realtytopper_local";
process.env.DATABASE_URL = "postgresql://yagnesh@localhost:5432/realtytopper_local";
process.env.NODE_ENV = "development";

console.log('✅ Environment variables set:');
console.log('   LOCAL_DATABASE_URL:', process.env.LOCAL_DATABASE_URL);
console.log('   DATABASE_URL:', process.env.DATABASE_URL);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Start the backend server with forced environment
console.log('\n🚀 Starting backend server with local database...');

const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname),
  env: {
    ...process.env,
    LOCAL_DATABASE_URL: "postgresql://yagnesh@localhost:5432/realtytopper_local",
    DATABASE_URL: "postgresql://yagnesh@localhost:5432/realtytopper_local",
    NODE_ENV: "development"
  },
  stdio: 'inherit'
});

backendProcess.on('error', (error) => {
  console.error('❌ Error starting backend:', error);
});

backendProcess.on('close', (code) => {
  console.log(`\n🔚 Backend process exited with code ${code}`);
});
