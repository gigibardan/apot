/**
 * Database Types
 * Complete TypeScript interfaces for all Supabase tables
 * Auto-generated types will be in src/integrations/supabase/types.ts
 * These are application-level types with additional helpers
 */

// ==================== CORE TYPES ====================

export type DifficultyLevel = 'easy' | 'moderate' | 'difficult' | 'extreme';
export type UserRoleType = 'admin' | 'editor' | 'contributor' | 'user';
export type BlogCategory = 'călătorii' | 'cultură' | 'istorie' | 'natură' | 'gastronomie' | 'aventură';

// ==================== TAXONOMIES ====================

export interface Continent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  continent_id: string;
  name: string;
  slug: string;
  flag_emoji: string | null;
  description: string | null;
  image_url: string | null;
  capital: string | null;
  currency: string | null;
  language: string | null;
  meta_title: string | null;
  meta_description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order_index: number;
  created_at: string;
}

// ==================== MEDIA ====================

export interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface VideoEmbed {
  url: string;
  platform?: 'youtube' | 'vimeo' | 'other';
  embed_code?: string;
  thumbnail?: string;
}

// ==================== OBJECTIVES ====================

export interface Objective {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  continent_id: string | null;
  country_id: string | null;
  featured_image: string | null;
  gallery_images: GalleryImage[];
  video_urls: VideoEmbed[];
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  visit_duration: string | null;
  best_season: string | null;
  difficulty_level: DifficultyLevel | null;
  entrance_fee: string | null;
  opening_hours: string | null;
  accessibility_info: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  booking_url: string | null;
  unesco_site: boolean;
  unesco_year: number | null;
  featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  schema_data: Record<string, any> | null;
  views_count: number;
  likes_count: number;
  published: boolean;
  published_at: string | null;
  featured_until: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ObjectiveWithRelations extends Objective {
  continent?: Continent;
  country?: Country;
  types?: ObjectiveType[];
}

export interface ObjectiveTypeRelation {
  id: string;
  objective_id: string;
  type_id: string;
  created_at: string;
}

// ==================== BLOG ====================

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: BlogCategory | null;
  tags: string[];
  author_id: string | null;
  reading_time: number | null;
  meta_title: string | null;
  meta_description: string | null;
  schema_data: Record<string, any> | null;
  views_count: number;
  featured: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== JINFOTOURS ====================

export interface JinfoursCircuit {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  external_url: string;
  price_from: number | null;
  duration_days: number | null;
  countries: string[];
  highlights: string[];
  featured: boolean;
  order_index: number;
  // Discount fields
  discount_percentage: number | null;
  original_price: number | null;
  discount_until: string | null;
  // Badge fields
  badge_text: string | null;
  badge_color: string | null;
  created_at: string;
  updated_at: string;
}

export interface JinfoursClick {
  id: string;
  circuit_id: string | null;
  clicked_at: string;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  user_agent: string | null;
  ip_address: string | null;
}

// ==================== USER ENGAGEMENT ====================

export interface UserFavorite {
  id: string;
  user_id: string;
  objective_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  objective_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  travel_date: string | null;
  helpful_count: number;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== ADMIN & CMS ====================

export interface MediaLibrary {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  used_in: string[];
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

// ==================== ANALYTICS ====================

export interface PageView {
  id: string;
  page_url: string;
  page_title: string | null;
  referrer: string | null;
  user_agent: string | null;
  ip_address: string | null;
  session_id: string | null;
  viewed_at: string;
}

// ==================== INPUT TYPES ====================

export type ObjectiveInput = Omit<
  Objective,
  'id' | 'created_at' | 'updated_at' | 'views_count' | 'likes_count'
>;

export type BlogArticleInput = Omit<
  BlogArticle,
  'id' | 'created_at' | 'updated_at' | 'views_count'
>;

export type JinfoursCircuitInput = Omit<
  JinfoursCircuit,
  'id' | 'created_at' | 'updated_at'
>;
