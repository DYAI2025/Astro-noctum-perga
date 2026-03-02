import * as bafe from './bafe.js';
import * as chartRepo from '../data/repositories/chartRepo.js';
import type { CreateChartInput, Chart } from '../data/types.js';

export async function createChart(input: CreateChartInput): Promise<Chart> {
  const localDatetime = `${input.birth_date}T${input.birth_time}:00`;

  const chartData = await bafe.calculateChart({
    local_datetime: localDatetime,
    tz_id: input.tz_id,
    geo_lon_deg: input.geo_lon_deg,
    geo_lat_deg: input.geo_lat_deg,
  });

  return chartRepo.createChart({
    user_id: input.user_id,
    birth_date: input.birth_date,
    birth_time: input.birth_time,
    location_name: input.location_name,
    tz_id: input.tz_id,
    geo_lon_deg: input.geo_lon_deg,
    geo_lat_deg: input.geo_lat_deg,
    local_datetime: localDatetime,
    chart_data: chartData,
  });
}

export { getChartById, getChartsByUserId } from '../data/repositories/chartRepo.js';
