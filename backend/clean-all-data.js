const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanAllData() {
  try {
    console.log('🧹 Starting comprehensive database cleanup...');
    
    // First, get the admin user we want to keep
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: 'yagneshgehlot2000@gmail.com',
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      console.error('❌ Admin user yagneshgehlot2000@gmail.com not found');
      return;
    }

    console.log('✅ Found admin user to keep:', adminUser.email, 'ID:', adminUser.id);

    // Get counts before deletion
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

    console.log('\n🗑️ Starting data deletion...');

    // Delete in the correct order to avoid foreign key constraints
    
    // 1. Delete payments (depends on bookings)
    console.log('🗑️ Deleting payments...');
    await prisma.payment.deleteMany({});
    console.log('✅ Payments deleted');

    // 2. Delete bookings (depends on properties and users)
    console.log('🗑️ Deleting bookings...');
    await prisma.booking.deleteMany({});
    console.log('✅ Bookings deleted');

    // 3. Delete commissions (depends on properties)
    console.log('🗑️ Deleting commissions...');
    await prisma.commission.deleteMany({});
    console.log('✅ Commissions deleted');

    // 4. Delete properties (depends on users)
    console.log('🗑️ Deleting properties...');
    await prisma.property.deleteMany({});
    console.log('✅ Properties deleted');

    // 5. Delete dealers (depends on users)
    console.log('🗑️ Deleting dealers...');
    await prisma.dealer.deleteMany({});
    console.log('✅ Dealers deleted');

    // 6. Delete inquiries
    console.log('🗑️ Deleting inquiries...');
    await prisma.inquiry.deleteMany({});
    console.log('✅ Inquiries deleted');

    // 7. Delete notifications
    console.log('🗑️ Deleting notifications...');
    await prisma.notification.deleteMany({});
    console.log('✅ Notifications deleted');

    // 8. Delete all users except the admin
    console.log('🗑️ Deleting all users except admin...');
    await prisma.user.deleteMany({
      where: {
        id: { not: adminUser.id }
      }
    });
    console.log('✅ Non-admin users deleted');

    // Verify the cleanup
    const finalCounts = await Promise.all([
      prisma.property.count(),
      prisma.booking.count(),
      prisma.payment.count(),
      prisma.commission.count(),
      prisma.dealer.count(),
      prisma.user.count(),
      prisma.inquiry.count(),
      prisma.notification.count()
    ]);

    console.log('\n📊 Final data counts:');
    console.log(`   Properties: ${finalCounts[0]}`);
    console.log(`   Bookings: ${finalCounts[1]}`);
    console.log(`   Payments: ${finalCounts[2]}`);
    console.log(`   Commissions: ${finalCounts[3]}`);
    console.log(`   Dealers: ${finalCounts[4]}`);
    console.log(`   Users: ${finalCounts[5]}`);
    console.log(`   Inquiries: ${finalCounts[6]}`);
    console.log(`   Notifications: ${finalCounts[7]}`);

    // Verify admin user still exists
    const remainingUser = await prisma.user.findUnique({
      where: { id: adminUser.id }
    });

    if (remainingUser) {
      console.log('\n✅ Admin user preserved:');
      console.log(`   Email: ${remainingUser.email}`);
      console.log(`   Name: ${remainingUser.name}`);
      console.log(`   Role: ${remainingUser.role}`);
      console.log(`   Status: ${remainingUser.status}`);
    } else {
      console.log('\n❌ ERROR: Admin user was accidentally deleted!');
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('📝 All data has been cleared except for the admin user.');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllData();
