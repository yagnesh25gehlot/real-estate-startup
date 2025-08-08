import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default commission configuration
  const commissionConfigs = [
    { level: 1, percentage: 10.0 },
    { level: 2, percentage: 5.0 },
    { level: 3, percentage: 2.5 },
  ];

  for (const config of commissionConfigs) {
    await prisma.commissionConfig.upsert({
      where: { level: config.level },
      update: { percentage: config.percentage },
      create: config,
    });
  }

  console.log('✅ Commission configuration created');

  // Create admin user
  const adminEmail = 'admin@propertyplatform.com';
  const adminPassword = 'admin123456';
  const adminName = 'System Administrator';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');

    // Save credentials to file
    const fs = require('fs');
    const credentials = `Admin Credentials:
Email: ${adminEmail}
Password: ${adminPassword}
Created: ${new Date().toISOString()}

⚠️  IMPORTANT: Change the password after first login!
`;

    fs.writeFileSync('admin-credentials.txt', credentials);
    console.log('💾 Credentials saved to admin-credentials.txt');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 