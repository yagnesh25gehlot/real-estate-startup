const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPropertyOwnership() {
  try {
    console.log('🔍 Checking property ownership...');
    
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        ownerId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${properties.length} properties:`);
    properties.forEach((property, index) => {
      console.log(`${index + 1}. ID: ${property.id}`);
      console.log(`   Title: ${property.title}`);
      console.log(`   Owner ID: ${property.ownerId}`);
      console.log(`   Created: ${property.createdAt}`);
      console.log('---');
    });

    // Check specific property ID from the error
    const specificId = 'cee381d6-8439-4b38-9744-7f5cec6b57fe';
    console.log(`\n🔍 Checking specific property ID: ${specificId}`);
    
    const specificProperty = await prisma.property.findUnique({
      where: { id: specificId },
      include: { owner: true }
    });

    if (specificProperty) {
      console.log('✅ Property found!');
      console.log(`   Title: ${specificProperty.title}`);
      console.log(`   Owner ID: ${specificProperty.ownerId}`);
      console.log(`   Owner Email: ${specificProperty.owner?.email || 'No owner'}`);
      console.log(`   Owner Name: ${specificProperty.owner?.name || 'No owner'}`);
    } else {
      console.log('❌ Property not found!');
    }

  } catch (error) {
    console.error('Error checking property ownership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPropertyOwnership();
