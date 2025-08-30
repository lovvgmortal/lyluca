export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      folders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      keyword_styles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          prompt: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          prompt: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "keyword_styles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          gemini_api_key: string | null
          openrouter_api_key: string | null
          primary_provider: "gemini" | "openrouter" | null
          role: "admin" | "manager" | "content_creator" | "editor" | null
          full_name: string | null
          email: string | null
          youtube_api_key: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          gemini_api_key?: string | null
          openrouter_api_key?: string | null
          primary_provider?: "gemini" | "openrouter" | null
          role?: "admin" | "manager" | "content_creator" | "editor" | null
          full_name?: string | null
          email?: string | null
          youtube_api_key?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          gemini_api_key?: string | null
          openrouter_api_key?: string | null
          primary_provider?: "gemini" | "openrouter" | null
          role?: "admin" | "manager" | "content_creator" | "editor" | null
          full_name?: string | null
          email?: string | null
          youtube_api_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      scripts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          ai_title: string | null
          summary: string
          script: string
          timeline: Json | null
          mode: "generate" | "rewrite" | "keyword" | "note" | null
          idea_prompt: string | null
          generated_outline: string | null
          script_prompt: string | null
          original_script: string | null
          folder_id: string | null
          split_script: Json | null
          pacing: Json | null
          status: "todo" | "content_creation" | "ready_for_edit" | "editing" | "ready_to_publish" | "published" | null
          assigned_to: string | null
          assigned_at: string | null
          completed_at: string | null
          last_modified_by: string | null
          note: string | null
          published_at: string | null
          youtube_link: string | null
          content_creator_id: string | null
          editor_id: string | null
          content_assigned_at: string | null
          content_completed_at: string | null
          youtube_title: string | null
          youtube_views: number | null
          youtube_likes: number | null
          youtube_comments: number | null
          youtube_stats_last_updated: string | null
          youtube_thumbnail_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title?: string
          ai_title?: string | null
          summary?: string
          script?: string
          timeline?: Json | null
          mode?: "generate" | "rewrite" | "keyword" | "note" | null
          idea_prompt?: string | null
          generated_outline?: string | null
          script_prompt?: string | null
          original_script?: string | null
          folder_id?: string | null
          split_script?: Json | null
          pacing?: Json | null
          status?: "todo" | "content_creation" | "ready_for_edit" | "editing" | "ready_to_publish" | "published" | null
          assigned_to?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          last_modified_by?: string | null
          note?: string | null
          published_at?: string | null
          youtube_link?: string | null
          content_creator_id?: string | null
          editor_id?: string | null
          content_assigned_at?: string | null
          content_completed_at?: string | null
          youtube_title?: string | null
          youtube_views?: number | null
          youtube_likes?: number | null
          youtube_comments?: number | null
          youtube_stats_last_updated?: string | null
          youtube_thumbnail_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          ai_title?: string | null
          summary?: string
          script?: string
          timeline?: Json | null
          mode?: "generate" | "rewrite" | "keyword" | "note" | null
          idea_prompt?: string | null
          generated_outline?: string | null
          script_prompt?: string | null
          original_script?: string | null
          folder_id?: string | null
          split_script?: Json | null
          pacing?: Json | null
          status?: "todo" | "content_creation" | "ready_for_edit" | "editing" | "ready_to_publish" | "published" | null
          assigned_to?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          last_modified_by?: string | null
          note?: string | null
          published_at?: string | null
          youtube_link?: string | null
          content_creator_id?: string | null
          editor_id?: string | null
          content_assigned_at?: string | null
          content_completed_at?: string | null
          youtube_title?: string | null
          youtube_views?: number | null
          youtube_likes?: number | null
          youtube_comments?: number | null
          youtube_stats_last_updated?: string | null
          youtube_thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_folder_id_fkey"
            columns: ["folder_id"]
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_last_modified_by_fkey"
            columns: ["last_modified_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_content_creator_id_fkey"
            columns: ["content_creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scripts_editor_id_fkey"
            columns: ["editor_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      styles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          prompt: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          prompt: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "styles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_content: {
        Args: {
          script_id_to_complete: string
        }
        Returns: undefined
      }
      complete_editing: {
        Args: {
          script_id_to_complete: string
        }
        Returns: undefined
      }
      publish_script: {
        Args: {
          script_id_to_publish: string
        }
        Returns: undefined
      }
      start_content_creation: {
        Args: {
          script_id_to_start: string
        }
        Returns: undefined
      }
      start_editing: {
        Args: {
          script_id_to_start: string
        }
        Returns: undefined
      }
    }
    Enums: {
      script_mode: "generate" | "rewrite" | "keyword" | "note"
      provider_type: "gemini" | "openrouter"
      user_role: "admin" | "manager" | "content_creator" | "editor"
      script_status: "todo" | "content_creation" | "ready_for_edit" | "editing" | "ready_to_publish" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}