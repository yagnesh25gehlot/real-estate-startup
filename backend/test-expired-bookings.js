const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testExpiredBookings() {
  try {
    console.log('🧪 Testing expired bookings system...');
    
    // First, let's see current bookings
    const currentBookings = await prisma.booking.findMany({
      include: {
        property: true,
        user: true
      }
    });
    
    console.log(`📊 Current bookings count: ${currentBookings.length}`);
    
    if (currentBookings.length === 0) {
      console.log('❌ No bookings found. Please create some test bookings first.');
      return;
    }
    
    // Show current booking statuses
    console.log('\n📋 Current booking statuses:');
    currentBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.property.title} - Status: ${booking.status} - End Date: ${booking.endDate}`);
    });
    
    // Run the expired bookings check manually
    console.log('\n🕐 Running expired bookings check...');
    
    const now = new Date();
    
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        endDate: { lt: now },
      },
      include: { property: true },
    });

    console.log(`📊 Found ${expiredBookings.length} expired bookings`);

    for (const booking of expiredBookings) {
      console.log(`🔄 Processing expired booking: ${booking.property.title}`);
      
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'EXPIRED' },
        }),
        prisma.property.update({
          where: { id: booking.propertyId },
          data: { status: 'FREE' },
        }),
      ]);
      
      console.log(`✅ Updated booking: ${booking.property.title} -> EXPIRED`);
      console.log(`✅ Freed property: ${booking.property.title} -> FREE`);
    }
    
    // Check results after update
    const updatedBookings = await prisma.booking.findMany({
      include: {
        property: true,
        user: true
      }
    });
    
    console.log('\n📋 Updated booking statuses:');
    updatedBookings.forEach((booking, index) => {
      console.log(`${index + 1}. ${booking.property.title} - Status: ${booking.status} - End Date: ${booking.endDate}`);
    });
    
    // Check properties that were freed
    const freedProperties = await prisma.property.findMany({
      where: { status: 'FREE' }
    });
    
    console.log(`\n🏠 Properties with FREE status: ${freedProperties.length}`);
    freedProperties.forEach((property, index) => {
      console.log(`${index + 1}. ${property.title} - Status: ${property.status}`);
    });
    
    console.log('\n✅ Expired bookings test completed!');
    
  } catch (error) {
    console.error('❌ Error testing expired bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testExpiredBookings();
