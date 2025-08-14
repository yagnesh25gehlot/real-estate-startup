const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationsSystem() {
  try {
    console.log('🧪 Testing notifications system...');
    
    // Get all notifications
    const allNotifications = await prisma.notification.findMany({
      where: { adminOnly: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total notifications in database: ${allNotifications.length}`);
    
    if (allNotifications.length === 0) {
      console.log('❌ No notifications found. Please create some test notifications first.');
      return;
    }
    
    // Test different filters
    console.log('\n🔍 Testing filters:');
    
    // Test type filter
    const propertyNotifications = await prisma.notification.findMany({
      where: { 
        adminOnly: true,
        type: 'PROPERTY_ADDED'
      }
    });
    console.log(`   Property Added notifications: ${propertyNotifications.length}`);
    
    // Test read filter
    const unreadNotifications = await prisma.notification.findMany({
      where: { 
        adminOnly: true,
        read: false
      }
    });
    console.log(`   Unread notifications: ${unreadNotifications.length}`);
    
    // Test search filter
    const searchNotifications = await prisma.notification.findMany({
      where: { 
        adminOnly: true,
        OR: [
          { title: { contains: 'Property', mode: 'insensitive' } },
          { message: { contains: 'Property', mode: 'insensitive' } },
        ]
      }
    });
    console.log(`   Notifications containing "Property": ${searchNotifications.length}`);
    
    // Test date filter (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayNotifications = await prisma.notification.findMany({
      where: { 
        adminOnly: true,
        createdAt: { gte: today }
      }
    });
    console.log(`   Today's notifications: ${todayNotifications.length}`);
    
    // Display notification types
    console.log('\n📋 Notification types:');
    const typeCounts = {};
    allNotifications.forEach(notification => {
      typeCounts[notification.type] = (typeCounts[notification.type] || 0) + 1;
    });
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    // Display read status
    console.log('\n📋 Read status:');
    const readCount = allNotifications.filter(n => n.read).length;
    const unreadCount = allNotifications.filter(n => !n.read).length;
    console.log(`   Read: ${readCount}`);
    console.log(`   Unread: ${unreadCount}`);
    
    // Display recent notifications
    console.log('\n📋 Recent notifications (last 5):');
    allNotifications.slice(0, 5).forEach((notification, index) => {
      console.log(`   ${index + 1}. ${notification.title} (${notification.type}) - ${notification.read ? 'Read' : 'Unread'}`);
    });
    
    // Test API endpoint
    console.log('\n🧪 Testing API endpoint...');
    const response = await fetch('http://localhost:3001/api/notifications', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint working');
      console.log(`📊 API returned ${data.data.notifications.length} notifications`);
    } else {
      console.log('❌ API endpoint failed (expected due to auth)');
      console.log('Status:', response.status);
    }
    
    console.log('\n✅ Notifications system test completed!');
    console.log('📋 You can now visit http://localhost:5173/admin/notifications to see the full interface');
    
  } catch (error) {
    console.error('❌ Error testing notifications system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationsSystem();
