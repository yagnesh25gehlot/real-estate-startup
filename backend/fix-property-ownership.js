const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPropertyOwnership() {
  try {
    console.log('🔍 Fixing property ownership...');
    
    // Get the current admin user
    const adminUser = await prisma.user.findFirst({
      where: { 
        email: 'yagneshgehlot2000@gmail.com',
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', adminUser.email, 'ID:', adminUser.id);

    // Get all properties with the old owner ID
    const properties = await prisma.property.findMany({
      where: {
        ownerId: 'f02c0334-ba98-46ed-9da6-e6a33b9f699c'
      },
      select: {
        id: true,
        title: true,
        ownerId: true
      }
    });

    console.log(`📊 Found ${properties.length} properties with old owner ID`);

    if (properties.length === 0) {
      console.log('✅ No properties need ownership fix');
      return;
    }

    // Update each property's ownerId
    for (const property of properties) {
      console.log(`🔄 Updating property: ${property.title} (${property.id})`);
      console.log(`   Old ownerId: ${property.ownerId}`);
      console.log(`   New ownerId: ${adminUser.id}`);

      await prisma.property.update({
        where: { id: property.id },
        data: { ownerId: adminUser.id }
      });

      console.log(`✅ Updated property: ${property.title}`);
    }

    console.log(`🎉 Successfully updated ${properties.length} properties`);

    // Verify the fix
    const updatedProperties = await prisma.property.findMany({
      where: {
        ownerId: adminUser.id
      },
      select: {
        id: true,
        title: true,
        ownerId: true
      }
    });

    console.log(`\n📊 Verification: Found ${updatedProperties.length} properties owned by admin user`);
    updatedProperties.forEach(prop => {
      console.log(`   - ${prop.title} (${prop.id})`);
    });

  } catch (error) {
    console.error('❌ Error fixing property ownership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPropertyOwnership();
