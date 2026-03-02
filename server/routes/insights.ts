import { Router } from 'express';
import { validateBody } from '../middleware/validateBody.js';
import * as insightService from '../services/insights.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

router.post('/', validateBody(['chart_id']), async (req, res, next) => {
  try {
    const insight = await insightService.createInsight(
      req.body.chart_id,
      req.body.prompt_type,
    );
    res.status(201).json(insight);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const insight = await insightService.getInsightById(req.params.id);
    if (!insight) throw new AppError(404, 'Insight not found');
    res.json(insight);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const chartId = req.query.chart_id as string;
    if (!chartId) throw new AppError(400, 'chart_id query parameter required');
    const insights = await insightService.getInsightsByChartId(chartId);
    res.json(insights);
  } catch (err) {
    next(err);
  }
});

export default router;
