import 'dotenv/config';

function required(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000'),
  supabaseUrl: required('SUPABASE_URL'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  elevenlabsToolSecrets: (process.env.ELEVENLABS_TOOL_SECRETS || process.env.ELEVENLABS_TOOL_SECRET || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  geminiApiKey: required('GEMINI_API_KEY'),
  bafeBaseUrl: process.env.BAFE_BASE_URL || 'https://bafe-production.up.railway.app',
} as const;
