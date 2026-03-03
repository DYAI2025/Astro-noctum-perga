const USER_ID_KEY = 'astro_noctum_user_id';

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function registerUser(): Promise<void> {
  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: getUserId() }),
  });
}

// ─── Geocoding via OpenStreetMap Nominatim (free, no API key needed) ────────

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function geocodeLocation(query: string): Promise<GeoResult> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a descriptive User-Agent
      'Accept-Language': 'en',
      'User-Agent': 'AstroNoctum/1.0 (astrology observatory app)',
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.statusText}`);
  }

  const results = await res.json() as Array<{ lat: string; lon: string; display_name: string }>;

  if (!results || results.length === 0) {
    throw new Error(`Location not found: "${query}". Please try a more specific location name.`);
  }

  const [first] = results;
  return {
    lat: parseFloat(first.lat),
    lon: parseFloat(first.lon),
    displayName: first.display_name,
  };
}

// ─── Chart & Insight API ─────────────────────────────────────────────────────

export interface ChartInput {
  birth_date: string;
  birth_time: string;
  location_name: string;
  tz_id: string;
  geo_lon_deg: number;
  geo_lat_deg: number;
}

export interface Chart {
  id: string;
  chart_data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Insight {
  id: string;
  content: string;
  [key: string]: unknown;
}

export async function createChart(input: ChartInput): Promise<Chart> {
  const res = await fetch('/api/charts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, user_id: getUserId() }),
  });
  return json<Chart>(res);
}

export async function generateInsight(chartId: string): Promise<Insight> {
  const res = await fetch('/api/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chart_id: chartId }),
  });
  return json<Insight>(res);
}
