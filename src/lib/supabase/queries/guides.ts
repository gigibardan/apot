/**
 * Guides Queries - UPDATED for SITUR Integration
 * Include căutare fără diacritice și filtre pentru data_source, attestation_type
 */

import { supabase } from "@/integrations/supabase/client";

export interface GetAuthorizedGuidesParams {
  search?: string;
  region?: string;
  attestationType?: string; // NEW: filtrare după tip atestat
  dataSource?: string; // NEW: filtrare după sursă (manual, situr_import_2025)
  limit?: number;
  offset?: number;
}

/**
 * Get authorized guides with advanced filters
 */
export async function getAuthorizedGuides(params: GetAuthorizedGuidesParams = {}) {
  const {
    search,
    region,
    attestationType,
    dataSource,
    limit = 50,
    offset = 0,
  } = params;

  let query = supabase
    .from("authorized_guides")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Search by name (with unaccent for diacritic-insensitive search)
  if (search) {
    // Use PostgreSQL unaccent + ilike for diacritic-insensitive search
    query = query.or(`full_name.ilike.%${search}%,license_number.ilike.%${search}%`);
  }

  // Filter by region
  if (region && region !== "all") {
    query = query.eq("region", region);
  }

  // Filter by attestation type
  if (attestationType && attestationType !== "all") {
    query = query.ilike("attestation_type", `%${attestationType}%`);
  }

  // Filter by data source
  if (dataSource && dataSource !== "all") {
    query = query.eq("data_source", dataSource);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    guides: data || [],
    total: count || 0,
  };
}

/**
 * Get authorized guide by ID
 */
export async function getAuthorizedGuideById(id: string) {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get authorized guide by slug (pentru pagina publică)
 */
export async function getAuthorizedGuideBySlug(slug: string) {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get authorized guide by license number
 */
export async function getAuthorizedGuideByLicenseNumber(licenseNumber: string) {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("*")
    .eq("license_number", licenseNumber)
    .single();

  if (error) throw error;
  return data;
}

/**
 * NEW: Get import statistics
 */
export async function getImportStatistics() {
  const { data: allGuides, error } = await supabase
    .from("authorized_guides")
    .select("data_source, verified_status");

  if (error) throw error;

  const stats = {
    total: allGuides?.length || 0,
    manual: 0,
    situr: 0,
    imported_official: 0,
    verified: 0,
    pending: 0,
  };

  allGuides?.forEach(guide => {
    if (guide.data_source === "manual") {
      stats.manual++;
    } else if (guide.data_source?.startsWith("situr")) {
      stats.situr++;
    }

    if (guide.verified_status === "imported_official") {
      stats.imported_official++;
    } else if (guide.verified_status === "verified") {
      stats.verified++;
    } else if (guide.verified_status === "pending") {
      stats.pending++;
    }
  });

  return stats;
}

/**
 * NEW: Get unique attestation types for filters
 */
export async function getAttestationTypes(): Promise<string[]> {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("attestation_type")
    .not("attestation_type", "is", null);

  if (error) throw error;

  const types = new Set<string>();
  data?.forEach(item => {
    if (item.attestation_type) {
      types.add(item.attestation_type);
    }
  });

  return Array.from(types).sort();
}

/**
 * NEW: Get unique regions for filters
 */
export async function getRegions(): Promise<string[]> {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("region")
    .not("region", "is", null);

  if (error) throw error;

  const regions = new Set<string>();
  data?.forEach(item => {
    if (item.region) {
      regions.add(item.region);
    }
  });

  return Array.from(regions).sort();
}

// ==================== EXISTING GUIDES FUNCTIONS (unchanged) ====================

export interface GetGuidesParams {
  search?: string;
  specialization?: string;
  region?: string;
  rating?: number;
  featured?: boolean;
  verified?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Get guides with filters and pagination
 */
export async function getGuides(params: GetGuidesParams = {}) {
  const {
    search,
    specialization,
    region,
    rating,
    featured,
    verified,
    active = true,
    limit = 12,
    offset = 0,
  } = params;

  let query = supabase
    .from("guides")
    .select("*", { count: "exact" })
    .eq("active", active)
    .order("featured", { ascending: false })
    .order("rating_average", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,bio.ilike.%${search}%`);
  }

  if (specialization) {
    query = query.contains("specializations", [specialization]);
  }

  if (region) {
    query = query.contains("geographical_areas", [region]);
  }

  if (rating) {
    query = query.gte("rating_average", rating);
  }

  if (featured !== undefined) {
    query = query.eq("featured", featured);
  }

  if (verified !== undefined) {
    query = query.eq("verified", verified);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    guides: data || [],
    total: count || 0,
  };
}

/**
 * Get guide by ID
 */
export async function getGuideById(id: string) {
  const { data, error } = await supabase.from("guides").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}

/**
 * Get guide by slug
 */
export async function getGuideBySlug(slug: string) {
  const { data, error } = await supabase
    .from("guides")
    .select(`
      *,
      guides_objectives_relations (
        objectives (
          id,
          name,
          slug,
          image_url
        )
      )
    `)
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get featured guides
 */
export async function getFeaturedGuides(limit: number = 6) {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("featured", true)
    .eq("active", true)
    .order("rating_average", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Increment guide views
 */
export async function incrementGuideViews(id: string) {
  const { error } = await supabase.rpc("increment_guide_views", { guide_id: id });

  if (error) throw error;
}

/**
 * Increment guide contact count
 */
export async function incrementGuideContactCount(id: string) {
  const { error } = await supabase.rpc("increment_guide_contact_count", { guide_id: id });

  if (error) throw error;
}