/**
 * Objectives Mutations
 * Admin functions for creating, updating, and deleting objectives
 */

import { supabase } from "@/integrations/supabase/client";
import type { ObjectiveInput } from "@/types/database.types";
import { slugify } from "@/lib/utils";

/**
 * Create new objective
 */
export async function createObjective(data: Partial<ObjectiveInput>) {
  // Generate slug if not provided
  if (!data.slug && data.title) {
    data.slug = slugify(data.title);
  }

  const { data: objective, error } = await supabase
    .from("objectives")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return objective;
}

/**
 * Update objective
 */
export async function updateObjective(
  id: string,
  data: Partial<ObjectiveInput>
) {
  const { data: objective, error } = await supabase
    .from("objectives")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return objective;
}

/**
 * Delete objective
 */
export async function deleteObjective(id: string) {
  const { error } = await supabase.from("objectives").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Publish/unpublish objective
 */
export async function toggleObjectivePublish(id: string, published: boolean) {
  return updateObjective(id, {
    published,
    published_at: published ? new Date().toISOString() : null,
  } as any);
}

/**
 * Toggle featured status
 */
export async function toggleObjectiveFeatured(id: string, featured: boolean) {
  return updateObjective(id, { featured } as any);
}

/**
 * Add/update types for objective
 */
export async function updateObjectiveTypes(
  objectiveId: string,
  typeIds: string[]
) {
  // First delete existing relations
  await supabase
    .from("objectives_types_relations")
    .delete()
    .eq("objective_id", objectiveId);

  // Then insert new ones
  if (typeIds.length > 0) {
    const relations = typeIds.map((typeId) => ({
      objective_id: objectiveId,
      type_id: typeId,
    }));

    const { error } = await supabase
      .from("objectives_types_relations")
      .insert(relations);

    if (error) throw error;
  }
}

/**
 * Duplicate objective
 */
export async function duplicateObjective(id: string) {
  const { data: original, error: fetchError } = await supabase
    .from("objectives")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Create copy with modified title and slug
  const copy = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy`,
    published: false,
    featured: false,
    views_count: 0,
    likes_count: 0,
    created_at: undefined,
    updated_at: undefined,
  };

  const { data: newObjective, error: createError } = await supabase
    .from("objectives")
    .insert(copy)
    .select()
    .single();

  if (createError) throw createError;

  // Copy type relations
  const { data: relations } = await supabase
    .from("objectives_types_relations")
    .select("type_id")
    .eq("objective_id", id);

  if (relations && relations.length > 0) {
    const newRelations = relations.map((rel) => ({
      objective_id: newObjective.id,
      type_id: rel.type_id,
    }));

    await supabase.from("objectives_types_relations").insert(newRelations);
  }

  return newObjective;
}
