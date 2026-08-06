import Plot, { IPlot, PlotBlockType, PlotFacingType, PlotStatusType } from '../models/Plot.js';
import Customer from '../models/Customer.js';
import BookingHistory from '../models/BookingHistory.js';
import mongoose from 'mongoose';

export interface SearchPlotFilter {
  block?: PlotBlockType;
  status?: PlotStatusType;
  facing?: PlotFacingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const listAvailablePlotsService = async (block?: PlotBlockType) => {
  const query: any = { isDeleted: false, status: 'AVAILABLE' };
  if (block) query.block = block;

  return await Plot.find(query).sort({ block: 1, plotNumber: 1 }).lean();
};

export const searchPlotsService = async (filters: SearchPlotFilter = {}) => {
  const {
    block,
    status,
    facing,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    search,
    page = 1,
    limit = 20,
    sortBy = 'plotNumber',
    sortOrder = 'asc',
  } = filters;

  const query: any = { isDeleted: false };

  if (block) query.block = block;
  if (status) query.status = status;
  if (facing) query.facing = facing;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  if (minArea || maxArea) {
    query.areaSqFt = {};
    if (minArea) query.areaSqFt.$gte = minArea;
    if (maxArea) query.areaSqFt.$lte = maxArea;
  }

  if (search) {
    query.$or = [
      { plotNumber: { $regex: search, $options: 'i' } },
      { block: { $regex: search, $options: 'i' } },
      { facing: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const sortOption: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Plot.find(query).sort(sortOption).skip(skip).limit(limit).populate('reservedByCustomer').lean(),
    Plot.countDocuments(query),
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

export const reservePlotService = async (
  plotId: string,
  customerId: string,
  durationHours = 24,
  performedByUserId?: string
) => {
  const plot = await Plot.findOne({
    $or: [{ _id: isValidObjectId(plotId) ? plotId : null }, { plotNumber: plotId }],
    isDeleted: false,
  });

  if (!plot) {
    throw { statusCode: 404, message: 'Plot not found.' };
  }

  if (plot.status !== 'AVAILABLE') {
    throw { statusCode: 400, message: `Plot ${plot.plotNumber} is currently in '${plot.status}' status and cannot be reserved.` };
  }

  const customer = await Customer.findOne({
    $or: [{ _id: isValidObjectId(customerId) ? customerId : null }, { customerId: customerId }],
    isDeleted: false,
  });

  if (!customer) {
    throw { statusCode: 404, message: 'Customer record not found for reservation.' };
  }

  const holdExpiresAt = new Date();
  holdExpiresAt.setHours(holdExpiresAt.getHours() + durationHours);

  plot.status = 'HOLD';
  plot.reservedByCustomer = customer._id as any;
  plot.holdExpiresAt = holdExpiresAt;

  await plot.save();

  return {
    message: `Plot ${plot.plotNumber} (${plot.block}) reserved on 24-hr HOLD for customer ${customer.fullName}.`,
    plot,
    holdExpiresAt,
  };
};

export const releasePlotService = async (plotId: string, performedByUserId?: string) => {
  const plot = await Plot.findOne({
    $or: [{ _id: isValidObjectId(plotId) ? plotId : null }, { plotNumber: plotId }],
    isDeleted: false,
  });

  if (!plot) {
    throw { statusCode: 404, message: 'Plot not found.' };
  }

  if (plot.status !== 'HOLD' && plot.status !== 'RESERVED') {
    throw { statusCode: 400, message: `Plot ${plot.plotNumber} is in '${plot.status}' status. Only HOLD/RESERVED plots can be released.` };
  }

  plot.status = 'AVAILABLE';
  plot.reservedByCustomer = undefined;
  plot.holdExpiresAt = undefined;

  await plot.save();

  return {
    message: `Plot ${plot.plotNumber} (${plot.block}) released back to AVAILABLE inventory.`,
    plot,
  };
};

export const createPlotService = async (data: Partial<IPlot>) => {
  const existing = await Plot.findOne({ plotNumber: data.plotNumber, block: data.block, isDeleted: false });
  if (existing) {
    throw { statusCode: 400, message: `Plot ${data.plotNumber} already exists in ${data.block}.` };
  }

  const plot = new Plot(data);
  return await plot.save();
};

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}
