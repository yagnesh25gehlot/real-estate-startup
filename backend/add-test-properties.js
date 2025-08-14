const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testProperties = [
  {
    title: "Modern 3-Bedroom Apartment in Bandra West",
    description: "Beautiful apartment with sea view, modern amenities, and excellent connectivity. Perfect for families looking for luxury living in Mumbai's premium location.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Bandra West, Mumbai, Maharashtra",
    latitude: 19.0596,
    longitude: 72.8295,
    price: 25000000,
    status: "FREE"
  },
  {
    title: "Spacious 4-BHK Villa in Whitefield",
    description: "Luxurious villa with private garden, swimming pool, and modern interiors. Located in Bangalore's IT hub with excellent infrastructure.",
    type: "VILLA",
    location: "Bangalore",
    address: "Whitefield, Bangalore, Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    price: 45000000,
    status: "FREE"
  },
  {
    title: "Commercial Space in Connaught Place",
    description: "Prime commercial property in Delhi's business district. Ideal for retail, office, or restaurant. High footfall area with excellent visibility.",
    type: "COMMERCIAL",
    location: "Delhi",
    address: "Connaught Place, New Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    price: 35000000,
    status: "FREE"
  },
  {
    title: "Cozy 2-Bedroom House in Koramangala",
    description: "Well-maintained house with garden, parking space, and modern amenities. Perfect for small families in Bangalore's popular residential area.",
    type: "HOUSE",
    location: "Bangalore",
    address: "Koramangala, Bangalore, Karnataka",
    latitude: 12.9352,
    longitude: 77.6245,
    price: 18000000,
    status: "FREE"
  },
  {
    title: "Residential Plot in Electronic City",
    description: "Premium residential plot with all approvals and clear title. Ready for construction with excellent connectivity to IT parks.",
    type: "PLOT",
    location: "Bangalore",
    address: "Electronic City, Bangalore, Karnataka",
    latitude: 12.8458,
    longitude: 77.6658,
    price: 8500000,
    status: "FREE"
  },
  {
    title: "Luxury Penthouse in Worli",
    description: "Stunning penthouse with panoramic city views, private terrace, and world-class amenities. The epitome of luxury living in Mumbai.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Worli, Mumbai, Maharashtra",
    latitude: 19.0170,
    longitude: 72.8147,
    price: 75000000,
    status: "FREE"
  },
  {
    title: "Office Space in Cyber City",
    description: "Modern office space in Gurgaon's business district. Fully furnished with meeting rooms, cafeteria, and parking facilities.",
    type: "COMMERCIAL",
    location: "Gurgaon",
    address: "Cyber City, Gurgaon, Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
    price: 28000000,
    status: "FREE"
  },
  {
    title: "Family Villa in HSR Layout",
    description: "Beautiful villa with 5 bedrooms, private pool, and landscaped garden. Perfect for large families seeking luxury and privacy.",
    type: "VILLA",
    location: "Bangalore",
    address: "HSR Layout, Bangalore, Karnataka",
    latitude: 12.9141,
    longitude: 77.6387,
    price: 52000000,
    status: "FREE"
  },
  {
    title: "Studio Apartment in Andheri West",
    description: "Compact and modern studio apartment perfect for young professionals. Well-connected with metro and shopping centers nearby.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Andheri West, Mumbai, Maharashtra",
    latitude: 19.1197,
    longitude: 72.8464,
    price: 8500000,
    status: "FREE"
  },
  {
    title: "Retail Shop in Lajpat Nagar",
    description: "Prime retail space in Delhi's popular shopping district. High footfall area with excellent business potential.",
    type: "COMMERCIAL",
    location: "Delhi",
    address: "Lajpat Nagar, New Delhi",
    latitude: 28.5677,
    longitude: 77.2431,
    price: 22000000,
    status: "FREE"
  },
  {
    title: "Independent House in Indiranagar",
    description: "Charming independent house with vintage architecture and modern amenities. Located in Bangalore's most sought-after neighborhood.",
    type: "HOUSE",
    location: "Bangalore",
    address: "Indiranagar, Bangalore, Karnataka",
    latitude: 12.9789,
    longitude: 77.6412,
    price: 38000000,
    status: "FREE"
  },
  {
    title: "Residential Plot in Sarjapur",
    description: "Large residential plot with clear title and all approvals. Ideal for building your dream home in a peaceful location.",
    type: "PLOT",
    location: "Bangalore",
    address: "Sarjapur, Bangalore, Karnataka",
    latitude: 12.8342,
    longitude: 77.6882,
    price: 12000000,
    status: "FREE"
  },
  {
    title: "2-BHK Apartment in Powai",
    description: "Modern apartment with lake view, gym, and swimming pool. Perfect for families in Mumbai's beautiful Powai area.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Powai, Mumbai, Maharashtra",
    latitude: 19.1197,
    longitude: 72.9064,
    price: 32000000,
    status: "FREE"
  },
  {
    title: "Warehouse Space in Bhiwandi",
    description: "Large warehouse space with loading docks and ample parking. Ideal for storage and logistics businesses.",
    type: "COMMERCIAL",
    location: "Mumbai",
    address: "Bhiwandi, Mumbai, Maharashtra",
    latitude: 19.2969,
    longitude: 73.0625,
    price: 45000000,
    status: "FREE"
  },
  {
    title: "Farmhouse in Yelahanka",
    description: "Spacious farmhouse with agricultural land, perfect for weekend getaways or farming. Peaceful location away from city chaos.",
    type: "VILLA",
    location: "Bangalore",
    address: "Yelahanka, Bangalore, Karnataka",
    latitude: 13.1007,
    longitude: 77.5963,
    price: 28000000,
    status: "FREE"
  },
  {
    title: "1-BHK Apartment in Vashi",
    description: "Compact apartment in Navi Mumbai's planned city. Well-connected with excellent infrastructure and amenities.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Vashi, Navi Mumbai, Maharashtra",
    latitude: 19.0759,
    longitude: 72.9984,
    price: 15000000,
    status: "FREE"
  },
  {
    title: "Office Space in BKC",
    description: "Premium office space in Mumbai's business district. Fully furnished with modern amenities and excellent connectivity.",
    type: "COMMERCIAL",
    location: "Mumbai",
    address: "Bandra Kurla Complex, Mumbai, Maharashtra",
    latitude: 19.0596,
    longitude: 72.8295,
    price: 65000000,
    status: "FREE"
  },
  {
    title: "Independent House in Jayanagar",
    description: "Beautiful independent house with garden and parking. Located in Bangalore's most prestigious residential area.",
    type: "HOUSE",
    location: "Bangalore",
    address: "Jayanagar, Bangalore, Karnataka",
    latitude: 12.9279,
    longitude: 77.5877,
    price: 42000000,
    status: "FREE"
  },
  {
    title: "Residential Plot in Hebbal",
    description: "Premium residential plot with clear title and all approvals. Ready for construction with excellent connectivity.",
    type: "PLOT",
    location: "Bangalore",
    address: "Hebbal, Bangalore, Karnataka",
    latitude: 13.0507,
    longitude: 77.5934,
    price: 9500000,
    status: "FREE"
  },
  {
    title: "Luxury Apartment in Colaba",
    description: "Exclusive apartment in Mumbai's most prestigious area. Sea view, modern amenities, and world-class facilities.",
    type: "APARTMENT",
    location: "Mumbai",
    address: "Colaba, Mumbai, Maharashtra",
    latitude: 18.9217,
    longitude: 72.8347,
    price: 85000000,
    status: "FREE"
  }
];

async function addTestProperties() {
  try {
    console.log('Starting to add test properties...');
    
    // Get the first user (admin or any user) to assign as owner
    const firstUser = await prisma.user.findFirst();
    
    if (!firstUser) {
      console.error('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Using user ${firstUser.email} as property owner`);

    for (let i = 0; i < testProperties.length; i++) {
      const property = testProperties[i];
      
      console.log(`Adding property ${i + 1}: ${property.title}`);
      
      await prisma.property.create({
        data: {
          title: property.title,
          description: property.description,
          type: property.type,
          location: property.location,
          address: property.address,
          latitude: property.latitude,
          longitude: property.longitude,
          price: property.price,
          status: property.status,
          ownerId: firstUser.id,
          mediaUrls: [] // Empty array for test properties
        }
      });
      
      console.log(`✅ Property ${i + 1} added successfully`);
    }
    
    console.log('🎉 All 20 test properties have been added successfully!');
    
  } catch (error) {
    console.error('Error adding test properties:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addTestProperties();