import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function proxy(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/admin/login")
    ) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return response;
  }

  const cleanUrl = supabaseUrl
    .trim()
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");

  const supabase = createServerClient(cleanUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
