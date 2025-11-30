/**
 * Settings Queries
 * Functions for managing site settings
 */

import { supabase } from "@/integrations/supabase/client";

export async function getSettings() {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .order("key");

  if (error) throw error;
  return data || [];
}

export async function getSetting(key: string) {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data?.value;
}

export async function updateSettings(settings: Record<string, any>) {
  const promises = Object.entries(settings).map(([key, value]) =>
    supabase
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" })
  );

  await Promise.all(promises);
}
