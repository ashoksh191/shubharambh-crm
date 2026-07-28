"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Shubharambh CRM database with default enterprise roles and accounts...');
    const saltRounds = 12;
    const defaultPassword = 'Password@123456';
    const passwordHash = await bcrypt_1.default.hash(defaultPassword, saltRounds);
    const initialUsers = [
        {
            email: 'superadmin@shubharambh.com',
            username: 'superadmin',
            fullName: 'Vikramaditya Singh (Super Admin)',
            phone: '+919876543210',
            role: client_1.Role.SUPER_ADMIN,
        },
        {
            email: 'admin@shubharambh.com',
            username: 'admin',
            fullName: 'Rajesh Sharma (System Admin)',
            phone: '+919876543211',
            role: client_1.Role.ADMIN,
        },
        {
            email: 'salesmanager@shubharambh.com',
            username: 'salesmanager',
            fullName: 'Ananya Verma (Sales Manager)',
            phone: '+919876543212',
            role: client_1.Role.SALES_MANAGER,
        },
        {
            email: 'salesexec@shubharambh.com',
            username: 'salesexec',
            fullName: 'Rahul Gupta (Sales Executive)',
            phone: '+919876543213',
            role: client_1.Role.SALES_EXECUTIVE,
        },
        {
            email: 'finance@shubharambh.com',
            username: 'finance',
            fullName: 'Priya Mehta (Finance Lead)',
            phone: '+919876543214',
            role: client_1.Role.FINANCE,
        },
        {
            email: 'associate@shubharambh.com',
            username: 'associate',
            fullName: 'Amit Kumar (Channel Associate)',
            phone: '+919876543215',
            role: client_1.Role.ASSOCIATE,
        },
        {
            email: 'support@shubharambh.com',
            username: 'support',
            fullName: 'Neha Joshi (Customer Support)',
            phone: '+919876543216',
            role: client_1.Role.CUSTOMER_SUPPORT,
        },
        {
            email: 'viewer@shubharambh.com',
            username: 'viewer',
            fullName: 'Suresh Patel (Site Guest)',
            phone: '+919876543217',
            role: client_1.Role.VIEWER,
        },
    ];
    for (const userData of initialUsers) {
        const existing = await prisma.user.findFirst({
            where: {
                OR: [{ email: userData.email }, { username: userData.username }],
            },
        });
        if (!existing) {
            const user = await prisma.user.create({
                data: {
                    ...userData,
                    passwordHash,
                    emailVerified: true,
                    status: 'ACTIVE',
                },
            });
            console.log(`✅ Created User: ${user.username} [${user.role}]`);
        }
        else {
            console.log(`ℹ️ User ${userData.username} already exists, skipping...`);
        }
    }
    console.log('✨ Seeding complete! All default accounts use password: Password@123456');
}
main()
    .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
