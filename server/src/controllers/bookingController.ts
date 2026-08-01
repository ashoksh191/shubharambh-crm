import { Request, Response, NextFunction } from 'express';
import { createBookingService, getBookingService, listBookingsService } from '../services/bookingService.js';

export const createBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'sys-default-user';
    const result = await createBookingService({
      ...req.body,
      createdById: userId,
    });

    res.status(201).json({
      success: true,
      status: 'success',
      booking: result,
      message: 'Booking transaction completed successfully with atomic server confirmation.',
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = (req.params.id as string) || '';
    const booking = await getBookingService(bookingId);
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

export const listBookingsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await listBookingsService(page, limit);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
