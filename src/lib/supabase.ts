import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This client is only ever imported by server components (src/lib/catalog.ts), so
// patching fetch with Next's `next` cache extension is safe here. Without this,
// every Supabase REST call defaults to no-store under Next 15 and re-hits the
// database on every request, even for pages that export `revalidate`. Tagging
// requests as "catalog" lets a future write path invalidate them on demand with
// revalidateTag("catalog") instead of waiting out the 5-minute window.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input, {
        ...init,
        next: { revalidate: 300, tags: ["catalog"] },
      }),
  },
});
