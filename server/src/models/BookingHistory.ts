import mongoose, { Schema, Document } from 'mongoose';

export type BookingActionType =
  | 'BOOKING_CREATED'
  | 'STATUS_CHANGED'
  | 'PAYMENT_ADDED'
  | 'PAYMENT_VERIFIED'
  | 'PLOT_CHANGED'
  | 'HOLD_RESERVED'
  | 'HOLD_RELEASED'
  | 'CANCELLED'
  | 'REGISTRATION_COMPLETED';

export interface IBookingHistory extends Document {
  historyId: string;
  bookingId: Schema.Types.ObjectId;
  action: BookingActionType;
  previousStatus?: string;
  newStatus?: string;
  details?: any;
  performedBy?: Schema.Types.ObjectId;
  ipAddress?: string;
  createdAt: Date;
}

const BookingHistorySchema = new Schema<IBookingHistory>(
  {
    historyId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'BOOKING_CREATED',
        'STATUS_CHANGED',
        'PAYMENT_ADDED',
        'PAYMENT_VERIFIED',
        'PLOT_CHANGED',
        'HOLD_RESERVED',
        'HOLD_RELEASED',
        'CANCELLED',
        'REGISTRATION_COMPLETED',
      ],
      required: true,
      index: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

BookingHistorySchema.index({ bookingId: 1, createdAt: -1 });

export const BookingHistory =
  mongoose.models.BookingHistory || mongoose.model<IBookingHistory>('BookingHistory', BookingHistorySchema);
export default BookingHistory;
