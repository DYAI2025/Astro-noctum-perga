import { config } from '../config.js';
import type { BaFeChartRequest, BaFeChartResponse, BaFeFusionRequest } from '../data/types.js';

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

export async function calculateChart(
  input: BaFeChartRequest,
): Promise<BaFeChartResponse> {
  return post<BaFeChartResponse>('/chart', input);
}

export async function calculateFusion(
  input: BaFeFusionRequest,
): Promise<Record<string, unknown>> {
  return post<Record<string, unknown>>('/calculate/fusion', input);
}
