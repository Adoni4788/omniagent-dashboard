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
      tasks: {
        Row: {
          id: string
          name: string
          status: string
          timestamp: string
          preview: string | null
          security_level: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          status?: string
          timestamp?: string
          preview?: string | null
          security_level?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          status?: string
          timestamp?: string
          preview?: string | null
          security_level?: string
          user_id?: string
        }
      }
      steps: {
        Row: {
          id: string
          task_id: string
          name: string
          action_type: string
          status: string
          log: string | null
        }
        Insert: {
          id?: string
          task_id: string
          name: string
          action_type: string
          status?: string
          log?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          name?: string
          action_type?: string
          status?: string
          log?: string | null
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          security_level: string
          notifications_enabled: boolean
          default_mode: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          security_level?: string
          notifications_enabled?: boolean
          default_mode?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          security_level?: string
          notifications_enabled?: boolean
          default_mode?: string
        }
      }
    }
  }
}

// Helper types for Supabase tables
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 