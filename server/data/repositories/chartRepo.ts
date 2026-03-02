import { supabase } from '../supabase.js';
import type { Chart } from '../types.js';

export async function createChart(
  chart: Omit<Chart, 'id' | 'created_at'>,
): Promise<Chart> {
  const { data, error } = await supabase
    .from('charts')
    .insert(chart)
    .select()
    .single();

  if (error) throw new Error(`Failed to create chart: ${error.message}`);
  return data as Chart;
}

export async function getChartById(id: string): Promise<Chart | null> {
  const { data, error } = await supabase
    .from('charts')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get chart: ${error.message}`);
  }
  return (data as Chart) ?? null;
}

export async function getChartsByUserId(userId: string): Promise<Chart[]> {
  const { data, error } = await supabase
    .from('charts')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list charts: ${error.message}`);
  return (data as Chart[]) ?? [];
}
