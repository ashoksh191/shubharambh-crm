import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import * as bookingService from '../services/bookingService.js';
import { createBookingSchema, cancelBookingSchema } from '../validators/bookingValidators.js';

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = createBookingSchema.parse(req.body);

    const booking = await bookingService.createBookingService({
      ...validated,
      createdByUserId: req.user?.userId,
      ipAddress: (req.ip || '127.0.0.1') as string,
    });

    res.status(201).json({
      success: true,
      message: 'Plot booking created successfully.',
      data: booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'BOOKING_CREATE_FAILED',
      message: error.message || 'Failed to create booking.',
      details: error.errors || undefined,
    });
  }
};

export const listBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      dateFrom,
      dateTo,
      status,
      paymentStatus,
      executiveId,
      customerId,
      block,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await bookingService.listBookingsService({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      status: status as any,
      paymentStatus: paymentStatus as any,
      executiveId: executiveId as string,
      customerId: customerId as string,
      block: block as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: 'BOOKINGS_FETCH_FAILED',
      message: error.message || 'Failed to list bookings.',
    });
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.getBookingByIdService(id);

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 404).json({
      success: false,
      error: 'BOOKING_NOT_FOUND',
      message: error.message || 'Booking record not found.',
    });
  }
};

export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validated = cancelBookingSchema.parse(req.body);

    const result = await bookingService.cancelBookingService(
      id,
      validated.reason,
      req.user?.userId,
      (req.ip || '127.0.0.1') as string
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'BOOKING_CANCEL_FAILED',
      message: error.message || 'Failed to cancel booking.',
    });
  }
};

export const registerBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await bookingService.registerBookingService(id, req.user?.userId, (req.ip || '127.0.0.1') as string);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'BOOKING_REGISTER_FAILED',
      message: error.message || 'Failed to complete deed registration.',
    });
  }
};
