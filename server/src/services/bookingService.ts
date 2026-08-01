import { prisma } from '../config/database.js';
import { redisCache } from '../config/redis.js';

export interface CreateBookingDto {
  plotId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAadhaar?: string;
  customerPan?: string;
  customerAddress?: string;
  bookingAmount: number;
  paymentMode: string;
  utrNumber: string;
  createdById: string;
  expectedVersion?: number;
}

/**
 * Creates a new booking with Server-Authoritative Optimistic Concurrency Control (OCC).
 * Uses Prisma $transaction to perform atomic commit and status check.
 * Throws HTTP 409 Conflict error if plot is not AVAILABLE or version mismatch occurs.
 */
export const createBookingService = async (dto: CreateBookingDto) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Plot record within transaction boundary
    const plot = await tx.plot.findUnique({
      where: { id: dto.plotId },
    });

    if (!plot) {
      throw {
        statusCode: 44,
        name: 'NOT_FOUND',
        message: `Plot with ID '${dto.plotId}' does not exist in database.`,
      };
    }

    // 2. OCC Check 1: Verify Plot Availability
    if (plot.status !== 'AVAILABLE') {
      throw {
        statusCode: 409,
        name: 'CONFLICT',
        message: `Conflict: Plot '${plot.plotNumber}' is currently ${plot.status}. It has already been reserved or booked by another user transaction.`,
      };
    }

    // 3. OCC Check 2: Verify Expected Version if provided
    if (dto.expectedVersion !== undefined && plot.version !== dto.expectedVersion) {
      throw {
        statusCode: 409,
        name: 'CONFLICT',
        message: `Conflict: Plot '${plot.plotNumber}' was modified by a concurrent transaction (Version mismatch: server v${plot.version} vs expected v${dto.expectedVersion}).`,
      };
    }

    // 4. Create or Upsert Customer KYC record
    let customer = await tx.customer.findUnique({
      where: { phone: dto.customerPhone },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          fullName: dto.customerName,
          phone: dto.customerPhone,
          email: dto.customerEmail,
          aadhaar: dto.customerAadhaar,
          pan: dto.customerPan,
          address: dto.customerAddress,
        },
      });
    }

    const bookingNumber = `BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceDue = plot.price - dto.bookingAmount;

    // 5. Create Booking record inside transaction
    const booking = await tx.booking.create({
      data: {
        bookingNumber,
        plotId: plot.id,
        customerId: customer.id,
        bookingStatus: 'PENDING',
        bookingAmount: dto.bookingAmount,
        totalAmount: plot.price,
        balanceDue: balanceDue > 0 ? balanceDue : 0,
        paymentStatus: 'UNPAID',
        createdById: dto.createdById,
        version: 1,
      },
    });

    // 6. Create Initial Payment record with UTR transaction reference
    const payment = await tx.payment.create({
      data: {
        bookingId: booking.id,
        txnReference: dto.utrNumber,
        amount: dto.bookingAmount,
        paymentMode: dto.paymentMode,
        verificationStatus: 'PENDING',
      },
    });

    // 7. Atomic Plot Status Update & Version Increment
    const updatedPlot = await tx.plot.update({
      where: { id: plot.id },
      data: {
        status: 'BOOKED',
        bookingId: booking.id,
        customerId: customer.id,
        version: { increment: 1 }, // Optimistic Concurrency Control Version Counter Increment
      },
    });

    // 8. Record Immutable Audit Trail Entry
    await tx.auditLog.create({
      data: {
        userId: dto.createdById,
        username: dto.customerName,
        role: 'SALES_ASSOCIATE',
        action: 'BOOKING_CREATE',
        targetEntity: 'Booking',
        targetId: booking.id,
        metadata: JSON.stringify({
          bookingNumber,
          plotNumber: plot.plotNumber,
          amount: dto.bookingAmount,
          utrNumber: dto.utrNumber,
          newPlotVersion: updatedPlot.version,
        }),
        ipAddress: '127.0.0.1',
        userAgent: 'Enterprise Backend Engine',
      },
    });

    const result = {
      bookingId: booking.bookingNumber,
      dbId: booking.id,
      plotNumber: plot.plotNumber,
      customerName: customer.fullName,
      bookingAmount: booking.bookingAmount,
      balanceDue: booking.balanceDue,
      status: booking.bookingStatus,
      plotVersion: updatedPlot.version,
      paymentId: payment.id,
      createdAt: booking.createdAt,
    };

    // Invalidate Redis plot cache so map updates instantly across all connected clients
    await redisCache.invalidatePattern('plots:*');
    await redisCache.invalidatePattern(`plot:detail:${plot.id}`);

    return result;
  });
};

/**
 * Fetches booking details by ID.
 */
export const getBookingService = async (bookingId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: {
      plot: true,
      customer: true,
      payments: true,
      documents: true,
      createdBy: {
        select: { id: true, fullName: true, email: true, role: true },
      },
    },
  });

  if (!booking) {
    throw {
      statusCode: 404,
      name: 'NOT_FOUND',
      message: `Booking '${bookingId}' not found.`,
    };
  }

  return booking;
};

/**
 * Lists bookings with pagination.
 */
export const listBookingsService = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.booking.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        plot: true,
        customer: true,
        payments: true,
      },
    }),
    prisma.booking.count(),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};
