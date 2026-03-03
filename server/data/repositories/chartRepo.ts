import { supabase } from '../supabase.js';
import type { NatalChart, BirthData } from '../types.js';

export async function createNatalChart(
  chart: Omit<NatalChart, 'id' | 'created_at'>,
): Promise<NatalChart> {
  const { data, error } = await supabase
    .from('natal_charts')
    .insert(chart)
    .select()
    .single();

  if (error) throw new Error(`Failed to create natal_chart: ${error.message}`);
  return data as NatalChart;
}

export async function createBirthData(
  birthData: Omit<BirthData, 'id' | 'created_at'>,
): Promise<BirthData> {
  const { data, error } = await supabase
    .from('birth_data')
    .insert(birthData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create birth_data: ${error.message}`);
  return data as BirthData;
}

export async function getNatalChartById(id: string): Promise<NatalChart | null> {
  const { data, error } = await supabase
    .from('natal_charts')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get natal_chart: ${error.message}`);
  }
  return (data as NatalChart) ?? null;
}

export async function getNatalChartsByUserId(userId: string): Promise<NatalChart[]> {
  const { data, error } = await supabase
    .from('natal_charts')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list natal_charts: ${error.message}`);
  return (data as NatalChart[]) ?? [];
}
