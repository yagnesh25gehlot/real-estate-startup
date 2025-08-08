"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
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
    const adminEmail = 'admin@propertyplatform.com';
    const adminPassword = 'admin123456';
    const adminName = 'System Administrator';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 12);
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
        const fs = require('fs');
        const credentials = `Admin Credentials:
Email: ${adminEmail}
Password: ${adminPassword}
Created: ${new Date().toISOString()}

⚠️  IMPORTANT: Change the password after first login!
`;
        fs.writeFileSync('admin-credentials.txt', credentials);
        console.log('💾 Credentials saved to admin-credentials.txt');
    }
    else {
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
//# sourceMappingURL=seed.js.map