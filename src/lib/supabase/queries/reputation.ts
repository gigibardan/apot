import { supabase } from "@/integrations/supabase/client";

export interface UserReputation {
  id: string;
  user_id: string;
  reputation_points: number;
  posts_count: number;
  replies_count: number;
  helpful_count: number;
  best_answer_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get user reputation by user ID
 */
export async function getUserReputation(userId: string): Promise<UserReputation | null> {
  const { data, error } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // No reputation record yet
    throw error;
  }
  
  return data;
}

/**
 * Get top users by reputation
 */
export async function getTopUsers(limit: number = 10): Promise<UserReputation[]> {
  const { data, error } = await supabase
    .from('user_reputation')
    .select(`
      *,
      profile:profiles!user_reputation_user_id_fkey(full_name, avatar_url)
    `)
    .order('reputation_points', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

/**
 * Get user badge based on reputation points
 */
export function getUserBadge(reputationPoints: number): {
  name: string;
  color: string;
  icon: string;
} {
  if (reputationPoints >= 1000) {
    return { name: 'Expert', color: 'text-yellow-500', icon: '⭐' };
  } else if (reputationPoints >= 500) {
    return { name: 'Avansat', color: 'text-purple-500', icon: '💎' };
  } else if (reputationPoints >= 200) {
    return { name: 'Contributor', color: 'text-blue-500', icon: '🔷' };
  } else if (reputationPoints >= 50) {
    return { name: 'Activ', color: 'text-green-500', icon: '✓' };
  } else {
    return { name: 'Novice', color: 'text-gray-500', icon: '●' };
  }
}
