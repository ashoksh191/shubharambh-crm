import mongoose, { Schema, Document } from 'mongoose';

export type PlotStatusType = 'AVAILABLE' | 'HOLD' | 'BOOKED' | 'RESERVED' | 'SOLD';
export type PlotBlockType = 'Block A' | 'Block B' | 'Block C';
export type PlotFacingType = 'North' | 'South' | 'East' | 'West' | 'Corner' | 'North-East' | 'South-East';
export type PlotPropertyType = 'Residential' | 'Commercial' | 'Villa';

export interface IPlot extends Document {
  plotNumber: string;
  block: PlotBlockType;
  areaSqFt: number;
  dimensions?: string;
  facing?: PlotFacingType;
  type?: PlotPropertyType;
  ratePerSqFt?: number;
  price: number;
  status: PlotStatusType;
  holdExpiresAt?: Date;
  reservedByCustomer?: Schema.Types.ObjectId;
  currentBookingId?: Schema.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlotSchema = new Schema<IPlot>(
  {
    plotNumber: {
      type: String,
      required: [true, 'Plot number is required'],
      trim: true,
      index: true,
    },
    block: {
      type: String,
      enum: ['Block A', 'Block B', 'Block C'],
      required: [true, 'Plot block is required'],
      index: true,
    },
    areaSqFt: {
      type: Number,
      required: [true, 'Plot area in sq.ft is required'],
      min: [100, 'Plot area must be at least 100 sq.ft'],
    },
    dimensions: {
      type: String,
      trim: true,
      default: '30x50 ft',
    },
    facing: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Corner', 'North-East', 'South-East'],
      default: 'East',
    },
    type: {
      type: String,
      enum: ['Residential', 'Commercial', 'Villa'],
      default: 'Residential',
    },
    ratePerSqFt: {
      type: Number,
      default: 1850,
    },
    price: {
      type: Number,
      required: [true, 'Plot price is required'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'HOLD', 'BOOKED', 'RESERVED', 'SOLD'],
      default: 'AVAILABLE',
      index: true,
    },
    holdExpiresAt: {
      type: Date,
    },
    reservedByCustomer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    currentBookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
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

// Compound Unique index: plotNumber + block
PlotSchema.index({ plotNumber: 1, block: 1 }, { unique: true });

export const Plot = mongoose.models.Plot || mongoose.model<IPlot>('Plot', PlotSchema);
export default Plot;
