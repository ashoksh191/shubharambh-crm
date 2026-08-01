import { Request, Response, NextFunction } from 'express';
import { listCustomersService, createCustomerService } from '../services/customerService.js';

export const listCustomersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await listCustomersService(page, limit);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const createCustomerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await createCustomerService(req.body);
    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer record saved successfully.',
    });
  } catch (err) {
    next(err);
  }
};
