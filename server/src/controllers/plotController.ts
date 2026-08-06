import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import * as plotService from '../services/plotService.js';
import { createPlotSchema, reservePlotSchema } from '../validators/bookingValidators.js';
import { PlotBlockType } from '../models/Plot.js';

export const getAvailablePlots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { block } = req.query;
    const plots = await plotService.listAvailablePlotsService(block as PlotBlockType);

    res.status(200).json({
      success: true,
      count: plots.length,
      data: plots,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: 'PLOTS_FETCH_FAILED',
      message: error.message || 'Failed to list available plots.',
    });
  }
};

export const searchPlots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { block, status, facing, minPrice, maxPrice, minArea, maxArea, search, page, limit, sortBy, sortOrder } =
      req.query;

    const result = await plotService.searchPlotsService({
      block: block as any,
      status: status as any,
      facing: facing as any,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      minArea: minArea ? parseFloat(minArea as string) : undefined,
      maxArea: maxArea ? parseFloat(maxArea as string) : undefined,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
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
      error: 'PLOTS_SEARCH_FAILED',
      message: error.message || 'Failed to search plots.',
    });
  }
};

export const reservePlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const validated = reservePlotSchema.parse(req.body);

    const result = await plotService.reservePlotService(
      id,
      validated.customerId,
      validated.durationHours,
      req.user?.userId
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.plot,
      holdExpiresAt: result.holdExpiresAt,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PLOT_RESERVE_FAILED',
      message: error.message || 'Failed to reserve plot.',
    });
  }
};

export const releasePlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await plotService.releasePlotService(id, req.user?.userId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.plot,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PLOT_RELEASE_FAILED',
      message: error.message || 'Failed to release plot hold.',
    });
  }
};

export const createPlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validated = createPlotSchema.parse(req.body);
    const plot = await plotService.createPlotService(validated as any);

    res.status(201).json({
      success: true,
      message: 'Plot created successfully.',
      data: plot,
    });
  } catch (error: any) {
    res.status(error.statusCode || 400).json({
      success: false,
      error: 'PLOT_CREATE_FAILED',
      message: error.message || 'Failed to create plot.',
    });
  }
};
