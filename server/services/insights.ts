import * as bafe from './bafe.js';
import * as gemini from './gemini.js';
import * as chartRepo from '../data/repositories/chartRepo.js';
import * as insightRepo from '../data/repositories/insightRepo.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Insight } from '../data/types.js';

export async function createInsight(
  chartId: string,
  promptType = 'synthesis',
): Promise<Insight> {
  const chart = await chartRepo.getChartById(chartId);
  if (!chart) throw new AppError(404, 'Chart not found');

  const fusionData = await bafe.calculateFusion({
    date: chart.local_datetime,
    tz: chart.tz_id,
    lon: chart.geo_lon_deg,
    lat: chart.geo_lat_deg,
  });

  const { text, model, tokensUsed } = await gemini.generateInsight(
    chart.chart_data,
    fusionData,
  );

  return insightRepo.createInsight({
    chart_id: chartId,
    content: text,
    model,
    prompt_type: promptType,
    tokens_used: tokensUsed,
  });
}

export { getInsightById, getInsightsByChartId } from '../data/repositories/insightRepo.js';
