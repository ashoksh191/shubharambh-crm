import { Request, Response, NextFunction } from 'express';
import { listPlotsService, getPlotByIdService, updatePlotService } from '../services/plotService.js';

export const listPlotsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;
    const block = req.query.block as string;
    const search = req.query.search as string;

    const plots = await listPlotsService({ status, block, search });
    res.status(200).json({
      success: true,
      data: plots,
    });
  } catch (err) {
    next(err);
  }
};

export const getPlotDetailController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plotId = (req.params.id as string) || '';
    const plot = await getPlotByIdService(plotId);
    res.status(200).json({
      success: true,
      data: plot,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePlotController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plotId = (req.params.id as string) || '';
    const updated = await updatePlotService(plotId, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Plot updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};
