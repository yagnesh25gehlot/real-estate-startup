const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDealerTree() {
  try {
    console.log('🧪 Creating dealer tree structure for testing...');
    
    // Create multiple users for dealers with unique emails
    console.log('\n📝 Creating users for dealers...');
    
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const timestamp = Date.now();
      const user = await prisma.user.create({
        data: {
          email: `dealer${i}_${timestamp}@test.com`,
          name: `Dealer ${i}`,
          password: 'hashedpassword123',
          role: 'DEALER',
          status: 'ACTIVE'
        }
      });
      users.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }
    
    console.log(`✅ Created ${users.length} users`);
    
    // Create root level dealers (no parent)
    console.log('\n📝 Creating root level dealers...');
    
    const rootDealer1 = await prisma.dealer.create({
      data: {
        userId: users[0].id,
        referralCode: `ROOT001_${Date.now()}`,
        status: 'APPROVED',
        commission: 5000,
      }
    });
    
    const rootDealer2 = await prisma.dealer.create({
      data: {
        userId: users[1].id,
        referralCode: `ROOT002_${Date.now()}`,
        status: 'APPROVED',
        commission: 3000,
      }
    });
    
    console.log('✅ Root dealers created');
    
    // Create second level dealers (children of root dealers)
    console.log('\n📝 Creating second level dealers...');
    
    const childDealer1 = await prisma.dealer.create({
      data: {
        userId: users[2].id,
        parentId: rootDealer1.id,
        referralCode: `CHILD001_${Date.now()}`,
        status: 'APPROVED',
        commission: 2000,
      }
    });
    
    const childDealer2 = await prisma.dealer.create({
      data: {
        userId: users[3].id,
        parentId: rootDealer1.id,
        referralCode: `CHILD002_${Date.now()}`,
        status: 'PENDING',
        commission: 1500,
      }
    });
    
    const childDealer3 = await prisma.dealer.create({
      data: {
        userId: users[4].id,
        parentId: rootDealer2.id,
        referralCode: `CHILD003_${Date.now()}`,
        status: 'APPROVED',
        commission: 2500,
      }
    });
    
    console.log('✅ Second level dealers created');
    
    // Create third level dealers (grandchildren)
    console.log('\n📝 Creating third level dealers...');
    
    const grandchildDealer1 = await prisma.dealer.create({
      data: {
        userId: users[5].id,
        parentId: childDealer1.id,
        referralCode: `GRAND001_${Date.now()}`,
        status: 'APPROVED',
        commission: 1000,
      }
    });
    
    const grandchildDealer2 = await prisma.dealer.create({
      data: {
        userId: users[6].id,
        parentId: childDealer1.id,
        referralCode: `GRAND002_${Date.now()}`,
        status: 'REJECTED',
        commission: 800,
      }
    });
    
    const grandchildDealer3 = await prisma.dealer.create({
      data: {
        userId: users[7].id,
        parentId: childDealer3.id,
        referralCode: `GRAND003_${Date.now()}`,
        status: 'APPROVED',
        commission: 1200,
      }
    });
    
    console.log('✅ Third level dealers created');
    
    // Create fourth level dealer (great-grandchild)
    console.log('\n📝 Creating fourth level dealer...');
    
    const greatGrandchildDealer = await prisma.dealer.create({
      data: {
        userId: users[8].id,
        parentId: grandchildDealer1.id,
        referralCode: `GREAT001_${Date.now()}`,
        status: 'PENDING',
        commission: 500,
      }
    });
    
    console.log('✅ Fourth level dealer created');
    
    // Display the tree structure
    console.log('\n🌳 Dealer Tree Structure Created:');
    console.log('└── ROOT001 (Level 0) - ₹5000');
    console.log('    ├── CHILD001 (Level 1) - ₹2000');
    console.log('    │   ├── GRAND001 (Level 2) - ₹1000');
    console.log('    │   │   └── GREAT001 (Level 3) - ₹500');
    console.log('    │   └── GRAND002 (Level 2) - ₹800 (REJECTED)');
    console.log('    └── CHILD002 (Level 1) - ₹1500 (PENDING)');
    console.log('└── ROOT002 (Level 0) - ₹3000');
    console.log('    └── CHILD003 (Level 1) - ₹2500');
    console.log('        └── GRAND003 (Level 2) - ₹1200');
    
    console.log('\n🎉 Dealer tree structure created successfully!');
    console.log('📋 Now visit http://localhost:5173/admin/dealer-tree to test the functionality');
    
  } catch (error) {
    console.error('❌ Error creating dealer tree:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDealerTree();
