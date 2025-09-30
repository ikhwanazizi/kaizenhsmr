import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  console.log("MIDDLEWARE IS RUNNING FOR PATH:", req.nextUrl.pathname);

  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          req.cookies.set({ name, value: "", ...options });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("SESSION OBJECT:", session);

  const { pathname } = req.nextUrl;

  // 1. Redirect to login if user is not authenticated and trying to access admin routes
  if (!session && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. If user has a session, check their status and role in the profiles table
  if (session && pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", session.user.id)
      .single();

    console.log("USER PROFILE STATUS:", profile?.status);
    console.log("USER PROFILE ROLE:", profile?.role);

    // If user is not active, sign them out and redirect to login
    if (error || !profile || profile.status !== "active") {
      // Sign out the user
      await supabase.auth.signOut();

      // Clear all cookies
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");

      return response;
    }

    // Check role-based access for /admin/users path
    if (pathname.startsWith("/admin/users")) {
      if (profile.role !== "super_admin") {
        // Redirect non-super_admin users to dashboard
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  }

  // 3. Redirect to dashboard if user is authenticated and trying to access login page
  if (session && pathname === "/login") {
    // Still check status before redirecting
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", session.user.id)
      .single();

    if (profile?.status === "active") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else {
      // Sign out inactive/suspended users
      await supabase.auth.signOut();
      return res;
    }
  }

  return res;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
