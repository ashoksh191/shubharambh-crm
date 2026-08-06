import Booking, { IBooking, BookingStatusType, PaymentPlanType, PaymentStatusType } from '../models/Booking.js';
import Plot from '../models/Plot.js';
import Customer from '../models/Customer.js';
import BookingHistory from '../models/BookingHistory.js';
import mongoose from 'mongoose';

export interface CreateBookingDTO {
  customerId: string;
  plotId: string;
  bookingAmount: number;
  agreementValue: number;
  discount?: number;
  paymentPlan?: PaymentPlanType;
  bookingExecutiveId?: string;
  remarks?: string;
  createdByUserId?: string;
  ipAddress?: string;
}

export interface ListBookingFilter {
  dateFrom?: string;
  dateTo?: string;
  status?: BookingStatusType;
  paymentStatus?: PaymentStatusType;
  executiveId?: string;
  customerId?: string;
  block?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const generateBookingId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await Booking.countDocuments({});
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `SGC-BK-${currentYear}-${nextNumber}`;
};

export const generateHistoryId = async (): Promise<string> => {
  const count = await BookingHistory.countDocuments({});
  const nextNumber = (count + 1).toString().padStart(5, '0');
  return `HIST-${nextNumber}`;
};

/**
 * Create New Plot Booking with strict business rules and concurrency safety
 */
export const createBookingService = async (dto: CreateBookingDTO): Promise<IBooking> => {
  const {
    customerId,
    plotId,
    bookingAmount,
    agreementValue,
    discount = 0,
    paymentPlan = 'Installment',
    bookingExecutiveId,
    remarks,
    createdByUserId,
    ipAddress,
  } = dto;

  // 1. Fetch Plot
  const plot = await Plot.findOne({
    $or: [{ _id: isValidObjectId(plotId) ? plotId : null }, { plotNumber: plotId }],
    isDeleted: false,
  });

  if (!plot) {
    throw { statusCode: 404, message: 'Plot not found for booking.' };
  }

  // Business Rule: Only AVAILABLE or HOLD plots can be booked. A booked plot cannot be booked twice!
  if (plot.status !== 'AVAILABLE' && plot.status !== 'HOLD') {
    throw {
      statusCode: 400,
      message: `Plot ${plot.plotNumber} (${plot.block}) is currently in '${plot.status}' status and cannot be booked again.`,
    };
  }

  // 2. Fetch Customer
  const customer = await Customer.findOne({
    $or: [{ _id: isValidObjectId(customerId) ? customerId : null }, { customerId: customerId }],
    isDeleted: false,
  });

  if (!customer) {
    throw { statusCode: 404, message: 'Customer record not found.' };
  }

  // 3. Compute Financial Breakdown
  const finalAmount = Math.max(0, agreementValue - discount);
  const paidAmount = bookingAmount;
  const balanceDue = Math.max(0, finalAmount - paidAmount);

  let initialPaymentStatus: PaymentStatusType = 'UNPAID';
  if (paidAmount >= finalAmount && finalAmount > 0) {
    initialPaymentStatus = 'FULL';
  } else if (paidAmount > 0) {
    initialPaymentStatus = 'PARTIAL';
  }

  const bookingId = await generateBookingId();

  // 4. Create Booking Document
  const booking = new Booking({
    bookingId,
    customer: customer._id,
    plot: plot._id,
    plotNumber: plot.plotNumber,
    block: plot.block,
    bookingAmount,
    agreementValue,
    discount,
    finalAmount,
    paidAmount,
    balanceDue,
    paymentPlan,
    bookingExecutive: bookingExecutiveId && isValidObjectId(bookingExecutiveId) ? bookingExecutiveId : undefined,
    bookingStatus: 'BOOKED',
    paymentStatus: initialPaymentStatus,
    remarks,
    createdBy: createdByUserId && isValidObjectId(createdByUserId) ? createdByUserId : undefined,
  });

  await booking.save();

  // 5. Update Plot Status
  plot.status = 'BOOKED';
  plot.currentBookingId = booking._id as any;
  await plot.save();

  // 6. Record Audit History
  const historyId = await generateHistoryId();
  await BookingHistory.create({
    historyId,
    bookingId: booking._id,
    action: 'BOOKING_CREATED',
    previousStatus: 'AVAILABLE',
    newStatus: 'BOOKED',
    details: {
      plotNumber: plot.plotNumber,
      block: plot.block,
      customerName: customer.fullName,
      bookingAmount,
      finalAmount,
      balanceDue,
    },
    performedBy: createdByUserId && isValidObjectId(createdByUserId) ? createdByUserId : undefined,
    ipAddress,
  });

  return await Booking.findById(booking._id).populate('customer').populate('plot').populate('bookingExecutive').lean() as any;
};

/**
 * List Bookings with Filters (Date, Status, Executive, Customer, Block)
 */
