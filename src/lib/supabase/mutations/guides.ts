/**
 * Guides Mutations - UPDATED for SITUR Integration
 * Include funcții pentru import bulk cu skip duplicates
 */

import { supabase } from "@/integrations/supabase/client";
import { GuideInput, AuthorizedGuideInput, SITURImportStats } from "@/types/guides";

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
 * Bulk insert authorized guides from CSV (original function - kept for backward compatibility)
 */
export async function bulkInsertAuthorizedGuides(guides: AuthorizedGuideInput[]) {
  const { data, error } = await supabase.from("authorized_guides").insert(guides).select();

  if (error) throw error;
  return data;
}

/**
 * NEW: Bulk insert authorized guides from SITUR with duplicate detection
 * 
 * @param guides - Array of guides to import
 * @param skipDuplicates - If true, skip guides with existing license_number (default: true)
 * @returns Import statistics
 */
export async function bulkInsertSITURGuides(
  guides: AuthorizedGuideInput[],
  skipDuplicates: boolean = true
): Promise<SITURImportStats> {
  const stats: SITURImportStats = {
    total_rows: guides.length,
    successfully_imported: 0,
    skipped_duplicates: 0,
    errors: 0,
    error_details: [],
  };

  if (guides.length === 0) {
    return stats;
  }

  try {
    if (skipDuplicates) {
      // Step 1: Get all existing license numbers
      const licenseNumbers = guides
        .map(g => g.license_number)
        .filter((ln): ln is string => ln !== null);
      
      const { data: existingGuides, error: fetchError } = await supabase
        .from("authorized_guides")
        .select("license_number")
        .in("license_number", licenseNumbers);

      if (fetchError) {
        throw fetchError;
      }

      const existingLicenseNumbers = new Set(
        existingGuides?.map(g => g.license_number) || []
      );

      // Step 2: Filter out duplicates
      const guidesToInsert = guides.filter(guide => {
        if (guide.license_number && existingLicenseNumbers.has(guide.license_number)) {
          stats.skipped_duplicates++;
          return false;
        }
        return true;
      });

      // Step 3: Insert only new guides
      if (guidesToInsert.length > 0) {
        const { data, error } = await supabase
          .from("authorized_guides")
          .insert(guidesToInsert)
          .select();

        if (error) {
          stats.errors = guidesToInsert.length;
          stats.error_details.push(`Bulk insert error: ${error.message}`);
        } else {
          stats.successfully_imported = data?.length || 0;
        }
      }
    } else {
      // Insert all without duplicate check (might cause errors)
      const { data, error } = await supabase
        .from("authorized_guides")
        .insert(guides)
        .select();

      if (error) {
        stats.errors = guides.length;
        stats.error_details.push(`Bulk insert error: ${error.message}`);
      } else {
        stats.successfully_imported = data?.length || 0;
      }
    }
  } catch (error: any) {
    stats.errors = guides.length;
    stats.error_details.push(`Unexpected error: ${error.message}`);
  }

  return stats;
}

/**
 * NEW: Check if a license number already exists
 */
export async function checkLicenseNumberExists(licenseNumber: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("id")
    .eq("license_number", licenseNumber)
    .limit(1);

  if (error) {
    console.error("Error checking license number:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * NEW: Delete an authorized guide
 */
export async function deleteAuthorizedGuide(id: string) {
  const { error } = await supabase
    .from("authorized_guides")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * NEW: Bulk delete authorized guides
 */
export async function bulkDeleteAuthorizedGuides(ids: string[]) {
  const { error } = await supabase
    .from("authorized_guides")
    .delete()
    .in("id", ids);

  if (error) throw error;
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