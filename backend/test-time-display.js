const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTimeTestBookings() {
  try {
    console.log('🧪 Creating test bookings with specific times...');
    
    // Get first user and a few properties
    const user = await prisma.user.findFirst();
    const properties = await prisma.property.findMany({ take: 3 });
    
    if (!user || properties.length === 0) {
      console.log('❌ Need user and properties for test');
      return;
    }
    
    // Create bookings with specific times for testing
    const testBookings = [
      {
        propertyId: properties[0].id,
        userId: user.id,
        startDate: new Date('2025-08-12T10:00:00.000Z'), // 10:00 AM
        endDate: new Date('2025-08-15T10:00:00.000Z'),   // 10:00 AM 3 days later
        status: 'CONFIRMED',
        paymentRef: 'TIME_TEST_001'
      },
      {
        propertyId: properties[1].id,
        userId: user.id,
        startDate: new Date('2025-08-12T14:30:00.000Z'), // 2:30 PM
        endDate: new Date('2025-08-15T14:30:00.000Z'),   // 2:30 PM 3 days later
        status: 'PENDING',
        paymentRef: 'TIME_TEST_002'
      },
      {
        propertyId: properties[2].id,
        userId: user.id,
        startDate: new Date('2025-08-12T18:45:00.000Z'), // 6:45 PM
        endDate: new Date('2025-08-15T18:45:00.000Z'),   // 6:45 PM 3 days later
        status: 'CONFIRMED',
        paymentRef: 'TIME_TEST_003'
      }
    ];
    
    for (let i = 0; i < testBookings.length; i++) {
      const bookingData = testBookings[i];
      
      console.log(`📝 Creating booking ${i + 1}: ${properties[i].title}`);
      console.log(`⏰ Start: ${bookingData.startDate.toLocaleString()}`);
      console.log(`⏰ End: ${bookingData.endDate.toLocaleString()}`);
      
      const booking = await prisma.booking.create({
        data: {
          ...bookingData,
          dealerCode: null,
          bookingCharges: 300.0,
          totalAmount: 300.0,
          paymentMethod: 'UPI'
        }
      });
      
      // Update property to BOOKED
      await prisma.property.update({
        where: { id: properties[i].id },
        data: { status: 'BOOKED' }
      });
      
      console.log(`✅ Booking ${i + 1} created successfully`);
      console.log(`📊 Booking ID: ${booking.id}`);
      console.log('---');
    }
    
    console.log('🎉 Time test bookings created successfully!');
    console.log('📋 Now visit http://localhost:5173/admin/bookings to see time display');
    console.log('⏰ You should see different times for each booking');
    
  } catch (error) {
    console.error('❌ Error creating time test bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTimeTestBookings();
