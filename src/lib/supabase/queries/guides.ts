import { supabase } from "@/integrations/supabase/client";
import { Guide, GuideWithRelations, AuthorizedGuide } from "@/types/guides";

/**
 * Get all verified guides with optional filtering
 */
export async function getGuides(params?: {
  search?: string;
  specialization?: string;
  region?: string;
  featured?: boolean;
  minRating?: number;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from("guides")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("rating_average", { ascending: false });

  if (params?.search) {
    query = query.or(
      `full_name.ilike.%${params.search}%,bio.ilike.%${params.search}%,short_description.ilike.%${params.search}%`
    );
  }

  if (params?.specialization) {
    query = query.contains("specializations", [params.specialization]);
  }

  if (params?.region) {
    query = query.contains("geographical_areas", [params.region]);
  }

  if (params?.featured !== undefined) {
    query = query.eq("featured", params.featured);
  }

  if (params?.minRating) {
    query = query.gte("rating_average", params.minRating);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { guides: data as Guide[], count };
}

/**
 * Get a single guide by slug with relations
 */
export async function getGuideBySlug(slug: string): Promise<GuideWithRelations | null> {
  const { data: guide, error } = await supabase
    .from("guides")
    .select(
      `
      *,
      objectives:guides_objectives_relations(
        objective:objectives(*)
      ),
      reviews:guide_reviews(
        *,
        user:profiles(full_name, avatar_url)
      )
    `
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error) throw error;
  return guide as GuideWithRelations;
}

/**
 * Get featured guides for homepage
 */
export async function getFeaturedGuides(limit: number = 6) {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .eq("verified", true)
    .order("rating_average", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Guide[];
}

/**
 * Get authorized guides (from Ministry list)
 */
export async function getAuthorizedGuides(params?: {
  search?: string;
  region?: string;
  specialization?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from("authorized_guides")
    .select("*", { count: "exact" })
    .eq("license_active", true)
    .order("full_name");

  if (params?.search) {
    query = query.or(`full_name.ilike.%${params.search}%,license_number.ilike.%${params.search}%`);
  }

  if (params?.region) {
    query = query.eq("region", params.region);
  }

  if (params?.specialization) {
    query = query.ilike("specialization", `%${params.specialization}%`);
  }

  if (params?.limit) {
    query = query.limit(params.limit);
  }

  if (params?.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { guides: data as AuthorizedGuide[], count };
}

/**
 * Get guide by ID (for admin)
 */
export async function getGuideById(id: string): Promise<Guide | null> {
  const { data, error } = await supabase.from("guides").select("*").eq("id", id).single();

  if (error) throw error;
  return data as Guide;
}

/**
 * Get guides for a specific objective
 */
export async function getGuidesForObjective(objectiveId: string) {
  const { data, error } = await supabase
    .from("guides_objectives_relations")
    .select(
      `
      guide:guides(*)
    `
    )
    .eq("objective_id", objectiveId);

  if (error) throw error;
  return data.map((rel: any) => rel.guide) as Guide[];
}

/**
 * Get all unique specializations
 */
export async function getGuideSpecializations(): Promise<string[]> {
  const { data, error } = await supabase.from("guides").select("specializations");

  if (error) throw error;

  const allSpecializations = new Set<string>();
  data.forEach((guide: any) => {
    guide.specializations?.forEach((spec: string) => allSpecializations.add(spec));
  });

  return Array.from(allSpecializations).sort();
}

/**
 * Get all unique geographical areas
 */
export async function getGuideRegions(): Promise<string[]> {
  const { data, error } = await supabase.from("guides").select("geographical_areas");

  if (error) throw error;

  const allRegions = new Set<string>();
  data.forEach((guide: any) => {
    guide.geographical_areas?.forEach((area: string) => allRegions.add(area));
  });

  return Array.from(allRegions).sort();
}

/**
 * Get all unique regions from authorized guides
 */
export async function getAuthorizedGuideRegions(): Promise<string[]> {
  const { data, error } = await supabase
    .from("authorized_guides")
    .select("region")
    .not("region", "is", null);

  if (error) throw error;

  const allRegions = new Set<string>();
  data.forEach((guide: any) => {
    if (guide.region) allRegions.add(guide.region);
  });

  return Array.from(allRegions).sort();
}
