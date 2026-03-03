import * as bafe from './bafe.js';
import * as chartRepo from '../data/repositories/chartRepo.js';
import type { CreateChartInput, NatalChart } from '../data/types.js';

export async function createChart(input: CreateChartInput): Promise<NatalChart> {
  const localDatetime = `${input.birth_date}T${input.birth_time}:00`;

  // Use unified /calculate/chart endpoint with correct ChartRequest field names
  const chartData = await bafe.calculateChart({
    local_datetime: localDatetime,
    tz_id: input.tz_id,
    geo_lon_deg: input.geo_lon_deg,
    geo_lat_deg: input.geo_lat_deg,
  });

  // Calculate a mock UTC time for birth_utc (or format appropriately if possible)
  // Since we only have local_datetime and tz_id, we will store the local_datetime 
  // with a postfix as a placeholder for UTC until we implement full momenttz conversion.
  const birthUtcStr = `${input.birth_date}T${input.birth_time}:00Z`;

  // Insert birth_data history
  await chartRepo.createBirthData({
    user_id: input.user_id,
    birth_utc: birthUtcStr,
    lat: input.geo_lat_deg,
    lon: input.geo_lon_deg,
    place_label: input.location_name,
    tz_id: input.tz_id,
  });

  // Insert natal_charts
  return chartRepo.createNatalChart({
    user_id: input.user_id,
    birth_date: input.birth_date,
    birth_time: input.birth_time,
    location_name: input.location_name,
    tz_id: input.tz_id,
    geo_lon_deg: input.geo_lon_deg,
    geo_lat_deg: input.geo_lat_deg,
    local_datetime: localDatetime,
    chart_data: chartData as unknown as Record<string, unknown>,
  });
}

export const getChartById = chartRepo.getNatalChartById;
export const getChartsByUserId = chartRepo.getNatalChartsByUserId;
