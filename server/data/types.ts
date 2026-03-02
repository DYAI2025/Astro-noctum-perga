export interface User {
  id: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface Chart {
  id: string;
  user_id: string;
  birth_date: string;
  birth_time: string;
  location_name: string;
  tz_id: string;
  geo_lon_deg: number;
  geo_lat_deg: number;
  local_datetime: string;
  chart_data: Record<string, unknown>;
  created_at: string;
}

export interface Insight {
  id: string;
  chart_id: string;
  content: string;
  model: string;
  prompt_type: string;
  tokens_used: number;
  created_at: string;
}

export interface CreateChartInput {
  user_id: string;
  birth_date: string;
  birth_time: string;
  location_name: string;
  tz_id: string;
  geo_lon_deg: number;
  geo_lat_deg: number;
}

export interface CreateInsightInput {
  chart_id: string;
  prompt_type?: string;
}

export interface BaFeChartRequest {
  local_datetime: string;
  tz_id: string;
  geo_lon_deg: number;
  geo_lat_deg: number;
}

export interface BaFeChartResponse {
  positions: Record<string, unknown>;
  bazi: Record<string, unknown>;
  wuxing: Record<string, unknown>;
  houses: Record<string, unknown>;
  angles: Record<string, unknown>;
  [key: string]: unknown;
}

export interface BaFeFusionRequest {
  local_datetime: string;
  tz_id: string;
  geo_lon_deg: number;
  geo_lat_deg: number;
}
