/**
 * Travel Journals Queries
 */

import { supabase } from "@/integrations/supabase/client";

export async function getPublishedJournals(
  page = 1,
  limit = 12,
  filter = "recent"
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("travel_journals")
    .select(
      `
      *,
      user:profiles!travel_journals_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("published", true);

  // Apply filters
  if (filter === "popular") {
    query = query.order("views_count", { ascending: false });
  } else if (filter === "liked") {
    query = query.order("likes_count", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    journals: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function getJournalBySlug(slug: string) {
  const { data, error } = await supabase
    .from("travel_journals")
    .select(
      `
      *,
      user:profiles!travel_journals_user_id_fkey(
        id,
        full_name,
        username,
        avatar_url,
        bio
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) throw error;

  // Increment view count
  await supabase.rpc("increment", {
    table_name: "travel_journals",
    row_id: data.id,
    column_name: "views_count",
  });

  return data;
}

export async function getUserJournals(userId: string, page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("travel_journals")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    journals: data || [],
    total: count || 0,
    hasMore: (count || 0) > to + 1,
  };
}

export async function isJournalLiked(journalId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("journal_likes")
    .select("id")
    .eq("journal_id", journalId)
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return !!data;
}

export async function getRelatedJournals(
  journalId: string,
  objectiveIds: string[] = [],
  limit = 3
) {
  if (!objectiveIds || objectiveIds.length === 0) {
    // Return recent journals if no objectives
    const { data } = await supabase
      .from("travel_journals")
      .select(
        `
        *,
        user:profiles!travel_journals_user_id_fkey(
          full_name,
          username,
          avatar_url
        )
      `
      )
      .eq("published", true)
      .neq("id", journalId)
      .order("published_at", { ascending: false })
      .limit(limit);

    return data || [];
  }

  // Find journals with overlapping objectives
  const { data } = await supabase
    .from("travel_journals")
    .select(
      `
      *,
      user:profiles!travel_journals_user_id_fkey(
        full_name,
        username,
        avatar_url
      )
    `
    )
    .eq("published", true)
    .neq("id", journalId)
    .overlaps("visited_objectives", objectiveIds)
    .order("published_at", { ascending: false })
    .limit(limit);

  return data || [];
}
