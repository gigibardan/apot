/**
 * Objective Suggestions Mutations
 */

import { supabase } from "@/integrations/supabase/client";

export async function createObjectiveSuggestion(suggestion: {
  title: string;
  location_country: string;
  location_city?: string;
  description: string;
  suggested_types?: string[];
  latitude?: number;
  longitude?: number;
  images?: string[];
  website_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("objective_suggestions")
    .insert({
      ...suggestion,
      user_id: user.id,
      images: suggestion.images || [],
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function approveSuggestion(
  suggestionId: string,
  adminNotes?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("objective_suggestions")
    .update({
      status: "approved",
      admin_notes: adminNotes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)
    .select()
    .single();

  if (error) throw error;

  // TODO: Send notification to user
  // TODO: Optionally auto-create objective from suggestion

  return data;
}

export async function rejectSuggestion(
  suggestionId: string,
  adminNotes: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("objective_suggestions")
    .update({
      status: "rejected",
      admin_notes: adminNotes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", suggestionId)
    .select()
    .single();

  if (error) throw error;

  // TODO: Send notification to user

  return data;
}
