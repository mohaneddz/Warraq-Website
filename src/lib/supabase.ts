import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// This client is only ever imported by server components (src/lib/catalog.ts), so
// patching fetch with Next's `next` cache extension is safe here. Without this,
// every Supabase REST call defaults to no-store under Next 15 and re-hits the
// database on every request, even for pages that export `revalidate`. Tagging
// requests as "catalog" lets a future write path invalidate them on demand with
// revalidateTag("catalog") instead of waiting out the 5-minute window.
//
// Construction is deferred to first use (rather than a top-level const) so that
// importing this module never throws — Next's build-time "collect page data" step
// evaluates the whole module graph, and a missing env var there would otherwise
// abort the entire build instead of failing only the request that needs the client.
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          next: { revalidate: 300, tags: ["catalog"] },
        }),
    },
  });
  return client;
}
