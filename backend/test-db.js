const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test user query
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ Database connection successful');
    console.log('Users found:', users.length);
    
    // Test property creation
    const testProperty = {
      title: 'Test Property',
      description: 'This is a test property',
      type: 'APARTMENT',
      location: 'Test Location',
      address: '123 Test Street, Test City, Test State 12345',
      price: 500000,
      latitude: 12.9716,
      longitude: 77.5946,
      mediaUrls: '[]',
      ownerId: users[0]?.id || '174db9e8-d000-43b9-9d62-8dc0f33b746b' // Use admin user ID
    };
    
    console.log('Creating test property...');
    const property = await prisma.property.create({
      data: testProperty
    });
    
    console.log('✅ Property created successfully!');
    console.log('Property ID:', property.id);
    
    // Clean up
    await prisma.property.delete({
      where: { id: property.id }
    });
    console.log('✅ Test property cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
