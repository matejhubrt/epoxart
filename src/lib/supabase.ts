import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/** False until the Supabase project is created and the two PUBLIC_ env vars are set. */
export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * One shared client. In the browser it keeps the owner's login session; on the
 * server (page rendering) it only ever reads public data, so nothing is persisted.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    const isServer = typeof window === "undefined";
    client = createClient(url!, anonKey!, {
      auth: { persistSession: !isServer, autoRefreshToken: !isServer, detectSessionInUrl: !isServer },
    });
  }
  return client;
}

export const MEDIA_BUCKET = "media";
