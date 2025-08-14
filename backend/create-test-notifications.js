const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestNotifications() {
  try {
    console.log('🧪 Creating test notifications...');
    
    // Create various types of test notifications
    const testNotifications = [
      {
        type: 'PROPERTY_ADDED',
        title: 'New Property Listed',
        message: 'User John Doe (john@example.com) has listed a new property: "Luxury Villa in Bandra West"',
        data: {
          propertyId: 'test-property-1',
          propertyTitle: 'Luxury Villa in Bandra West',
          propertyPrice: 25000000,
          propertyLocation: 'Mumbai',
          userId: 'test-user-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        type: 'BOOKING_CREATED',
        title: 'New Booking Request',
        message: 'User Jane Smith (jane@example.com) has created a booking for "Modern Apartment in Andheri"',
        data: {
          bookingId: 'test-booking-1',
          propertyId: 'test-property-2',
          propertyTitle: 'Modern Apartment in Andheri',
          userId: 'test-user-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 300,
          paymentRef: 'UPI123456789'
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        type: 'USER_SIGNUP',
        title: 'New User Registration',
        message: 'New user registered: Alice Johnson (alice@example.com)',
        data: {
          userId: 'test-user-3',
          userName: 'Alice Johnson',
          userEmail: 'alice@example.com',
          userRole: 'USER'
        },
        adminOnly: true,
        read: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      },
      {
        type: 'DEALER_REQUEST',
        title: 'New Dealer Request',
        message: 'User Bob Wilson (bob@example.com) has requested to become a dealer',
        data: {
          dealerId: 'test-dealer-1',
          userId: 'test-user-4',
          userName: 'Bob Wilson',
          userEmail: 'bob@example.com',
          referralCode: 'BOB123'
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
      },
      {
        type: 'PROPERTY_UPDATED',
        title: 'Property Updated',
        message: 'User Carol Brown (carol@example.com) has updated property: "Spacious 3BHK in Powai"',
        data: {
          propertyId: 'test-property-3',
          propertyTitle: 'Spacious 3BHK in Powai',
          changes: {
            price: { from: 18000000, to: 20000000 },
            description: 'Updated with new amenities'
          },
          userId: 'test-user-5',
          userName: 'Carol Brown',
          userEmail: 'carol@example.com'
        },
        adminOnly: true,
        read: true,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        type: 'PROPERTY_ADDED',
        title: 'New Property Listed',
        message: 'User David Lee (david@example.com) has listed a new property: "Commercial Space in BKC"',
        data: {
          propertyId: 'test-property-4',
          propertyTitle: 'Commercial Space in BKC',
          propertyPrice: 45000000,
          propertyLocation: 'Mumbai',
          userId: 'test-user-6',
          userName: 'David Lee',
          userEmail: 'david@example.com',
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        type: 'BOOKING_CREATED',
        title: 'New Booking Request',
        message: 'User Emma Davis (emma@example.com) has created a booking for "Premium Villa in Worli"',
        data: {
          bookingId: 'test-booking-2',
          propertyId: 'test-property-5',
          propertyTitle: 'Premium Villa in Worli',
          userId: 'test-user-7',
          userName: 'Emma Davis',
          userEmail: 'emma@example.com',
          amount: 300,
          paymentRef: 'UPI987654321'
        },
        adminOnly: true,
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        type: 'DEALER_REQUEST',
        title: 'New Dealer Request',
        message: 'User Frank Miller (frank@example.com) has requested to become a dealer',
        data: {
          dealerId: 'test-dealer-2',
          userId: 'test-user-8',
          userName: 'Frank Miller',
          userEmail: 'frank@example.com',
          referralCode: 'FRANK456'
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        type: 'USER_SIGNUP',
        title: 'New User Registration',
        message: 'New user registered: Grace Taylor (grace@example.com)',
        data: {
          userId: 'test-user-9',
          userName: 'Grace Taylor',
          userEmail: 'grace@example.com',
          userRole: 'USER'
        },
        adminOnly: true,
        read: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      },
      {
        type: 'PROPERTY_UPDATED',
        title: 'Property Updated',
        message: 'User Henry Anderson (henry@example.com) has updated property: "Studio Apartment in Colaba"',
        data: {
          propertyId: 'test-property-6',
          propertyTitle: 'Studio Apartment in Colaba',
          changes: {
            status: { from: 'FREE', to: 'BOOKED' },
            price: { from: 8500000, to: 9000000 }
          },
          userId: 'test-user-10',
          userName: 'Henry Anderson',
          userEmail: 'henry@example.com'
        },
        adminOnly: true,
        read: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }
    ];
    
    // Create notifications
    for (let i = 0; i < testNotifications.length; i++) {
      const notification = testNotifications[i];
      console.log(`📝 Creating notification ${i + 1}: ${notification.title}`);
      
      await prisma.notification.create({
        data: notification
      });
      
      console.log(`✅ Notification ${i + 1} created successfully`);
    }
    
    console.log('\n🎉 Test notifications created successfully!');
    console.log('📋 Now visit http://localhost:5173/admin/notifications to see the notifications page');
    
  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNotifications();
