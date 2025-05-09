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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'guest' | 'user' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'guest' | 'user' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'guest' | 'user' | 'admin'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registration_requests: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_queries: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          query_content: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          query_content: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          query_content?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      query_history: {
        Row: {
          id: string
          user_id: string
          query_content: Json
          results: Json | null
          execution_time: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query_content: Json
          results?: Json | null
          execution_time?: number | null
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query_content?: Json
          results?: Json | null
          execution_time?: number | null
          status?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          theme: string
          notifications_enabled: boolean
          default_query_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          default_query_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: string
          notifications_enabled?: boolean
          default_query_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      approve_registration: {
        Args: {
          request_id: string
          approved: boolean
          admin_id: string
        }
        Returns: void
      }
    }
  }
}