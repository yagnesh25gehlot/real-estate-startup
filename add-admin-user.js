const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Generate password hash for 'Nikku@25'
    const password = 'Nikku@25';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Password hash generated');
    console.log('🔑 Login Credentials:');
    console.log('   Email: bussinessstatupwork@gmail.com');
    console.log('   Password: Nikku@25');
    console.log('');
    console.log('📋 SQL to run in Railway database:');
    console.log('');
    console.log(`INSERT INTO "User" ("id", "email", "name", "password", "role", "status", "createdAt") VALUES (
    gen_random_uuid(),
    'bussinessstatupwork@gmail.com',
    'Business Admin',
    '${hashedPassword}',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP
) ON CONFLICT ("email") DO NOTHING;`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminUser();
