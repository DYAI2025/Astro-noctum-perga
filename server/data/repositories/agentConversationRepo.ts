import { supabaseService } from '../supabase.js';
import type { AgentConversation } from '../types.js';

export async function createAgentConversation(
  conversation: Omit<AgentConversation, 'id' | 'created_at'>,
): Promise<AgentConversation> {
  const { data, error } = await supabaseService
    .from('agent_conversations')
    .insert(conversation)
    .select()
    .single();

  if (error) throw new Error(`Failed to create agent_conversation: ${error.message}`);
  return data as AgentConversation;
}

export async function getRecentAgentConversations(userId: string, limit = 5): Promise<AgentConversation[]> {
  const { data, error } = await supabaseService
    .from('agent_conversations')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list agent_conversations: ${error.message}`);
  return (data as AgentConversation[]) ?? [];
}
