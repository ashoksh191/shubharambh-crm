import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Shubharambh CRM database with default enterprise roles and accounts...');

  const saltRounds = 12;
  const defaultPassword = 'Password@123456';
  const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

  const initialUsers = [
    {
      email: 'superadmin@shubharambh.com',
      username: 'superadmin',
      fullName: 'Vikramaditya Singh (Super Admin)',
      phone: '+919876543210',
      role: Role.SUPER_ADMIN,
    },
    {
      email: 'admin@shubharambh.com',
      username: 'admin',
      fullName: 'Rajesh Sharma (System Admin)',
      phone: '+919876543211',
      role: Role.ADMIN,
    },
    {
      email: 'salesmanager@shubharambh.com',
      username: 'salesmanager',
      fullName: 'Ananya Verma (Sales Manager)',
      phone: '+919876543212',
      role: Role.SALES_MANAGER,
    },
    {
      email: 'salesexec@shubharambh.com',
      username: 'salesexec',
      fullName: 'Rahul Gupta (Sales Executive)',
      phone: '+919876543213',
      role: Role.SALES_EXECUTIVE,
    },
    {
      email: 'finance@shubharambh.com',
      username: 'finance',
      fullName: 'Priya Mehta (Finance Lead)',
      phone: '+919876543214',
      role: Role.FINANCE,
    },
    {
      email: 'associate@shubharambh.com',
      username: 'associate',
      fullName: 'Amit Kumar (Channel Associate)',
      phone: '+919876543215',
      role: Role.ASSOCIATE,
    },
    {
      email: 'support@shubharambh.com',
      username: 'support',
      fullName: 'Neha Joshi (Customer Support)',
      phone: '+919876543216',
      role: Role.CUSTOMER_SUPPORT,
    },
    {
      email: 'viewer@shubharambh.com',
      username: 'viewer',
      fullName: 'Suresh Patel (Site Guest)',
      phone: '+919876543217',
      role: Role.VIEWER,
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
    } else {
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
