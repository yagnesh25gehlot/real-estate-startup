const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestBookings() {
  try {
    console.log('🧪 Creating test bookings with expired dates...');
    
    // Get first user and first few properties
    const user = await prisma.user.findFirst();
    const properties = await prisma.property.findMany({ take: 5 });
    
    if (!user) {
      console.error('❌ No users found. Please create a user first.');
      return;
    }
    
    if (properties.length === 0) {
      console.error('❌ No properties found. Please create some properties first.');
      return;
    }
    
    console.log(`👤 Using user: ${user.email}`);
    console.log(`🏠 Found ${properties.length} properties to book`);
    
    // Create test bookings with different scenarios
    const testBookings = [
      {
        propertyId: properties[0].id,
        userId: user.id,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),   // 2 days ago (EXPIRED)
        dealerCode: null,
        bookingCharges: 300.0,
        totalAmount: 300.0,
        status: 'CONFIRMED',
        paymentMethod: 'UPI',
        paymentRef: 'TEST_EXPIRED_001'
      },
      {
        propertyId: properties[1].id,
        userId: user.id,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),   // 1 day ago (EXPIRED)
        dealerCode: null,
        bookingCharges: 300.0,
        totalAmount: 300.0,
        status: 'CONFIRMED',
        paymentMethod: 'UPI',
        paymentRef: 'TEST_EXPIRED_002'
      },
      {
        propertyId: properties[2].id,
        userId: user.id,
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),   // 4 days from now (NOT EXPIRED)
        dealerCode: null,
        bookingCharges: 300.0,
        totalAmount: 300.0,
        status: 'CONFIRMED',
        paymentMethod: 'UPI',
        paymentRef: 'TEST_ACTIVE_001'
      },
      {
        propertyId: properties[3].id,
        userId: user.id,
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),   // 2 days from now (NOT EXPIRED)
        dealerCode: null,
        bookingCharges: 300.0,
        totalAmount: 300.0,
        status: 'CONFIRMED',
        paymentMethod: 'UPI',
        paymentRef: 'TEST_ACTIVE_002'
      }
    ];
    
    // Create the bookings
    for (let i = 0; i < testBookings.length; i++) {
      const bookingData = testBookings[i];
      
      console.log(`📝 Creating booking ${i + 1}: ${properties[i].title}`);
      
      await prisma.booking.create({
        data: bookingData
      });
      
      // Update property status to BOOKED
      await prisma.property.update({
        where: { id: properties[i].id },
        data: { status: 'BOOKED' }
      });
      
      console.log(`✅ Booking ${i + 1} created successfully`);
    }
    
    console.log('\n🎉 Test bookings created successfully!');
    console.log('📊 Summary:');
    console.log('- 2 expired bookings (should be marked as EXPIRED)');
    console.log('- 2 active bookings (should remain CONFIRMED)');
    console.log('- 4 properties marked as BOOKED');
    
    console.log('\n🧪 Now you can run: node test-expired-bookings.js');
    
  } catch (error) {
    console.error('❌ Error creating test bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestBookings();
