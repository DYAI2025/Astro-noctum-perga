import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
  const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase configuration missing. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// Named export for direct usage — returns a stub that noops when unconfigured
const noop = () => ({ data: null, error: { message: 'Supabase not configured' } });
const stub = { from: () => ({ select: () => ({ single: noop, order: () => ({ data: null, error: null }) }) }) };
export const supabase = (getSupabase() ?? stub) as SupabaseClient;
