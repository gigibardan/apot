/**
 * User Favorites Mutations
 * Functions for managing user favorite objectives
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Add objective to user favorites
 */
export async function addFavorite(objectiveId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast.error("Trebuie să fii autentificat pentru a salva favorite");
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .insert({
      user_id: user.id,
      objective_id: objectiveId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      toast.error("Obiectivul este deja în favorite");
    } else {
      toast.error("Eroare la adăugarea în favorite");
    }
    throw error;
  }

  toast.success("Obiectiv adăugat la favorite");
  return data;
}

/**
 * Remove objective from user favorites
 */
export async function removeFavorite(objectiveId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    toast.error("Trebuie să fii autentificat");
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("objective_id", objectiveId);

  if (error) {
    toast.error("Eroare la eliminarea din favorite");
    throw error;
  }

  toast.success("Obiectiv eliminat din favorite");
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(objectiveId: string, isFavorited: boolean) {
  if (isFavorited) {
    return await removeFavorite(objectiveId);
  } else {
    return await addFavorite(objectiveId);
  }
}
