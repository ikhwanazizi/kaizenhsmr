// src/app/api/admin/contacts/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get authenticated user
async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies();

  const allCookies = cookieStore.getAll();
  const authCookie = allCookies.find(
    (cookie) =>
      cookie.name.includes("auth-token") &&
      !cookie.name.includes("code-verifier")
  );

  if (!authCookie) {
    return null;
  }

  const { createServerClient } = await import("@supabase/ssr");

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active") {
    return null;
  }

  return { user, profile };
}

// PATCH - Update contact status
export async function PATCH(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contactId, status } = body;

    // Validate inputs
    if (!contactId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ["new", "contacted", "replied", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update status
    const { error } = await supabaseAdmin
      .from("contacts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", contactId);

    if (error) {
      console.error("Error updating status:", error);
      return NextResponse.json(
        { error: "Failed to update status" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Status updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
