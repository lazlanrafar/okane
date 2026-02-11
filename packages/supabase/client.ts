import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

/**
 * Create a browser-side Supabase client.
 * Uses the anon key for restricted access based on RLS policies.
 */
export function createBrowserClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables",
    );
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey);
}
