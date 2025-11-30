/**
 * Circuits Mutations
 * Admin functions for managing Jinfotours circuits
 */

import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/utils";

/**
 * Create new circuit
 */
export async function createCircuit(data: any) {
  // Generate slug if not provided
  if (!data.slug && data.title) {
    data.slug = slugify(data.title);
  }

  const { data: circuit, error } = await supabase
    .from("jinfotours_circuits")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return circuit;
}

/**
 * Update circuit
 */
export async function updateCircuit(id: string, data: any) {
  const { data: circuit, error } = await supabase
    .from("jinfotours_circuits")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return circuit;
}

/**
 * Delete circuit
 */
export async function deleteCircuit(id: string) {
  const { error } = await supabase
    .from("jinfotours_circuits")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * Toggle featured status
 */
export async function toggleCircuitFeatured(id: string, featured: boolean) {
  return updateCircuit(id, { featured });
}
