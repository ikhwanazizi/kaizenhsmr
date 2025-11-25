import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // 1. Maintenance Mode Check (Uses Service Role to bypass RLS)
  if (
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/static") &&
    !pathname.includes(".") // Exclude images/css/etc
  ) {
    try {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { persistSession: false },
        }
      );

      const { data: setting } = await adminClient
        .from("system_settings")
        .select("value")
        .eq("key", "enable_maintenance_mode")
        .single();

      // Clean the value
      const isMaintenance =
        setting?.value === "true" || setting?.value === true || setting?.value === "\"true\"";

      if (isMaintenance) {
        return new NextResponse(
          `<!DOCTYPE html>
          <html>
            <head>
              <title>Maintenance</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; height: 100vh; justify-content: center; align-items: center; flex-direction: column; background: #fff; color: #111; text-align: center; padding: 20px; }
                h1 { margin-bottom: 1rem; font-size: 2rem; font-weight: 700; }
                p { color: #666; font-size: 1.1rem; }
              </style>
            </head>
            <body>
              <h1>We'll be right back.</h1>
              <p>The system is currently undergoing scheduled maintenance.</p>
            </body>
          </html>`,
          {
            status: 503,
            headers: { "content-type": "text/html" },
          }
        );
      }
    } catch (error) {
      console.error("Maintenance check failed:", error);
    }
  }

  // 2. Standard User Authentication
  let supabaseResponse = NextResponse.next({
    request: req,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          );
          
          // FIX: Iterate and set individually instead of using setAll if types are missing
          supabaseResponse = NextResponse.next({
            request: req,
          });
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser();

  // 3. Admin Route Protection
  if (!user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. Active Status & Role Checks
  if (user && pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", user.id)
      .single();

    if (error || !profile || profile.status !== "active") {
      await supabase.auth.signOut();
      const redirectUrl = new URL("/login", req.url);
      if (profile?.status === "suspended") redirectUrl.searchParams.set("error", "suspended");
      else if (profile?.status === "inactive") redirectUrl.searchParams.set("error", "inactive");
      
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith("/admin/users")) {
      if (profile.role !== "super_admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  }

  // 5. Redirect logged-in users away from login page
  if (user && pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "active") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};