/**
 * Client-side type mirror of the BAFE /calculate/chart (ChartResponse) schema.
 * Keep in sync with server/data/types.ts BAFEChartResponse.
 */

export interface BAFEPlanetPosition {
  name: string;
  longitude_deg: number | null;
  latitude_deg: number | null;
  speed_deg_per_day: number | null;
  distance_au: number | null;
  is_retrograde: boolean;
  sign_index: number;
  sign_name: string;       // English
  sign_name_de: string;    // German
  degree_in_sign: number | null;
}

export interface BAFEBaziPillar {
  stem_index: number;
  branch_index: number;
  stem: string;    // e.g. "Jia"
  branch: string;  // e.g. "Chen"
  animal: string;  // e.g. "Dragon"
  element: string; // e.g. "Holz"
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
    harmony_index: number;    // cosine similarity 0–1
    dominant_planet: string;  // e.g. "Feuer"
    dominant_bazi: string;    // e.g. "Holz"
  };
  houses: Record<string, number>;  // "1"–"12" → cusp degree 0–360
  angles: Record<string, number>;  // "Ascendant", "MC", "Vertex"
  validation: { ok: boolean; error: string | null } | null;
}
