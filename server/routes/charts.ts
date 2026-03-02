import { Router } from 'express';
import { validateBody } from '../middleware/validateBody.js';
import * as chartService from '../services/charts.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.post(
  '/',
  validateBody([
    'user_id',
    'birth_date',
    'birth_time',
    'location_name',
    'tz_id',
    'geo_lon_deg',
    'geo_lat_deg',
  ]),
  async (req, res, next) => {
    try {
      const chart = await chartService.createChart(req.body);
      res.status(201).json(chart);
    } catch (err) {
      next(err);
    }
  },
);

router.get('/:id', async (req, res, next) => {
  try {
    const chart = await chartService.getChartById(req.params.id);
    if (!chart) throw new AppError(404, 'Chart not found');
    res.json(chart);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.user_id as string;
    if (!userId) throw new AppError(400, 'user_id query parameter required');
    const charts = await chartService.getChartsByUserId(userId);
    res.json(charts);
  } catch (err) {
    next(err);
  }
});

export default router;
