/**
 * Types for Guides System - UPDATED for SITUR Integration
 * Includes new fields for official government data import
 */

export interface Guide {
  id: string;
  full_name: string;
  slug: string;
  bio: string | null;
  short_description: string | null;
  profile_image: string | null;
  years_experience: number | null;
  languages: string[];
  specializations: string[];
  geographical_areas: string[];
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website_url: string | null;
  price_per_day: number | null;
  price_per_group: number | null;
  verified: boolean;
  featured: boolean;
  active: boolean;
  verification_date: string | null;
  verification_notes: string | null;
  rating_average: number;
  reviews_count: number;
  views_count: number;
  contact_count: number;
  meta_title: string | null;
  meta_description: string | null;
  availability_calendar_url: string | null;
  license_number?: string | null;
  attestation_type?: string | null;
  official_guide?: boolean;
  license_active?: boolean;
  license_expiry_date?: string | null;
  authorized_guide_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface AuthorizedGuide {
  id: string;
  full_name: string;
  license_number: string | null;
  specialization: string | null;
  languages: string[];
  region: string | null;
  phone: string | null;
  email: string | null;
  license_active: boolean;
  license_expiry_date: string | null;
  // ===== NEW SITUR FIELDS =====
  data_source: string; // 'manual', 'situr_import_2025', etc.
  verified_status: string; // 'pending', 'imported_official', 'verified', 'rejected'
  import_date: string | null; // Timestamp când a fost importat
  issue_date: string | null; // Data eliberării atestatului (din SITUR)
  attestation_type: string | null; // Tipul complet din SITUR: "National", "Local", "Specializat - montan", etc.
  slug: string | null; // SEO-friendly URL slug
  created_at: string;
  updated_at: string;
}

export interface GuideReview {
  id: string;
  guide_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  travel_date: string | null;
  approved: boolean;
  guide_response: string | null;
  guide_response_date: string | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface GuideWithRelations extends Guide {
  objectives?: any[];
  reviews?: GuideReview[];
}

export type GuideInput = Omit<
  Guide,
  "id" | "created_at" | "updated_at" | "rating_average" | "reviews_count" | "views_count" | "contact_count"
>;

export type AuthorizedGuideInput = Omit<AuthorizedGuide, "id" | "created_at" | "updated_at" | "slug"> & {
  slug?: string | null; // Optional - se generează automat via trigger
};

// ===== NEW: SITUR Import Types =====

/**
 * Raw SITUR CSV row structure
 */
export interface SITURRawData {
  "Nume și prenume": string;
  "Nr. atestat": string;
  "Data eliberării": string;
  "Tip atestat": string;
}

/**
 * Processed SITUR data for import
 */
export interface SITURProcessedGuide {
  full_name: string;
  license_number: string;
  issue_date: string;
  attestation_type: string;
  specialization: string; // Mapped from attestation_type
  data_source: string;
  verified_status: string;
  import_date: string;
  license_active: boolean;
  languages: string[];
  region: string | null;
  phone: string | null;
  email: string | null;
  license_expiry_date: string | null;
}

/**
 * Import statistics after SITUR import
 */
export interface SITURImportStats {
  total_rows: number;
  successfully_imported: number;
  skipped_duplicates: number;
  errors: number;
  error_details: string[];
}