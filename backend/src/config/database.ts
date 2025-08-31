import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
export const supabaseConfig = {
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};

// Create Supabase client for anonymous operations
export const supabaseAnon: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

// Create Supabase client for admin operations (bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey
);

// Helper function to get authenticated client
export const getSupabaseClient = (accessToken?: string): SupabaseClient => {
  if (accessToken) {
    return createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
  return supabaseAnon;
};

export default {
  supabaseAnon,
  supabaseAdmin,
  getSupabaseClient,
};
