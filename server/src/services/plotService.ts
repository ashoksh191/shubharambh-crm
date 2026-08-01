import { prisma } from '../config/database.js';
import { redisCache } from '../config/redis.js';

/**
 * Lists all plots with optional status, block, or query filtering (Redis Cached).
 */
export const listPlotsService = async (filters?: { status?: string; block?: string; search?: string }) => {
  const cacheKey = `plots:list:${filters?.status || 'all'}:${filters?.block || 'all'}:${filters?.search || 'none'}`;

  // Check Redis cache
  const cachedData = await redisCache.get(cacheKey);
  if (cachedData) {
    try {
      return JSON.parse(cachedData);
    } catch (_err) {
      // Ignore JSON parse error and re-fetch from database
    }
  }

  const where: any = {};

  if (filters?.status) {
    where.status = filters.status.toUpperCase();
  }

  if (filters?.block) {
    where.block = {
      name: { contains: filters.block },
    };
  }

  if (filters?.search) {
    where.OR = [
      { plotNumber: { contains: filters.search } },
      { geometryId: { contains: filters.search } },
    ];
  }

  const plots = await prisma.plot.findMany({
    where,
    orderBy: { plotNumber: 'asc' },
    include: {
      block: true,
      customer: {
        select: { id: true, fullName: true, phone: true },
      },
      booking: {
        select: { id: true, bookingNumber: true, bookingStatus: true, bookingAmount: true },
      },
    },
  });

  const result = plots.map((p) => ({
    id: p.id,
    geometryId: p.geometryId,
    plotNumber: p.plotNumber,
    block: p.block.name,
    status: p.status.toLowerCase(),
    price: p.price,
    areaSqFt: p.areaSqFt,
    facing: p.facing,
    version: p.version,
    customerName: p.customer?.fullName || null,
    bookingNumber: p.booking?.bookingNumber || null,
  }));

  // Store in Redis cache for 300s TTL
  await redisCache.set(cacheKey, JSON.stringify(result), 300);

  return result;
};

/**
 * Gets plot details by ID or Geometry ID.
 */
export const getPlotByIdService = async (idOrGeometryId: string) => {
  const cacheKey = `plot:detail:${idOrGeometryId}`;
  const cached = await redisCache.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (_e) {
      // Ignore
    }
  }

  const plot = await prisma.plot.findFirst({
    where: {
      OR: [{ id: idOrGeometryId }, { geometryId: idOrGeometryId }],
    },
    include: {
      block: true,
      layout: true,
      project: true,
      customer: true,
      booking: {
        include: {
          payments: true,
          documents: true,
        },
      },
    },
  });

  if (!plot) {
    throw {
      statusCode: 404,
      name: 'NOT_FOUND',
      message: `Plot '${idOrGeometryId}' not found.`,
    };
  }

  await redisCache.set(cacheKey, JSON.stringify(plot), 300);
  return plot;
};

/**
 * Updates plot details or pricing and invalidates plot cache.
 */
export const updatePlotService = async (id: string, updateData: { price?: number; status?: string; facing?: string }) => {
  const plot = await prisma.plot.findUnique({ where: { id } });
  if (!plot) {
    throw {
      statusCode: 404,
      name: 'NOT_FOUND',
      message: `Plot '${id}' not found.`,
    };
  }

  const data: any = {};
  if (updateData.price !== undefined) data.price = updateData.price;
  if (updateData.facing !== undefined) data.facing = updateData.facing;
  if (updateData.status !== undefined) data.status = updateData.status.toUpperCase();
  data.version = { increment: 1 };

  const updatedPlot = await prisma.plot.update({
    where: { id },
    data,
  });

  // Invalidate plot caches
  await redisCache.invalidatePattern('plots:*');
  await redisCache.invalidatePattern(`plot:detail:${id}`);

  return updatedPlot;
};
