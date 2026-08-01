import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Database Seed...');

  // 1. Create Default Master Project
  const project = await prisma.project.upsert({
    where: { code: 'SHUBHARAMBH_GREEN_CITY' },
    update: {},
    create: {
      name: 'Shubharambh Green City Township',
      code: 'SHUBHARAMBH_GREEN_CITY',
      description: '60-Bigha Master Planned Smart Township at Village Hasnapur, Amethi, Lucknow.',
      location: 'Village Hasnapur, Amethi, Lucknow',
      totalBigha: 60.0,
    },
  });
  console.log('✅ Master Project Seeded:', project.name);

  // 2. Create Default Master Layout
  const layout = await prisma.layout.upsert({
    where: { id: 'layout-hasnapur-master' },
    update: {},
    create: {
      id: 'layout-hasnapur-master',
      projectId: project.id,
      name: 'Master Architectural Layout Blueprint',
      svgBlueprintUrl: './assets/layout_plan_master.svg',
      viewBox: '0 0 2384 1684',
      widthPx: 2384,
      heightPx: 1684,
    },
  });

  // 3. Create Master Blocks A, B, C
  const blocksData = [
    { id: 'block-a', name: 'Block A', code: 'BLOCK_A' },
    { id: 'block-b', name: 'Block B', code: 'BLOCK_B' },
    { id: 'block-c', name: 'Block C', code: 'BLOCK_C' },
  ];

  const blocks: Record<string, any> = {};
  for (const b of blocksData) {
    const created = await prisma.block.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        layoutId: layout.id,
        name: b.name,
        code: b.code,
      },
    });
    blocks[b.name] = created;
  }

  // 4. Create System Roles & Superadmin User
  const passwordHash = await bcrypt.hash('Password@123456', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@shubharambh.com' },
    update: {},
    create: {
      id: 'sys-default-user',
      email: 'admin@shubharambh.com',
      username: 'superadmin',
      fullName: 'Ashok Kumar (CTO & Super Admin)',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });
  console.log('✅ System Admin User Seeded:', adminUser.email);

  // 5. Seed Permissions
  const permissionsData = [
    { code: 'PLOT_READ', description: 'View plot inventory' },
    { code: 'PLOT_WRITE', description: 'Create or update plot pricing and metadata' },
    { code: 'BOOKING_CREATE', description: 'Submit new plot booking application' },
    { code: 'BOOKING_APPROVE', description: 'Approve or reject pending bookings' },
    { code: 'FINANCE_VERIFY', description: 'Verify payment receipts and UTR reference numbers' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log('🎉 Enterprise Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
