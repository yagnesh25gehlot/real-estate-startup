const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickTest() {
  try {
    console.log('🧪 Quick test of automated expired bookings system...');
    
    // Get first user and a property
    const user = await prisma.user.findFirst();
    const property = await prisma.property.findFirst({ where: { status: 'FREE' } });
    
    if (!user || !property) {
      console.log('❌ Need user and free property for test');
      return;
    }
    
    // Create a booking that expires in 2 minutes
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Yesterday
    const endDate = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
    
    console.log(`📝 Creating test booking for: ${property.title}`);
    console.log(`⏰ End date: ${endDate.toLocaleString()}`);
    
    const booking = await prisma.booking.create({
      data: {
        propertyId: property.id,
        userId: user.id,
        startDate: startDate,
        endDate: endDate,
        dealerCode: null,
        bookingCharges: 300.0,
        totalAmount: 300.0,
        status: 'CONFIRMED',
        paymentMethod: 'UPI',
        paymentRef: 'QUICK_TEST_001'
      }
    });
    
    // Update property to BOOKED
    await prisma.property.update({
      where: { id: property.id },
      data: { status: 'BOOKED' }
    });
    
    console.log('✅ Test booking created successfully!');
    console.log(`📊 Booking ID: ${booking.id}`);
    console.log(`🏠 Property: ${property.title} is now BOOKED`);
    console.log(`⏰ This booking will expire in 2 minutes`);
    console.log('\n🔄 The automated system will check for expired bookings every hour');
    console.log('📋 You can also manually trigger the check from the admin panel');
    
  } catch (error) {
    console.error('❌ Error in quick test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

quickTest();
