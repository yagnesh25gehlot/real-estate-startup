const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProperties() {
  try {
    console.log('🔍 Checking properties in database...');
    
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        ownerId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${properties.length} properties:`);
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ID: ${prop.id}`);
      console.log(`   Title: ${prop.title}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Owner ID: ${prop.ownerId}`);
      console.log(`   Created: ${prop.createdAt}`);
      console.log('---');
    });

    // Check specific property ID from error
    const specificId = 'cee381d6-8439-4b38-9744-7f5cec6b57fe';
    console.log(`🔍 Checking specific property ID: ${specificId}`);
    
    const specificProperty = await prisma.property.findUnique({
      where: { id: specificId },
      include: { owner: true }
    });

    if (specificProperty) {
      console.log('✅ Property found!');
      console.log(`   Title: ${specificProperty.title}`);
      console.log(`   Status: ${specificProperty.status}`);
      console.log(`   Owner: ${specificProperty.owner?.email}`);
    } else {
      console.log('❌ Property not found!');
    }

  } catch (error) {
    console.error('Error checking properties:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProperties();
