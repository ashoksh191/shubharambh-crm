import { Router } from 'express';
import { listPlotsController, getPlotDetailController, updatePlotController } from '../controllers/plotController.js';

const router = Router();

router.get('/', listPlotsController);
router.get('/:id', getPlotDetailController);
router.put('/:id', updatePlotController);
router.patch('/:id', updatePlotController);

export default router;
