import { createClient as supabaseCreateClient } from "@supabase/supabase-js";

/**
 * Create a server-side Supabase client.
 * Uses the service role key for full admin access.
 * Should only be used in server-side code (API routes, server components, etc.).
 */
export function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY environment variables",
    );
  }

  return supabaseCreateClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
