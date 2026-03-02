import { supabase } from '../supabase.js';
import type { User } from '../types.js';

export async function upsertUser(
  id: string,
  metadata: Record<string, unknown> = {},
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .upsert({ id, metadata }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`Failed to upsert user: ${error.message}`);
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`);
  }
  return (data as User) ?? null;
}
