const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current database state...');
    
    // Check all tables
    const counts = await Promise.all([
      prisma.property.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.commission.count(),
      prisma.dealer.count(),
      prisma.user.count(),
      prisma.inquiry.count(),
      prisma.notification.count()
    ]);

    console.log('\n📊 Current data counts:');
    console.log(`   Properties: ${counts[0]}`);
    console.log(`   Bookings: ${counts[1]}`);
    console.log(`   Payments: ${counts[2]}`);
    console.log(`   Commissions: ${counts[3]}`);
    console.log(`   Dealers: ${counts[4]}`);
    console.log(`   Users: ${counts[5]}`);
    console.log(`   Inquiries: ${counts[6]}`);
    console.log(`   Notifications: ${counts[7]}`);

    // If there are properties, show them
    if (counts[0] > 0) {
      console.log('\n🏠 Properties found:');
      const properties = await prisma.property.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          ownerId: true
        },
        orderBy: { createdAt: 'desc' }
      });

      properties.forEach((prop, index) => {
        console.log(`${index + 1}. ID: ${prop.id}`);
        console.log(`   Title: ${prop.title}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Created: ${prop.createdAt}`);
        console.log(`   Owner ID: ${prop.ownerId}`);
        console.log('---');
      });
    }

    // Check users
    if (counts[5] > 0) {
      console.log('\n👤 Users found:');
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true
        },
        orderBy: { createdAt: 'desc' }
      });

      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('❌ Error checking current data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
