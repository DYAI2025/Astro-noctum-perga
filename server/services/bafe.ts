import { config } from '../config.js';
import type { BAFEChartRequest, BAFEChartResponse, BaFeFusionRequest } from '../data/types.js';

const BASE = config.bafeBaseUrl;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BaFe ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Calls POST /calculate/chart — the unified BAFE endpoint that returns
 * western positions, BaZi pillars, Wu-Xing vectors, houses, and angles
 * in a single response.
 *
 * NOTE: This endpoint uses `local_datetime` / `tz_id` / `geo_lon_deg` / `geo_lat_deg`
 * (NOT `date` / `tz` / `lon` / `lat` which are used by the legacy
 * /calculate/western and /calculate/bazi endpoints).
 */
export async function calculateChart(
  input: BAFEChartRequest,
): Promise<BAFEChartResponse> {
  return post<BAFEChartResponse>('/calculate/chart', {
    local_datetime: input.local_datetime,
    tz_id: input.tz_id,
    geo_lon_deg: input.geo_lon_deg,
    geo_lat_deg: input.geo_lat_deg,
    ...(input.dst_policy && { dst_policy: input.dst_policy }),
    ...(input.bodies && { bodies: input.bodies }),
    ...(input.time_standard && { time_standard: input.time_standard }),
    ...(input.day_boundary && { day_boundary: input.day_boundary }),
  });
}

/**
 * Calls POST /calculate/fusion — combines western and eastern Wu-Xing vectors
 * and computes harmony index + elemental comparison.
 *
 * This endpoint uses the legacy `date` / `tz` / `lon` / `lat` schema.
 */
export async function calculateFusion(
  input: BaFeFusionRequest,
): Promise<Record<string, unknown>> {
  return post<Record<string, unknown>>('/calculate/fusion', input);
}
