/**
 * Database types manually created from supabase-schema.sql
 * These types mirror the database structure before connecting to the real database.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; // uuid
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          updated_at: string | null; // timestamp with time zone
        };
        Insert: {
          id: string; // uuid (references auth.users)
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string | null;
        };
      };
      packing_lists: {
        Row: {
          id: string; // uuid
          owner_id: string; // uuid (references profiles.id)
          name: string;
          description: string | null;
          is_public: boolean;
          created_at: string; // timestamp with time zone
          updated_at: string; // timestamp with time zone
        };
        Insert: {
          id?: string; // uuid (default gen_random_uuid())
          owner_id: string; // uuid
          name: string;
          description?: string | null;
          is_public?: boolean; // default false
          created_at?: string; // default now()
          updated_at?: string; // default now()
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      list_collaborators: {
        Row: {
          list_id: string; // uuid (references packing_lists.id)
          user_id: string; // uuid (references profiles.id)
          role: string; // 'editor' | 'viewer'
        };
        Insert: {
          list_id: string; // uuid
          user_id: string; // uuid
          role?: string; // default 'editor'
        };
        Update: {
          list_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      packing_items: {
        Row: {
          id: string; // uuid
          list_id: string; // uuid (references packing_lists.id)
          parent_id: string | null; // uuid (references packing_items.id) - recursive
          title: string;
          checked: boolean;
          position: number; // integer (for drag & drop sorting)
          created_at: string; // timestamp with time zone
          updated_at: string; // timestamp with time zone
        };
        Insert: {
          id?: string; // uuid (default gen_random_uuid())
          list_id: string; // uuid
          parent_id?: string | null; // uuid
          title: string;
          checked?: boolean; // default false
          position?: number; // default 0
          created_at?: string; // default now()
          updated_at?: string; // default now()
        };
        Update: {
          id?: string;
          list_id?: string;
          parent_id?: string | null;
          title?: string;
          checked?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PackingList = Database["public"]["Tables"]["packing_lists"]["Row"];
export type ListCollaborator = Database["public"]["Tables"]["list_collaborators"]["Row"];
export type PackingItem = Database["public"]["Tables"]["packing_items"]["Row"];

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type PackingListInsert = Database["public"]["Tables"]["packing_lists"]["Insert"];
export type ListCollaboratorInsert = Database["public"]["Tables"]["list_collaborators"]["Insert"];
export type PackingItemInsert = Database["public"]["Tables"]["packing_items"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type PackingListUpdate = Database["public"]["Tables"]["packing_lists"]["Update"];
export type ListCollaboratorUpdate = Database["public"]["Tables"]["list_collaborators"]["Update"];
export type PackingItemUpdate = Database["public"]["Tables"]["packing_items"]["Update"];

// Role type for collaborators
export type CollaboratorRole = "editor" | "viewer";
