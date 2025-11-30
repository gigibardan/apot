/**
 * Media Library Queries
 * Functions for managing media files
 */

import { supabase } from "@/integrations/supabase/client";

export async function getMediaLibrary({
  search,
  folder,
  sortBy,
}: {
  search?: string;
  folder?: string;
  sortBy?: string;
}) {
  let query = supabase.from("media_library").select("*");

  // Filter by search
  if (search) {
    query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%`);
  }

  // Filter by folder
  if (folder && folder !== "all") {
    query = query.eq("file_type", folder);
  }

  // Sort
  if (sortBy === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sortBy === "name") {
    query = query.order("filename", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function deleteMediaFile(id: string) {
  const { error } = await supabase.from("media_library").delete().eq("id", id);

  if (error) throw error;
}

export async function updateMediaFile(id: string, data: any) {
  const { error } = await supabase
    .from("media_library")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}
