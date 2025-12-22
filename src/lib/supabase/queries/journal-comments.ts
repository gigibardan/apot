/**
 * Journal Comments Queries & Mutations
 * Backend logic pentru sistemul de comentarii la journals
 */

import { supabase } from "@/integrations/supabase/client";

// ============================================
// QUERIES
// ============================================

/**
 * Get all comments for a journal (including nested replies)
 */
export async function getJournalComments(journalId: string) {
  const { data, error } = await supabase
    .from("journal_comments")
    .select(`
      *,
      user:profiles!journal_comments_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      ),
      replies:journal_comments!parent_id(
        *,
        user:profiles!journal_comments_user_id_fkey(
          id,
          full_name,
          username,
          avatar_url
        )
      )
    `)
    .eq("journal_id", journalId)
    .is("parent_id", null) // Only top-level comments
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get comment count for a journal
 */
export async function getJournalCommentsCount(journalId: string): Promise<number> {
  const { count, error } = await supabase
    .from("journal_comments")
    .select("*", { count: "exact", head: true })
    .eq("journal_id", journalId);

  if (error) throw error;
  return count || 0;
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new comment on a journal
 */
export async function createJournalComment(data: {
  journal_id: string;
  content: string;
  parent_id?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to comment");

  const { data: comment, error } = await supabase
    .from("journal_comments")
    .insert({
      journal_id: data.journal_id,
      user_id: user.id,
      content: data.content,
      parent_id: data.parent_id || null,
    })
    .select(`
      *,
      user:profiles!journal_comments_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `)
    .single();

  if (error) throw error;
  return comment;
}

/**
 * Update a comment
 */
export async function updateJournalComment(commentId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const { data, error } = await supabase
    .from("journal_comments")
    .update({ 
      content,
      updated_at: new Date().toISOString()
    })
    .eq("id", commentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a comment
 */
export async function deleteJournalComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in");

  const { error } = await supabase
    .from("journal_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) throw error;
}