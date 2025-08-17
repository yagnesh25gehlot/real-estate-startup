const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'bussinessstatupwork@gmail.com' },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('   Status:', existingAdmin.status);
      return;
    }

    console.log('📝 Creating new admin user...');
    
    // Generate password hash
    const password = 'Nikku@25';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'bussinessstatupwork@gmail.com',
        name: 'Business Admin',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        mobile: '+91-9876543210',
        aadhaar: '123456789012',
        aadhaarImage: '/uploads/aadhaar/test-aadhaar.svg',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Role:', adminUser.role);
    console.log('   Status:', adminUser.status);
    console.log('   Password: Nikku@25');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Email: bussinessstatupwork@gmail.com');
    console.log('   Password: Nikku@25');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
