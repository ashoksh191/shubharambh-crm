import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listCustomersService = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        plots: true,
        bookings: true,
      },
    }),
    prisma.customer.count(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const createCustomerService = async (data: {
  fullName: string;
  phone: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  address?: string;
}) => {
  const existing = await prisma.customer.findUnique({ where: { phone: data.phone } });
  if (existing) {
    return prisma.customer.update({
      where: { phone: data.phone },
      data,
    });
  }

  return prisma.customer.create({ data });
};
