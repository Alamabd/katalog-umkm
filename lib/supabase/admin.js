import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createAdminClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY wajib diatur di environment variable."
    );
  }

  const cleanUrl = supabaseUrl
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");

  return createServerClient(cleanUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Method setAll dipanggil dari Server Component, abaikan jika ada proxy/middleware
        }
      },
    },
  });
}

export { createAdminClient as createSessionClient };
export default createAdminClient;
