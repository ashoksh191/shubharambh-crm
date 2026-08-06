import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatusType =
  | 'HOLD'
  | 'BOOKED'
  | 'PAYMENT_PENDING'
  | 'PARTIAL_PAID'
  | 'FULLY_PAID'
  | 'REGISTRATION_PENDING'
  | 'REGISTERED'
  | 'CANCELLED';

export type PaymentPlanType = 'Cash' | 'EMI' | 'Installment';
export type PaymentStatusType = 'UNPAID' | 'PARTIAL' | 'FULL';

export interface IBooking extends Document {
  bookingId: string;
  customer: Schema.Types.ObjectId;
  plot: Schema.Types.ObjectId;
  plotNumber: string;
  block: string;
  bookingAmount: number;
  agreementValue: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentPlan: PaymentPlanType;
  bookingExecutive?: Schema.Types.ObjectId;
  bookingStatus: BookingStatusType;
  paymentStatus: PaymentStatusType;
  remarks?: string;
  createdBy?: Schema.Types.ObjectId;
  cancelledAt?: Date;
  cancellationReason?: string;
  registeredAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    plot: {
      type: Schema.Types.ObjectId,
      ref: 'Plot',
      required: [true, 'Plot ID is required'],
      index: true,
    },
    plotNumber: {
      type: String,
      required: true,
      index: true,
    },
    block: {
      type: String,
      required: true,
      index: true,
    },
    bookingAmount: {
      type: Number,
      required: [true, 'Booking token amount is required'],
      min: [1000, 'Minimum booking token amount is ₹1,000'],
    },
    agreementValue: {
      type: Number,
      required: [true, 'Agreement value is required'],
    },
    discount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    paymentPlan: {
      type: String,
      enum: ['Cash', 'EMI', 'Installment'],
      default: 'Installment',
    },
    bookingExecutive: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    bookingStatus: {
      type: String,
      enum: [
        'HOLD',
        'BOOKED',
        'PAYMENT_PENDING',
        'PARTIAL_PAID',
        'FULLY_PAID',
        'REGISTRATION_PENDING',
        'REGISTERED',
        'CANCELLED',
      ],
      default: 'BOOKED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'FULL'],
      default: 'UNPAID',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    registeredAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
