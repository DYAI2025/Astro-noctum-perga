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

export async function upsertAstroProfile(profileData: Record<string, any>) {
  const supabase = getSupabase();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { data, error } = await supabase
    .from('astro_profiles')
    .upsert(profileData, { onConflict: 'user_id' })
    .select()
    .single();
    
  if (error && error.code !== '23505') { // Ignore unique violations if we don't upsert properly
    console.error('Failed to upsert astro profile:', error);
    return { error };
  }
  return { data };
}
const noop = () => ({ data: null, error: { message: 'Supabase not configured' } });
const stub = { from: () => ({ select: () => ({ single: noop, order: () => ({ data: null, error: null }) }) }) };
export const supabase = (getSupabase() ?? stub) as SupabaseClient;
