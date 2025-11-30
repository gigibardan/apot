/**
 * Jinfotours Queries
 * Query functions for partner circuits and click tracking
 */

import { supabase } from "@/integrations/supabase/client";
import type { JinfoursCircuit } from "@/types/database.types";

/**
 * Get circuits (optionally only featured)
 */
export async function getCircuits(featured?: boolean): Promise<JinfoursCircuit[]> {
  let query = supabase
    .from("jinfotours_circuits")
    .select("*")
    .order("order_index", { ascending: true });

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as JinfoursCircuit[]) || [];
}

/**
 * Get featured circuits
 */
export async function getFeaturedCircuits(limit?: number): Promise<JinfoursCircuit[]> {
  let query = supabase
    .from("jinfotours_circuits")
    .select("*")
    .eq("featured", true)
    .order("order_index", { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as JinfoursCircuit[]) || [];
}

/**
 * Get circuit by slug
 */
export async function getCircuitBySlug(slug: string): Promise<JinfoursCircuit> {
  const { data, error } = await supabase
    .from("jinfotours_circuits")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as JinfoursCircuit;
}

/**
 * Get circuit by ID
 */
export async function getCircuitById(id: string): Promise<JinfoursCircuit> {
  const { data, error } = await supabase
    .from("jinfotours_circuits")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as JinfoursCircuit;
}

/**
 * Track click to Jinfotours
 */
export async function trackJinfoursClick(
  circuitId: string,
  metadata?: {
    sourceUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }
) {
  const { error } = await supabase.from("jinfotours_clicks").insert({
    circuit_id: circuitId,
    source_url: metadata?.sourceUrl || window.location.href,
    utm_source: metadata?.utmSource || null,
    utm_medium: metadata?.utmMedium || null,
    utm_campaign: metadata?.utmCampaign || null,
    user_agent: navigator.userAgent,
    clicked_at: new Date().toISOString(),
  } as any);

  if (error) console.error("Error tracking click:", error);
}

/**
 * Get circuits by countries
 */
export async function getCircuitsByCountries(
  countries: string[],
  limit?: number
): Promise<JinfoursCircuit[]> {
  let query = supabase
    .from("jinfotours_circuits")
    .select("*")
    .order("order_index", { ascending: true });

  // Filter circuits that contain any of the specified countries
  if (countries.length > 0) {
    query = query.overlaps("countries", countries);
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as JinfoursCircuit[]) || [];
}
