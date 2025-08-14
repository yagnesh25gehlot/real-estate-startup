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
    const adminEmail = 'bussinessstatupwork@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Nikku@25';
    const adminName = 'Business Admin';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const saltRounds = process.env.NODE_ENV === 'production' ? 14 : 12;
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, saltRounds);
        const adminUser = await prisma.user.create({
            data: {
                email: adminEmail,
                name: adminName,
                role: 'ADMIN',
                mobile: '+91-9876543210',
                aadhaar: '123456789012',
                aadhaarImage: '/uploads/aadhaar/test-aadhaar.svg',
                password: hashedPassword,
            },
        });
        console.log('✅ Admin user created');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password: [Set via ADMIN_PASSWORD environment variable]');
        console.log('⚠️  Please change the password after first login!');
        console.log('💡 Set ADMIN_PASSWORD environment variable for custom password');
    }
    else {
        console.log('ℹ️  Admin user already exists');
    }
    if (process.env.NODE_ENV !== 'production') {
        const testEmail = 'user1@test.com';
        const testPassword = process.env.TEST_USER_PASSWORD || 'TestUserPass123!';
        const existingTestUser = await prisma.user.findUnique({
            where: { email: testEmail },
        });
        if (!existingTestUser) {
            const saltRounds = 12;
            const hashedPassword = await bcryptjs_1.default.hash(testPassword, saltRounds);
            await prisma.user.create({
                data: {
                    email: testEmail,
                    name: 'Test User',
                    role: 'USER',
                    mobile: '+91-1234567890',
                    aadhaar: '987654321098',
                    aadhaarImage: '/uploads/aadhaar/test-aadhaar.svg',
                    password: hashedPassword,
                },
            });
            console.log('✅ Test user created');
            console.log('📧 Email:', testEmail);
            console.log('🔑 Password: [Set via TEST_USER_PASSWORD environment variable]');
        }
        else {
            console.log('ℹ️  Test user already exists');
        }
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