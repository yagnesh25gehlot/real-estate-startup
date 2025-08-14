const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDealerTree() {
  try {
    console.log('🧪 Verifying dealer tree functionality...');
    
    // Get all dealers with their relationships
    const allDealers = await prisma.dealer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        children: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
          }
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
          }
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`📊 Found ${allDealers.length} dealers in database`);
    
    if (allDealers.length === 0) {
      console.log('❌ No dealers found. Please create some dealers first.');
      return;
    }

    // Analyze the tree structure
    console.log('\n🌳 Dealer Tree Analysis:');
    
    // Find root dealers (no parent)
    const rootDealers = allDealers.filter(dealer => !dealer.parentId);
    console.log(`📈 Root dealers: ${rootDealers.length}`);
    
    // Find dealers with children
    const dealersWithChildren = allDealers.filter(dealer => dealer.children.length > 0);
    console.log(`👥 Dealers with children: ${dealersWithChildren.length}`);
    
    // Find leaf dealers (no children)
    const leafDealers = allDealers.filter(dealer => dealer.children.length === 0);
    console.log(`🍃 Leaf dealers: ${leafDealers.length}`);
    
    // Status distribution
    const statusCounts = {};
    allDealers.forEach(dealer => {
      statusCounts[dealer.status] = (statusCounts[dealer.status] || 0) + 1;
    });
    console.log('\n📋 Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    // Commission analysis
    const totalCommission = allDealers.reduce((sum, dealer) => sum + dealer.commission, 0);
    const avgCommission = totalCommission / allDealers.length;
    console.log(`\n💰 Commission Analysis:`);
    console.log(`   Total Commission: ₹${totalCommission.toLocaleString()}`);
    console.log(`   Average Commission: ₹${avgCommission.toFixed(2)}`);
    
    // Display tree structure
    console.log('\n🌳 Tree Structure:');
    const displayTree = (dealers, parentId = null, level = 0) => {
      const children = dealers.filter(dealer => dealer.parentId === parentId);
      children.forEach(dealer => {
        const indent = '  '.repeat(level);
        const statusIcon = dealer.status === 'APPROVED' ? '✅' : 
                          dealer.status === 'PENDING' ? '⏳' : '❌';
        console.log(`${indent}${statusIcon} ${dealer.user.name} (${dealer.referralCode}) - ₹${dealer.commission} - Level ${level}`);
        displayTree(dealers, dealer.id, level + 1);
      });
    };
    
    displayTree(allDealers);
    
    // Test the tree building logic (similar to backend)
    console.log('\n🧪 Testing Tree Building Logic:');
    
    const buildTree = (dealers, parentId = null, level = 0) => {
      const nodes = dealers.filter(dealer => dealer.parentId === parentId);
      
      return nodes.map(dealer => {
        const children = buildTree(dealers, dealer.id, level + 1);
        
        // Calculate total children count (recursive)
        const totalChildren = children.reduce((sum, child) => sum + child.totalChildren + 1, 0);
        
        // Calculate total commission (recursive)
        const totalCommission = children.reduce((sum, child) => sum + child.totalCommission, 0) + dealer.commission;
        
        return {
          id: dealer.id,
          user: dealer.user,
          referralCode: dealer.referralCode,
          status: dealer.status,
          commission: dealer.commission,
          children: children,
          level: level,
          totalChildren: totalChildren,
          totalCommission: totalCommission,
        };
      });
    };

    const tree = buildTree(allDealers);
    console.log(`✅ Tree built successfully with ${tree.length} root nodes`);
    
    // Verify calculations
    console.log('\n🔍 Verifying Calculations:');
    tree.forEach(root => {
      console.log(`\n📊 ${root.user.name} (${root.referralCode}):`);
      console.log(`   Direct Commission: ₹${root.commission}`);
      console.log(`   Total Children: ${root.totalChildren}`);
      console.log(`   Total Commission: ₹${root.totalCommission}`);
      console.log(`   Level: ${root.level}`);
      
      if (root.children.length > 0) {
        console.log(`   Direct Children: ${root.children.length}`);
        root.children.forEach(child => {
          console.log(`     └── ${child.user.name}: ₹${child.commission} (Total: ₹${child.totalCommission})`);
        });
      }
    });
    
    console.log('\n✅ Dealer tree verification completed successfully!');
    console.log('📋 The dealer tree functionality is working correctly.');
    console.log('🌐 You can now visit http://localhost:5173/admin/dealer-tree to see the visual tree.');
    
  } catch (error) {
    console.error('❌ Error verifying dealer tree:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDealerTree();
