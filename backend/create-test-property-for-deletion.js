const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPropertyForDeletion() {
  try {
    console.log('🔍 Creating test property for deletion testing...');
    
    // Get the admin user
    const user = await prisma.user.findFirst({
      where: { email: 'yagneshgehlot2000@gmail.com' }
    });

    if (!user) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log('Using user:', user.email, 'ID:', user.id);

    // Create test property
    const property = await prisma.property.create({
      data: {
        title: 'Test Property for Deletion API',
        description: 'This property will be used to test the deletion API',
        type: 'APARTMENT',
        action: 'RENT',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302001',
        locality: 'Test Locality',
        street: 'Test Street',
        landmark: 'Test Landmark',
        subRegion: 'Test Region',
        location: 'Jaipur, Rajasthan',
        address: 'Test Address, Jaipur, Rajasthan',
        latitude: 26.9124,
        longitude: 75.7873,
        area: 1000,
        bhk: 1,
        perMonthCharges: 12000,
        furnishingStatus: 'FURNISHED',
        amenities: 'Parking, Lift, Security',
        status: 'FREE',
        registeredAs: 'OWNER',
        mobileNumber: '7023176884',
        bookingCharges: 1000,
        mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']),
        ownerId: user.id
      }
    });

    console.log('✅ Test property created successfully!');
    console.log('Property ID:', property.id);
    console.log('Property Title:', property.title);
    console.log('Property Status:', property.status);
    console.log('Owner ID:', property.ownerId);

    console.log('\n🎯 Now you can test deletion by:');
    console.log('1. Going to: http://localhost:5173/admin/properties');
    console.log('2. Finding the property: "Test Property for Deletion API"');
    console.log('3. Clicking the delete button');
    console.log('4. Checking the backend logs for detailed information');

  } catch (error) {
    console.error('Error creating test property:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPropertyForDeletion();
