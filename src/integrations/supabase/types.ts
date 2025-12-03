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
          changes_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          session_id?: string | null
          severity?: string | null
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
      blog_article_translations: {
        Row: {
          article_id: string
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          language: string
          meta_description: string | null
          meta_title: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          article_id: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language: string
          meta_description?: string | null
          meta_title?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_article_translations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "blog_articles"
            referencedColumns: ["id"]
          },
        ]
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
      community_challenges: {
        Row: {
          active: boolean | null
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at: string
          description: string
          end_date: string | null
          icon: string | null
          id: string
          order_index: number | null
          reward_badge_name: string | null
          reward_points: number | null
          reward_type: Database["public"]["Enums"]["reward_type"]
          start_date: string | null
          target_value: number
          title: string
        }
        Insert: {
          active?: boolean | null
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description: string
          end_date?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          reward_badge_name?: string | null
          reward_points?: number | null
          reward_type: Database["public"]["Enums"]["reward_type"]
          start_date?: string | null
          target_value: number
          title: string
        }
        Update: {
          active?: boolean | null
          challenge_type?: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          description?: string
          end_date?: string | null
          icon?: string | null
          id?: string
          order_index?: number | null
          reward_badge_name?: string | null
          reward_points?: number | null
          reward_type?: Database["public"]["Enums"]["reward_type"]
          start_date?: string | null
          target_value?: number
          title?: string
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
      content_revisions: {
        Row: {
          change_summary: string | null
          changed_at: string
          changed_by: string
          content_snapshot: Json
          entity_id: string
          entity_type: string
          id: string
          revision_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string
          changed_by: string
          content_snapshot: Json
          entity_id: string
          entity_type: string
          id?: string
          revision_number: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string
          changed_by?: string
          content_snapshot?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          revision_number?: number
        }
        Relationships: []
      }
      contest_submissions: {
        Row: {
          contest_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string
          objective_id: string | null
          title: string
          user_id: string
          votes_count: number | null
          winner_rank: number | null
        }
        Insert: {
          contest_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          objective_id?: string | null
          title: string
          user_id: string
          votes_count?: number | null
          winner_rank?: number | null
        }
        Update: {
          contest_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          objective_id?: string | null
          title?: string
          user_id?: string
          votes_count?: number | null
          winner_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_submissions_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "photo_contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_votes: {
        Row: {
          contest_id: string
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_votes_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "photo_contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "contest_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      continent_translations: {
        Row: {
          continent_id: string
          created_at: string | null
          description: string | null
          id: string
          language: string
          meta_description: string | null
          meta_title: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          continent_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          continent_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "continent_translations_continent_id_fkey"
            columns: ["continent_id"]
            isOneToOne: false
            referencedRelation: "continents"
            referencedColumns: ["id"]
          },
        ]
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
      country_translations: {
        Row: {
          country_id: string
          created_at: string | null
          description: string | null
          id: string
          language: string
          meta_description: string | null
          meta_title: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_translations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          moderator_ids: string[] | null
          name: string
          order_index: number
          posts_count: number
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          moderator_ids?: string[] | null
          name: string
          order_index?: number
          posts_count?: number
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          moderator_ids?: string[] | null
          name?: string
          order_index?: number
          posts_count?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          message: string
          post_id: string | null
          read: boolean
          reply_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message: string
          post_id?: string | null
          read?: boolean
          reply_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string
          post_id?: string | null
          read?: boolean
          reply_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string
          content: string
          created_at: string
          downvotes_count: number
          id: string
          last_activity_at: string
          locked: boolean
          pinned: boolean
          replies_count: number
          slug: string
          status: string
          title: string
          updated_at: string
          upvotes_count: number
          user_id: string
          views_count: number
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          downvotes_count?: number
          id?: string
          last_activity_at?: string
          locked?: boolean
          pinned?: boolean
          replies_count?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
          upvotes_count?: number
          user_id: string
          views_count?: number
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          downvotes_count?: number
          id?: string
          last_activity_at?: string
          locked?: boolean
          pinned?: boolean
          replies_count?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          upvotes_count?: number
          user_id?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          depth: number
          downvotes_count: number
          id: string
          parent_reply_id: string | null
          post_id: string
          status: string
          updated_at: string
          upvotes_count: number
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          depth?: number
          downvotes_count?: number
          id?: string
          parent_reply_id?: string | null
          post_id: string
          status?: string
          updated_at?: string
          upvotes_count?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          depth?: number
          downvotes_count?: number
          id?: string
          parent_reply_id?: string | null
          post_id?: string
          status?: string
          updated_at?: string
          upvotes_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reply_id: string | null
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reply_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reply_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          notify_replies: boolean | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_replies?: boolean | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_replies?: boolean | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_subscriptions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      guide_translations: {
        Row: {
          bio: string | null
          created_at: string | null
          full_name: string | null
          guide_id: string
          id: string
          language: string
          meta_description: string | null
          meta_title: string | null
          short_description: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          guide_id: string
          id?: string
          language: string
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          guide_id?: string
          id?: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_translations_guide_id_fkey"
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
          badge_color: string | null
          badge_text: string | null
          countries: string[] | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          discount_until: string | null
          duration_days: number | null
          external_url: string
          featured: boolean | null
          highlights: string[] | null
          id: string
          order_index: number
          original_price: number | null
          price_from: number | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          badge_text?: string | null
          countries?: string[] | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_until?: string | null
          duration_days?: number | null
          external_url: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          order_index?: number
          original_price?: number | null
          price_from?: number | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          badge_text?: string | null
          countries?: string[] | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          discount_until?: string | null
          duration_days?: number | null
          external_url?: string
          featured?: boolean | null
          highlights?: string[] | null
          id?: string
          order_index?: number
          original_price?: number | null
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
      journal_likes: {
        Row: {
          created_at: string
          id: string
          journal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_likes_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "travel_journals"
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
      objective_suggestions: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          id: string
          images: Json | null
          latitude: number | null
          location_city: string | null
          location_country: string
          longitude: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          suggested_types: string[] | null
          title: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          id?: string
          images?: Json | null
          latitude?: number | null
          location_city?: string | null
          location_country: string
          longitude?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_types?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: Json | null
          latitude?: number | null
          location_city?: string | null
          location_country?: string
          longitude?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          suggested_types?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      objective_translations: {
        Row: {
          accessibility_info: string | null
          best_season: string | null
          created_at: string | null
          description: string | null
          entrance_fee: string | null
          excerpt: string | null
          id: string
          language: string
          location_text: string | null
          meta_description: string | null
          meta_title: string | null
          objective_id: string
          opening_hours: string | null
          title: string
          updated_at: string | null
          visit_duration: string | null
        }
        Insert: {
          accessibility_info?: string | null
          best_season?: string | null
          created_at?: string | null
          description?: string | null
          entrance_fee?: string | null
          excerpt?: string | null
          id?: string
          language: string
          location_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          objective_id: string
          opening_hours?: string | null
          title: string
          updated_at?: string | null
          visit_duration?: string | null
        }
        Update: {
          accessibility_info?: string | null
          best_season?: string | null
          created_at?: string | null
          description?: string | null
          entrance_fee?: string | null
          excerpt?: string | null
          id?: string
          language?: string
          location_text?: string | null
          meta_description?: string | null
          meta_title?: string | null
          objective_id?: string
          opening_hours?: string | null
          title?: string
          updated_at?: string | null
          visit_duration?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_translations_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_type_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string
          name: string
          type_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          name: string
          type_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          name?: string
          type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_type_translations_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "objective_types"
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
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          continent_id: string | null
          country_id: string | null
          country_name: string | null
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
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          continent_id?: string | null
          country_id?: string | null
          country_name?: string | null
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
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          continent_id?: string | null
          country_id?: string | null
          country_name?: string | null
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
          created_at: string
          id: string
          ip_address: unknown
          page_title: string | null
          page_url: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown
          page_title?: string | null
          page_url: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown
          page_title?: string | null
          page_url?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      photo_contests: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string
          end_date: string
          id: string
          max_submissions_per_user: number | null
          prizes_description: string | null
          rules: string | null
          slug: string
          start_date: string
          status: Database["public"]["Enums"]["contest_status"]
          theme: string
          title: string
          updated_at: string
          voting_end_date: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description: string
          end_date: string
          id?: string
          max_submissions_per_user?: number | null
          prizes_description?: string | null
          rules?: string | null
          slug: string
          start_date: string
          status?: Database["public"]["Enums"]["contest_status"]
          theme: string
          title: string
          updated_at?: string
          voting_end_date: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string
          end_date?: string
          id?: string
          max_submissions_per_user?: number | null
          prizes_description?: string | null
          rules?: string | null
          slug?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contest_status"]
          theme?: string
          title?: string
          updated_at?: string
          voting_end_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          instagram_handle: string | null
          is_private: boolean | null
          location: string | null
          twitter_handle: string | null
          updated_at: string
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          instagram_handle?: string | null
          is_private?: boolean | null
          location?: string | null
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_private?: boolean | null
          location?: string | null
          twitter_handle?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
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
          travel_date: string | null
          updated_at: string
          user_id: string
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
          travel_date?: string | null
          updated_at?: string
          user_id: string
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
          travel_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["scheduled_action_type"]
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          error_message: string | null
          executed_at: string | null
          id: string
          metadata: Json | null
          scheduled_for: string
          status: Database["public"]["Enums"]["scheduled_action_status"]
          updated_at: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["scheduled_action_type"]
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          scheduled_for: string
          status?: Database["public"]["Enums"]["scheduled_action_status"]
          updated_at?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["scheduled_action_type"]
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          metadata?: Json | null
          scheduled_for?: string
          status?: Database["public"]["Enums"]["scheduled_action_status"]
          updated_at?: string
        }
        Relationships: []
      }
      seo_audit_issues: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          fix_suggestion: string | null
          id: string
          issue_type: string
          message: string
          report_id: string
          severity: Database["public"]["Enums"]["seo_issue_severity"]
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          fix_suggestion?: string | null
          id?: string
          issue_type: string
          message: string
          report_id: string
          severity: Database["public"]["Enums"]["seo_issue_severity"]
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          fix_suggestion?: string | null
          id?: string
          issue_type?: string
          message?: string
          report_id?: string
          severity?: Database["public"]["Enums"]["seo_issue_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "seo_audit_issues_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "seo_audit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_audit_reports: {
        Row: {
          created_by: string
          id: string
          issues_count: number
          metadata: Json | null
          overall_score: number
          scanned_at: string
          total_pages: number
        }
        Insert: {
          created_by: string
          id?: string
          issues_count: number
          metadata?: Json | null
          overall_score: number
          scanned_at?: string
          total_pages: number
        }
        Update: {
          created_by?: string
          id?: string
          issues_count?: number
          metadata?: Json | null
          overall_score?: number
          scanned_at?: string
          total_pages?: number
        }
        Relationships: []
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
      travel_journals: {
        Row: {
          comments_count: number | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          gallery_images: Json | null
          id: string
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string | null
          slug: string
          title: string
          trip_end_date: string | null
          trip_start_date: string | null
          updated_at: string
          user_id: string
          views_count: number | null
          visited_objectives: string[] | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          gallery_images?: Json | null
          id?: string
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          trip_end_date?: string | null
          trip_start_date?: string | null
          updated_at?: string
          user_id: string
          views_count?: number | null
          visited_objectives?: string[] | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          gallery_images?: Json | null
          id?: string
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          trip_end_date?: string | null
          trip_start_date?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
          visited_objectives?: string[] | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string
          id: string
          metadata: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_type: string
          banned_at: string
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          notes: string | null
          reason: string
          user_id: string
        }
        Insert: {
          ban_type: string
          banned_at?: string
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          reason: string
          user_id: string
        }
        Update: {
          ban_type?: string
          banned_at?: string
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          id: string
          reward_claimed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          reward_claimed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          reward_claimed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "community_challenges"
            referencedColumns: ["id"]
          },
        ]
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
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string
          level: number | null
          points_to_next_level: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          level?: number | null
          points_to_next_level?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          level?: number | null
          points_to_next_level?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reputation: {
        Row: {
          best_answer_count: number | null
          created_at: string | null
          helpful_count: number | null
          id: string
          posts_count: number | null
          replies_count: number | null
          reputation_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_answer_count?: number | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          posts_count?: number | null
          replies_count?: number | null
          reputation_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_answer_count?: number | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          posts_count?: number | null
          replies_count?: number | null
          reputation_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      award_badge: {
        Args: {
          p_badge_description: string
          p_badge_icon: string
          p_badge_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      award_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      can_edit_content: { Args: { _user_id: string }; Returns: boolean }
      expire_suspensions: { Args: never; Returns: undefined }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_user_banned: { Args: { _user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_action: string
          p_changes_data?: Json
          p_entity_id: string
          p_entity_type: string
          p_metadata?: Json
          p_severity?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type:
        | "favorite_added"
        | "review_posted"
        | "post_created"
        | "reply_created"
        | "journal_published"
        | "contest_submitted"
        | "challenge_completed"
        | "badge_earned"
      blog_category:
        | "călătorii"
        | "cultură"
        | "istorie"
        | "natură"
        | "gastronomie"
        | "aventură"
      challenge_type:
        | "visit_count"
        | "review_count"
        | "favorite_count"
        | "post_count"
        | "continent_explorer"
        | "unesco_hunter"
      contest_status: "upcoming" | "active" | "voting" | "ended"
      difficulty_level: "easy" | "moderate" | "difficult" | "extreme"
      reward_type: "badge" | "points" | "both"
      scheduled_action_status: "pending" | "executed" | "cancelled" | "failed"
      scheduled_action_type:
        | "publish"
        | "unpublish"
        | "feature"
        | "unfeature"
        | "archive"
      seo_issue_severity: "critical" | "warning" | "info"
      suggestion_status: "pending" | "approved" | "rejected"
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
      activity_type: [
        "favorite_added",
        "review_posted",
        "post_created",
        "reply_created",
        "journal_published",
        "contest_submitted",
        "challenge_completed",
        "badge_earned",
      ],
      blog_category: [
        "călătorii",
        "cultură",
        "istorie",
        "natură",
        "gastronomie",
        "aventură",
      ],
      challenge_type: [
        "visit_count",
        "review_count",
        "favorite_count",
        "post_count",
        "continent_explorer",
        "unesco_hunter",
      ],
      contest_status: ["upcoming", "active", "voting", "ended"],
      difficulty_level: ["easy", "moderate", "difficult", "extreme"],
      reward_type: ["badge", "points", "both"],
      scheduled_action_status: ["pending", "executed", "cancelled", "failed"],
      scheduled_action_type: [
        "publish",
        "unpublish",
        "feature",
        "unfeature",
        "archive",
      ],
      seo_issue_severity: ["critical", "warning", "info"],
      suggestion_status: ["pending", "approved", "rejected"],
      user_role_type: ["admin", "editor", "contributor", "user"],
    },
  },
} as const
