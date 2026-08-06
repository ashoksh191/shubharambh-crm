import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import * as dashboardService from '../services/dashboardService.js';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const stats = await dashboardService.getDashboardStatsService();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: 'DASHBOARD_STATS_FAILED',
      message: error.message || 'Failed to fetch executive dashboard metrics.',
    });
  }
};
