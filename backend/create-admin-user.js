const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🧪 Creating admin user for testing...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}`);
      return;
    }
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@realtytopper.com',
        name: 'Admin User',
        password: 'hashedpassword123',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   ID: ${adminUser.id}`);
    
    console.log('\n📋 To login as admin:');
    console.log('1. Go to http://localhost:5173/login');
    console.log('2. Use email: admin@realtytopper.com');
    console.log('3. Use any password (the system will accept it for testing)');
    console.log('4. You will be redirected to http://localhost:5173/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
