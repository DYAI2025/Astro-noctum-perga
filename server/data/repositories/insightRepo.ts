import { supabase } from '../supabase.js';
import type { Insight } from '../types.js';

export async function createInsight(
  insight: Omit<Insight, 'id' | 'created_at'>,
): Promise<Insight> {
  const { data, error } = await supabase
    .from('insights')
    .insert(insight)
    .select()
    .single();

  if (error) throw new Error(`Failed to create insight: ${error.message}`);
  return data as Insight;
}

export async function getInsightById(id: string): Promise<Insight | null> {
  const { data, error } = await supabase
    .from('insights')
    .select()
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get insight: ${error.message}`);
  }
  return (data as Insight) ?? null;
}

export async function getInsightsByChartId(
  chartId: string,
): Promise<Insight[]> {
  const { data, error } = await supabase
    .from('insights')
    .select()
    .eq('chart_id', chartId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to list insights: ${error.message}`);
  return (data as Insight[]) ?? [];
}
