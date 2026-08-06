import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import * as customerService from '../services/customerService.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/bookingValidators.js';

export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validatedData = createCustomerSchema.parse(req.body);
    const customer = await customerService.createCustomerService(validatedData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully.',
      data: customer,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'CUSTOMER_CREATE_FAILED',
      message: error.message || 'Failed to create customer.',
      details: error.errors || undefined,
    });
  }
};

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, city, state, page, limit, sortBy, sortOrder } = req.query;

    const result = await customerService.listCustomersService({
      search: search as string,
      city: city as string,
      state: state as string,
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
      error: 'CUSTOMER_FETCH_FAILED',
      message: error.message || 'Failed to list customers.',
    });
  }
};

export const getCustomerById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const customer = await customerService.getCustomerByIdService(id);

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(error.statusCode || 404).json({
      success: false,
      error: 'CUSTOMER_NOT_FOUND',
      message: error.message || 'Customer not found.',
    });
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validatedData = updateCustomerSchema.parse(req.body);
    const updated = await customerService.updateCustomerService(id, validatedData);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'CUSTOMER_UPDATE_FAILED',
      message: error.message || 'Failed to update customer.',
      details: error.errors || undefined,
    });
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await customerService.deleteCustomerService(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'CUSTOMER_DELETE_FAILED',
      message: error.message || 'Failed to delete customer.',
    });
  }
};
