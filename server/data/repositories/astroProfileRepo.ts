import { supabaseService } from '../supabase.js';
import type { AstroProfile } from '../types.js';

export async function upsertAstroProfile(
  profile: Omit<AstroProfile, 'id' | 'created_at'>,
): Promise<AstroProfile> {
  const { data, error } = await supabaseService
    .from('astro_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert astro_profile: ${error.message}`);
  return data as AstroProfile;
}

export async function getAstroProfileByUserId(userId: string): Promise<AstroProfile | null> {
  const { data, error } = await supabaseService
    .from('astro_profiles')
    .select()
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get astro_profile: ${error.message}`);
  }
  return (data as AstroProfile) ?? null;
}
