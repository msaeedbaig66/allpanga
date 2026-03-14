import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

function readConfig() {
  const meta = (name) =>
    document.querySelector(`meta[name="${name}"]`)?.getAttribute("content")?.trim();

  const url =
    globalThis.SUPABASE_URL ||
    globalThis.__ENV__?.SUPABASE_URL ||
    meta("SUPABASE_URL");

  const anonKey =
    globalThis.SUPABASE_ANON_KEY ||
    globalThis.__ENV__?.SUPABASE_ANON_KEY ||
    meta("SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase configuration. Provide SUPABASE_URL and SUPABASE_ANON_KEY at runtime."
    );
  }

  return { url, anonKey };
}

const { url, anonKey } = readConfig();

export const supabase = createClient(url, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
