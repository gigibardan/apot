export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      authorized_guides: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          languages: string[] | null
          license_active: boolean | null
          license_expiry_date: string | null
          license_number: string | null
          phone: string | null
          region: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          languages?: string[] | null
          license_active?: boolean | null
          license_expiry_date?: string | null
          license_number?: string | null
          phone?: string | null
          region?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          languages?: string[] | null
          license_active?: boolean | null
          license_expiry_date?: string | null
          license_number?: string | null
          phone?: string | null
          region?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["blog_category"] | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          schema_data: Json | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          schema_data?: Json | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["blog_category"] | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          schema_data?: Json | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          ip_address: unknown
          message: string
          phone: string | null
          read_at: string | null
          replied_at: string | null
          status: string
          subject: string
          updated_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          ip_address?: unknown
          message: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          ip_address?: unknown
          message?: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      continents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          capital: string | null
          continent_id: string
          created_at: string
          currency: string | null
          description: string | null
          flag_emoji: string | null
          id: string
          image_url: string | null
          language: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          capital?: string | null
          continent_id: string
          created_at?: string
          currency?: string | null
          description?: string | null
          flag_emoji?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          capital?: string | null
          continent_id?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          flag_emoji?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_booking_requests: {
        Row: {
          admin_notes: string | null
          budget_range: string | null
          created_at: string | null
          destinations: string[] | null
          duration_days: number | null
          email: string
          full_name: string
          guide_id: string
          id: string
          ip_address: unknown
          language_preference: string | null
          number_of_people: number
          phone: string
          preferred_date: string
          read_at: string | null
          replied_at: string | null
          special_requests: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string | null
          destinations?: string[] | null
          duration_days?: number | null
          email: string
          full_name: string
          guide_id: string
          id?: string
          ip_address?: unknown
          language_preference?: string | null
          number_of_people: number
          phone: string
          preferred_date: string
          read_at?: string | null
          replied_at?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget_range?: string | null
          created_at?: string | null
          destinations?: string[] | null
          duration_days?: number | null
          email?: string
          full_name?: string
          guide_id?: string
          id?: string
          ip_address?: unknown
          language_preference?: string | null
          number_of_people?: number
          phone?: string
          preferred_date?: string
          read_at?: string | null
          replied_at?: string | null
          special_requests?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_booking_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string | null
          guide_id: string
          guide_response: string | null
          guide_response_date: string | null
          helpful_count: number | null
          id: string
          rating: number
          title: string | null
          travel_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          guide_id: string
          guide_response?: string | null
          guide_response_date?: string | null
          helpful_count?: number | null
          id?: string
          rating: number
          title?: string | null
          travel_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string | null
          guide_id?: string
          guide_response?: string | null
          guide_response_date?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number
          title?: string | null
          travel_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          active: boolean | null
          availability_calendar_url: string | null
          bio: string | null
          contact_count: number | null
          created_at: string | null
          created_by: string | null
          email: string | null
          featured: boolean | null
          full_name: string
          geographical_areas: string[] | null
          id: string
          languages: string[] | null
          meta_description: string | null
          meta_title: string | null
          phone: string | null
          price_per_day: number | null
          price_per_group: number | null
          profile_image: string | null
          rating_average: number | null
          reviews_count: number | null
          short_description: string | null
          slug: string
          specializations: string[] | null
          updated_at: string | null
          updated_by: string | null
          verification_date: string | null
          verification_notes: string | null
          verified: boolean | null
          views_count: number | null
          website_url: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          active?: boolean | null
          availability_calendar_url?: string | null
          bio?: string | null
          contact_count?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          featured?: boolean | null
          full_name: string
          geographical_areas?: string[] | null
          id?: string
          languages?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          phone?: string | null
          price_per_day?: number | null
          price_per_group?: number | null
          profile_image?: string | null
          rating_average?: number | null
          reviews_count?: number | null
          short_description?: string | null
          slug: string
          specializations?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verified?: boolean | null
          views_count?: number | null
          website_url?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          active?: boolean | null
          availability_calendar_url?: string | null
          bio?: string | null
          contact_count?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          featured?: boolean | null
          full_name?: string
          geographical_areas?: string[] | null
          id?: string
          languages?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          phone?: string | null
          price_per_day?: number | null
          price_per_group?: number | null
          profile_image?: string | null
          rating_average?: number | null
          reviews_count?: number | null
          short_description?: string | null
          slug?: string
          specializations?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
          verification_date?: string | null
          verification_notes?: string | null
          verified?: boolean | null
          views_count?: number | null
          website_url?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      guides_objectives_relations: {
        Row: {
          created_at: string | null
          guide_id: string
          id: string
          objective_id: string
        }
        Insert: {
          created_at?: string | null
          guide_id: string
          id?: string
          objective_id: string
        }
        Update: {
          created_at?: string | null
          guide_id?: string
          id?: string
          objective_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_objectives_relations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guides_objectives_relations_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      jinfotours_circuits: {
        Row: {
          countries: string[] | null
          created_at: string
          description: string | null
          duration_days: number | null
          external_url: string
          featured: boolean | null
          highlights: string[] | null
          id: string
          order_index: number
          price_from: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          countries?: string[] | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          external_url: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          order_index?: number
          price_from?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          countries?: string[] | null
          created_at?: string
          description?: string | null
          duration_days?: number | null
          external_url?: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          order_index?: number
          price_from?: number | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jinfotours_clicks: {
        Row: {
          circuit_id: string | null
          clicked_at: string
          id: string
          ip_address: unknown
          source_url: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          circuit_id?: string | null
          clicked_at?: string
          id?: string
          ip_address?: unknown
          source_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          circuit_id?: string | null
          clicked_at?: string
          id?: string
          ip_address?: unknown
          source_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jinfotours_clicks_circuit_id_fkey"
            columns: ["circuit_id"]
            isOneToOne: false
            referencedRelation: "jinfotours_circuits"
            referencedColumns: ["id"]
          },
        ]
      }
      media_library: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          uploaded_by: string | null
          used_in: string[] | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          filename: string
          height?: number | null
          id?: string
          mime_type: string
          original_filename: string
          uploaded_by?: string | null
          used_in?: string[] | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          uploaded_by?: string | null
          used_in?: string[] | null
          width?: number | null
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          click_count: number | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          open_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          click_count?: number | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          click_count?: number | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirm_token: string | null
          confirmed_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          metadata: Json | null
          source: string | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirm_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirm_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      objective_inquiries: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          ip_address: unknown
          message: string
          number_of_people: number | null
          objective_id: string
          phone: string | null
          read_at: string | null
          replied_at: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          visit_date: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          ip_address?: unknown
          message: string
          number_of_people?: number | null
          objective_id: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          ip_address?: unknown
          message?: string
          number_of_people?: number | null
          objective_id?: string
          phone?: string | null
          read_at?: string | null
          replied_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_inquiries_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_types: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number
          slug?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          accessibility_info: string | null
          best_season: string | null
          booking_url: string | null
          contact_email: string | null
          contact_phone: string | null
          continent_id: string | null
          country_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          entrance_fee: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          featured_until: string | null
          gallery_images: Json | null
          google_maps_url: string | null
          google_place_id: string | null
          id: string
          latitude: number | null
          likes_count: number | null
          location_text: string | null
          longitude: number | null
          meta_description: string | null
          meta_title: string | null
          opening_hours: string | null
          published: boolean | null
          published_at: string | null
          schema_data: Json | null
          slug: string
          title: string
          unesco_site: boolean | null
          unesco_year: number | null
          updated_at: string
          updated_by: string | null
          video_urls: Json | null
          views_count: number | null
          visit_duration: string | null
          website_url: string | null
        }
        Insert: {
          accessibility_info?: string | null
          best_season?: string | null
          booking_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          continent_id?: string | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          entrance_fee?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_until?: string | null
          gallery_images?: Json | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          likes_count?: number | null
          location_text?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          opening_hours?: string | null
          published?: boolean | null
          published_at?: string | null
          schema_data?: Json | null
          slug: string
          title: string
          unesco_site?: boolean | null
          unesco_year?: number | null
          updated_at?: string
          updated_by?: string | null
          video_urls?: Json | null
          views_count?: number | null
          visit_duration?: string | null
          website_url?: string | null
        }
        Update: {
          accessibility_info?: string | null
          best_season?: string | null
          booking_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          continent_id?: string | null
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          entrance_fee?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          featured_until?: string | null
          gallery_images?: Json | null
          google_maps_url?: string | null
          google_place_id?: string | null
          id?: string
          latitude?: number | null
          likes_count?: number | null
          location_text?: string | null
          longitude?: number | null
          meta_description?: string | null
          meta_title?: string | null
          opening_hours?: string | null
          published?: boolean | null
          published_at?: string | null
          schema_data?: Json | null
          slug?: string
          title?: string
          unesco_site?: boolean | null
          unesco_year?: number | null
          updated_at?: string
          updated_by?: string | null
          video_urls?: Json | null
          views_count?: number | null
          visit_duration?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objectives_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives_types_relations: {
        Row: {
          created_at: string
          id: string
          objective_id: string
          type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective_id: string
          type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          objective_id?: string
          type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "objectives_types_relations_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_types_relations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "objective_types"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          id: string
          ip_address: unknown
          page_title: string | null
          page_url: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown
          page_title?: string | null
          page_url: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown
          page_title?: string | null
          page_url?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved: boolean | null
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          objective_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          objective_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          approved?: boolean | null
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          objective_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          objective_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          objective_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          objective_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_content: { Args: { _user_id: string }; Returns: boolean }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      blog_category:
        | "călătorii"
        | "cultură"
        | "istorie"
        | "natură"
        | "gastronomie"
        | "aventură"
      difficulty_level: "easy" | "moderate" | "difficult" | "extreme"
      user_role_type: "admin" | "editor" | "contributor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      blog_category: [
        "călătorii",
        "cultură",
        "istorie",
        "natură",
        "gastronomie",
        "aventură",
      ],
      difficulty_level: ["easy", "moderate", "difficult", "extreme"],
      user_role_type: ["admin", "editor", "contributor", "user"],
    },
  },
} as const