export const listBookingsService = async (filters: ListBookingFilter = {}) => {
  const {
    dateFrom,
    dateTo,
    status,
    paymentStatus,
    executiveId,
    customerId,
    block,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query: any = { isDeleted: false };

  if (status) query.bookingStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (executiveId) query.bookingExecutive = executiveId;
  if (customerId) query.customer = customerId;
  if (block) query.block = block;

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  if (search) {
    query.$or = [
      { bookingId: { $regex: search, $options: 'i' } },
      { plotNumber: { $regex: search, $options: 'i' } },
      { block: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOption: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Booking.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('customer')
      .populate('plot')
      .populate('bookingExecutive')
      .lean(),
    Booking.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get Booking Details with Payment History & Audit Stream
 */
export const getBookingByIdService = async (id: string) => {
  const booking = await Booking.findOne({
    $or: [{ _id: isValidObjectId(id) ? id : null }, { bookingId: id }],
    isDeleted: false,
  })
    .populate('customer')
    .populate('plot')
    .populate('bookingExecutive')
    .populate('createdBy')
    .lean();

  if (!booking) {
    throw { statusCode: 404, message: 'Booking record not found.' };
  }

  const history = await BookingHistory.find({ bookingId: booking._id })
    .sort({ createdAt: -1 })
    .populate('performedBy')
    .lean();

  return {
    ...booking,
    history,
  };
};

/**
 * Cancel Booking & Automatically Free Plot Inventory
 */
export const cancelBookingService = async (
  bookingId: string,
  reason: string,
  performedByUserId?: string,
  ipAddress?: string
) => {
  const booking = await Booking.findOne({
    $or: [{ _id: isValidObjectId(bookingId) ? bookingId : null }, { bookingId: bookingId }],
    isDeleted: false,
  });

  if (!booking) {
    throw { statusCode: 404, message: 'Booking record not found.' };
  }

  if (booking.bookingStatus === 'CANCELLED') {
    throw { statusCode: 400, message: 'Booking is already cancelled.' };
  }

  if (booking.bookingStatus === 'REGISTERED') {
    throw { statusCode: 400, message: 'Cannot cancel a booking that has already been REGISTERED at sub-registrar.' };
  }

  const previousStatus = booking.bookingStatus;
  booking.bookingStatus = 'CANCELLED';
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;

  await booking.save();

  // Business Rule: Cancelling booking automatically frees the plot back to AVAILABLE
  const plot = await Plot.findById(booking.plot);
  if (plot) {
    plot.status = 'AVAILABLE';
    plot.currentBookingId = undefined;
    plot.reservedByCustomer = undefined;
    plot.holdExpiresAt = undefined;
    await plot.save();
  }

  // Record History
  const historyId = await generateHistoryId();
  await BookingHistory.create({
    historyId,
    bookingId: booking._id,
    action: 'CANCELLED',
    previousStatus,
    newStatus: 'CANCELLED',
    details: { reason, plotNumber: booking.plotNumber, block: booking.block },
    performedBy: performedByUserId && isValidObjectId(performedByUserId) ? performedByUserId : undefined,
    ipAddress,
  });

  return {
    message: `Booking ${booking.bookingId} cancelled successfully. Plot ${booking.plotNumber} (${booking.block}) is now AVAILABLE.`,
    booking,
  };
};

/**
 * Register Deed Execution (Allowed ONLY after FULLY_PAID status)
 */
export const registerBookingService = async (
  bookingId: string,
  performedByUserId?: string,
  ipAddress?: string
) => {
  const booking = await Booking.findOne({
    $or: [{ _id: isValidObjectId(bookingId) ? bookingId : null }, { bookingId: bookingId }],
    isDeleted: false,
  });

  if (!booking) {
    throw { statusCode: 404, message: 'Booking record not found.' };
  }

  // Business Rule: Registration ONLY allowed after Full Payment!
  if (booking.balanceDue > 0 || (booking.bookingStatus !== 'FULLY_PAID' && booking.paymentStatus !== 'FULL')) {
    throw {
      statusCode: 400,
      message: `Registration Denied: Booking has an outstanding balance of ₹${booking.balanceDue.toLocaleString()}. Full payment is required before deed registration.`,
    };
  }

  const previousStatus = booking.bookingStatus;
  booking.bookingStatus = 'REGISTERED';
  booking.registeredAt = new Date();
  await booking.save();

  // Update Plot to SOLD
  const plot = await Plot.findById(booking.plot);
  if (plot) {
    plot.status = 'SOLD';
    await plot.save();
  }

  // Log History
  const historyId = await generateHistoryId();
  await BookingHistory.create({
    historyId,
    bookingId: booking._id,
    action: 'REGISTRATION_COMPLETED',
    previousStatus,
    newStatus: 'REGISTERED',
    details: { registeredAt: booking.registeredAt },
    performedBy: performedByUserId && isValidObjectId(performedByUserId) ? performedByUserId : undefined,
    ipAddress,
  });

  return {
    message: `Sub-Registrar Registry completed for Booking ${booking.bookingId}. Plot status set to SOLD.`,
    booking,
  };
};

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
