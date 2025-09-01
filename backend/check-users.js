const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('---');
    });

    // Check specific user IDs from the error
    const specificIds = [
      'b2146643-a139-4dc9-8531-82f7ae5c5f80',
      'f02c0334-ba98-46ed-9da6-e6a33b9f699c'
    ];

    console.log('\n🔍 Checking specific user IDs:');
    for (const id of specificIds) {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (user) {
        console.log(`✅ User found - ID: ${id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
      } else {
        console.log(`❌ User not found - ID: ${id}`);
      }
    }

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
