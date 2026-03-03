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

// ─── BAFE /calculate/chart (unified endpoint) ──────────────────────────────

export interface BAFEChartRequest {
  local_datetime: string;   // ISO 8601 e.g. "2024-02-10T14:30:00"
  tz_id: string;            // IANA timezone e.g. "Europe/Berlin"
  geo_lon_deg: number;
  geo_lat_deg: number;
  dst_policy?: 'error' | 'earlier' | 'later';
  bodies?: string[] | null;
  include_validation?: boolean;
  time_standard?: 'CIVIL' | 'LMT';
  day_boundary?: 'midnight' | 'zi';
}

export interface BAFEPlanetPosition {
  name: string;
  longitude_deg: number | null;
  latitude_deg: number | null;
  speed_deg_per_day: number | null;
  distance_au: number | null;
  is_retrograde: boolean;
  sign_index: number;         // 0-11 (Aries=0)
  sign_name: string;          // English e.g. "Aries"
  sign_name_de: string;       // German e.g. "Widder"
  degree_in_sign: number | null;
}

export interface BAFEBaziPillar {
  stem_index: number;
  branch_index: number;
  stem: string;    // Romanized Heavenly Stem e.g. "Jia"
  branch: string;  // Romanized Earthly Branch e.g. "Chen"
  animal: string;  // English animal e.g. "Dragon"
  element: string; // German element e.g. "Holz"
}

export interface BAFEWuxingVector {
  Holz: number;
  Feuer: number;
  Erde: number;
  Metall: number;
  Wasser: number;
}

export interface BAFEChartResponse {
  engine_version: string;
  parameter_set_id: string;
  time_scales: {
    utc: string;
    civil_local: string;
    jd_ut: number;
    tlst_hours: number;
    eot_min: number;
    dst_status: string;
    dst_fold: number;
    tz_abbrev: string;
  };
  quality: { tlst: string };
  positions: BAFEPlanetPosition[];
  bazi: {
    ruleset_id: string;
    pillars: {
      year: BAFEBaziPillar;
      month: BAFEBaziPillar;
      day: BAFEBaziPillar;
      hour: BAFEBaziPillar;
    };
    day_master: string;
    dates: {
      birth_local: string;
      birth_utc: string;
      lichun_local: string;
    };
  };
  wuxing: {
    from_planets: BAFEWuxingVector;
    from_bazi: BAFEWuxingVector;
    harmony_index: number;
    dominant_planet: string;
    dominant_bazi: string;
  };
  houses: Record<string, number>;   // "1"–"12" → cusp degree 0-360
  angles: Record<string, number>;   // "Ascendant", "MC", "Vertex"
  validation: { ok: boolean; error: string | null } | null;
}

// ─── BAFE /calculate/fusion ────────────────────────────────────────────────

export interface BaFeFusionRequest {
  date: string;
  tz: string;
  lon: number;
  lat: number;
}
