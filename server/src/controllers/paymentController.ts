import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import * as paymentService from '../services/paymentService.js';
import { createPaymentSchema, verifyPaymentSchema } from '../validators/bookingValidators.js';

export const addPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = createPaymentSchema.parse(req.body);

    const payment = await paymentService.addPaymentService({
      ...validated,
      performedByUserId: req.user?.userId,
      ipAddress: (req.ip || '127.0.0.1') as string,
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully.',
      data: payment,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PAYMENT_ADD_FAILED',
      message: error.message || 'Failed to record payment.',
      details: error.errors || undefined,
    });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validated = verifyPaymentSchema.parse(req.body);

    const result = await paymentService.verifyPaymentService(
      id,
      validated.approved,
      req.user?.userId || 'SUPER_ADMIN',
      validated.remarks,
      (req.ip || '127.0.0.1') as string
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.payment,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PAYMENT_VERIFY_FAILED',
      message: error.message || 'Failed to verify payment.',
    });
  }
};

export const getPaymentsByBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const payments = await paymentService.getPaymentsByBookingIdService(bookingId);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error: any) {
    res.status(error.statusCode || 404).json({
      success: false,
      error: 'PAYMENTS_FETCH_FAILED',
      message: error.message || 'Failed to fetch payment records.',
    });
  }
};

export const deletePayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await paymentService.deletePaymentService(id, req.user?.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PAYMENT_DELETE_FAILED',
      message: error.message || 'Failed to delete payment record.',
    });
  }
};
