import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for the browser
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'guest' | 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  approval_status: 'pending' | 'approved' | 'declined';
};

export type RegistrationRequest = {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
};

export type SavedQuery = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  query_content: any;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type QueryHistory = {
  id: string;
  user_id: string;
  query_content: any;
  results?: any;
  execution_time?: number;
  status: string;
  created_at: string;
};

export type UserSettings = {
  user_id: string;
  theme: string;
  notifications_enabled: boolean;
  default_query_limit: number;
  created_at: string;
  updated_at: string;
};