import { supabase } from "@/integrations/supabase/client";
import { GuideInput, AuthorizedGuideInput } from "@/types/guides";

/**
 * Create a new guide
 */
export async function createGuide(guide: GuideInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("guides")
    .insert({
      ...guide,
      created_by: user?.id,
      updated_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing guide
 */
export async function updateGuide(id: string, guide: Partial<GuideInput>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("guides")
    .update({
      ...guide,
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a guide
 */
export async function deleteGuide(id: string) {
  const { error } = await supabase.from("guides").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Bulk insert authorized guides from CSV
 */
export async function bulkInsertAuthorizedGuides(guides: AuthorizedGuideInput[]) {
  const { data, error } = await supabase.from("authorized_guides").insert(guides).select();

  if (error) throw error;
  return data;
}

/**
 * Link guide to objective
 */
export async function linkGuideToObjective(guideId: string, objectiveId: string) {
  const { error } = await supabase
    .from("guides_objectives_relations")
    .insert({ guide_id: guideId, objective_id: objectiveId });

  if (error) throw error;
}

/**
 * Unlink guide from objective
 */
export async function unlinkGuideFromObjective(guideId: string, objectiveId: string) {
  const { error } = await supabase
    .from("guides_objectives_relations")
    .delete()
    .eq("guide_id", guideId)
    .eq("objective_id", objectiveId);

  if (error) throw error;
}

/**
 * Update guide objectives (replace all)
 */
export async function updateGuideObjectives(guideId: string, objectiveIds: string[]) {
  // First delete all existing relations
  await supabase.from("guides_objectives_relations").delete().eq("guide_id", guideId);

  // Then insert new relations
  if (objectiveIds.length > 0) {
    const relations = objectiveIds.map((objectiveId) => ({
      guide_id: guideId,
      objective_id: objectiveId,
    }));

    const { error } = await supabase.from("guides_objectives_relations").insert(relations);
    if (error) throw error;
  }
}
