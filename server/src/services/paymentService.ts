import Payment, { IPayment, PaymentModeType } from '../models/Payment.js';
import Booking from '../models/Booking.js';
import BookingHistory from '../models/BookingHistory.js';
import mongoose from 'mongoose';

export interface CreatePaymentDTO {
  bookingId: string;
  amount: number;
  mode: PaymentModeType;
  transactionId?: string;
  paymentDate?: string;
  receiptUrl?: string;
  remarks?: string;
  performedByUserId?: string;
  ipAddress?: string;
}

export const generatePaymentId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const count = await Payment.countDocuments({});
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `PAY-${currentYear}-${nextNumber}`;
};

export const generateHistoryId = async (): Promise<string> => {
  const count = await BookingHistory.countDocuments({});
  const nextNumber = (count + 1).toString().padStart(5, '0');
  return `HIST-${nextNumber}`;
};

/**
 * Add Payment against a Booking with Financial Rules
 */
export const addPaymentService = async (dto: CreatePaymentDTO): Promise<IPayment> => {
  const {
    bookingId,
    amount,
    mode,
    transactionId,
    paymentDate,
    receiptUrl,
    remarks,
    performedByUserId,
    ipAddress,
  } = dto;

  const booking = await Booking.findOne({
    $or: [{ _id: isValidObjectId(bookingId) ? bookingId : null }, { bookingId: bookingId }],
    isDeleted: false,
  });

  if (!booking) {
    throw { statusCode: 404, message: 'Booking record not found.' };
  }

  if (booking.bookingStatus === 'CANCELLED') {
    throw { statusCode: 400, message: 'Cannot add payment for a CANCELLED booking.' };
  }

  // Business Rule: Payment cannot exceed remaining balance due!
  if (amount > booking.balanceDue) {
    throw {
      statusCode: 400,
      message: `Payment amount ₹${amount.toLocaleString()} exceeds the remaining balance due of ₹${booking.balanceDue.toLocaleString()}.`,
    };
  }

  const paymentId = await generatePaymentId();

  const payment = new Payment({
    paymentId,
    bookingId: booking._id,
    amount,
    mode,
    transactionId,
    paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
    receiptUrl,
    remarks,
    verified: false,
  });

  await payment.save();

  // Recalculate Booking Financial Ledger
  booking.paidAmount += amount;
  booking.balanceDue = Math.max(0, booking.finalAmount - booking.paidAmount);

  if (booking.balanceDue === 0) {
    booking.paymentStatus = 'FULL';
    booking.bookingStatus = 'FULLY_PAID';
  } else {
    booking.paymentStatus = 'PARTIAL';
    booking.bookingStatus = 'PARTIAL_PAID';
  }

  await booking.save();

  // Log History
  const historyId = await generateHistoryId();
  await BookingHistory.create({
    historyId,
    bookingId: booking._id,
    action: 'PAYMENT_ADDED',
    newStatus: booking.bookingStatus,
    details: {
      paymentId,
      amount,
      mode,
      transactionId,
      newBalanceDue: booking.balanceDue,
    },
    performedBy: performedByUserId && isValidObjectId(performedByUserId) ? performedByUserId : undefined,
    ipAddress,
  });

  return payment;
};

/**
 * Verify / Approve Payment by Accountant or Admin
 */
export const verifyPaymentService = async (
  paymentId: string,
  approved: boolean,
  verifiedByUserId: string,
  remarks?: string,
  ipAddress?: string
) => {
  const payment = await Payment.findOne({
    $or: [{ _id: isValidObjectId(paymentId) ? paymentId : null }, { paymentId: paymentId }],
    isDeleted: false,
  });

  if (!payment) {
    throw { statusCode: 404, message: 'Payment record not found.' };
  }

  payment.verified = approved;
  payment.verifiedBy = verifiedByUserId as any;
  payment.verifiedAt = new Date();
  if (remarks) payment.remarks = remarks;

  await payment.save();

  // Log History
  const historyId = await generateHistoryId();
  await BookingHistory.create({
    historyId,
    bookingId: payment.bookingId,
    action: 'PAYMENT_VERIFIED',
    details: {
      paymentId: payment.paymentId,
      amount: payment.amount,
      approved,
      remarks,
    },
    performedBy: verifiedByUserId && isValidObjectId(verifiedByUserId) ? verifiedByUserId : undefined,
    ipAddress,
  });

  return {
    message: `Payment ${payment.paymentId} verification status set to ${approved ? 'VERIFIED' : 'REJECTED'}.`,
    payment,
  };
};

export const getPaymentsByBookingIdService = async (bookingId: string) => {
  const booking = await Booking.findOne({
    $or: [{ _id: isValidObjectId(bookingId) ? bookingId : null }, { bookingId: bookingId }],
    isDeleted: false,
  });

  if (!booking) {
    throw { statusCode: 404, message: 'Booking record not found.' };
  }

  const payments = await Payment.find({ bookingId: booking._id, isDeleted: false })
    .sort({ paymentDate: -1 })
    .populate('verifiedBy')
    .lean();

  return payments;
};

export const deletePaymentService = async (paymentId: string, performedByUserId?: string) => {
  const payment = await Payment.findOne({
    $or: [{ _id: isValidObjectId(paymentId) ? paymentId : null }, { paymentId: paymentId }],
    isDeleted: false,
  });

  if (!payment) {
    throw { statusCode: 404, message: 'Payment record not found.' };
  }

  payment.isDeleted = true;
  await payment.save();

  // Re-adjust Booking Balance
  const booking = await Booking.findById(payment.bookingId);
  if (booking) {
    booking.paidAmount = Math.max(0, booking.paidAmount - payment.amount);
    booking.balanceDue = Math.max(0, booking.finalAmount - booking.paidAmount);

    if (booking.paidAmount === 0) {
      booking.paymentStatus = 'UNPAID';
      booking.bookingStatus = 'BOOKED';
    } else if (booking.balanceDue === 0) {
      booking.paymentStatus = 'FULL';
      booking.bookingStatus = 'FULLY_PAID';
    } else {
      booking.paymentStatus = 'PARTIAL';
      booking.bookingStatus = 'PARTIAL_PAID';
    }

    await booking.save();
  }

  return { message: 'Payment deleted successfully & booking financial ledger adjusted.' };
};

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
