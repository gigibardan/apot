/**
 * Travel Journals Mutations
 */

import { supabase } from "@/integrations/supabase/client";
import { trackActivity } from "./social";

export async function createJournal(journalData: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  gallery_images?: string[];
  visited_objectives?: string[];
  trip_start_date?: string;
  trip_end_date?: string;
  published?: boolean;
  meta_title?: string;
  meta_description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("travel_journals")
    .insert({
      ...journalData,
      user_id: user.id,
      published_at: journalData.published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;

  // Track activity if published
  if (journalData.published) {
    await trackActivity("journal_published", "journal", data.id, {
      title: journalData.title,
    });
  }

  return data;
}

export async function updateJournal(
  journalId: string,
  updates: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    gallery_images?: string[];
    visited_objectives?: string[];
    trip_start_date?: string;
    trip_end_date?: string;
    published?: boolean;
    featured?: boolean;
    meta_title?: string;
    meta_description?: string;
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get current journal to check if publishing for first time
  const { data: current } = await supabase
    .from("travel_journals")
    .select("published, user_id")
    .eq("id", journalId)
    .single();

  if (current?.user_id !== user.id) {
    throw new Error("Unauthorized");
  }

  const updateData: any = { ...updates };

  // Set published_at if publishing for first time
  if (updates.published && !current?.published) {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("travel_journals")
    .update(updateData)
    .eq("id", journalId)
    .select()
    .single();

  if (error) throw error;

  // Track activity if newly published
  if (updates.published && !current?.published) {
    await trackActivity("journal_published", "journal", data.id, {
      title: data.title,
    });
  }

  return data;
}

export async function deleteJournal(journalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("travel_journals")
    .delete()
    .eq("id", journalId)
    .eq("user_id", user.id);

  if (error) throw error;

  return { success: true };
}

export async function likeJournal(journalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("journal_likes")
    .insert({
      journal_id: journalId,
      user_id: user.id,
    });

  if (error) throw error;

  return { success: true };
}

export async function unlikeJournal(journalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("journal_likes")
    .delete()
    .eq("journal_id", journalId)
    .eq("user_id", user.id);

  if (error) throw error;

  return { success: true };
}
