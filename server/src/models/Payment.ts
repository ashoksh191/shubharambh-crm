import mongoose, { Schema, Document } from 'mongoose';

export type PaymentModeType = 'UPI' | 'Cash' | 'Cheque' | 'Bank Transfer';

export interface IPayment extends Document {
  paymentId: string;
  bookingId: Schema.Types.ObjectId;
  amount: number;
  mode: PaymentModeType;
  transactionId?: string;
  paymentDate: Date;
  verified: boolean;
  verifiedBy?: Schema.Types.ObjectId;
  verifiedAt?: Date;
  receiptUrl?: string;
  remarks?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    mode: {
      type: String,
      enum: ['UPI', 'Cash', 'Cheque', 'Bank Transfer'],
      required: [true, 'Payment mode is required'],
    },
    transactionId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
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

PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
