const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestProperty() {
  try {
    console.log('🔍 Creating test property...');
    
    // First, get or create a test user
    let user = await prisma.user.findFirst({
      where: { email: 'yagneshgehlot2000@gmail.com' }
    });

    if (!user) {
      console.log('Creating test user...');
      user = await prisma.user.create({
        data: {
          email: 'yagneshgehlot2000@gmail.com',
          name: 'Yagnesh Gehlot',
          mobile: '7023176884',
          aadhaar: '123456789012',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
    }

    console.log('Using user:', user.email, 'ID:', user.id);

    // Create test property
    const property = await prisma.property.create({
      data: {
        title: 'Test Property for Booking',
        description: 'This is a test property to verify booking functionality',
        type: 'HOUSE',
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
        area: 1200,
        bhk: 2,
        perMonthCharges: 15000,
        furnishingStatus: 'SEMI_FURNISHED',
        amenities: 'Parking, Garden, Security',
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

    // Also create the specific property ID that was failing
    const specificProperty = await prisma.property.create({
      data: {
        id: 'cee381d6-8439-4b38-9744-7f5cec6b57fe', // Use the specific ID from the error
        title: 'Specific Test Property',
        description: 'This property uses the specific ID that was failing',
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

    console.log('✅ Specific test property created successfully!');
    console.log('Specific Property ID:', specificProperty.id);
    console.log('Specific Property Title:', specificProperty.title);

  } catch (error) {
    console.error('Error creating test property:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestProperty();
