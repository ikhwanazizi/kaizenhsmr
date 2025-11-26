// src/app/api/admin/contacts/route.ts
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

  // Get all cookies and find auth token
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

  // Get user profile with role
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

// GET - Fetch all contacts
export async function GET(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: contacts, error } = await supabaseAdmin
      .from("contacts")
      .select("*") 
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contacts:", error);
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error("Contacts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact (super_admin only)
export async function DELETE(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authData.profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can delete contacts" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // --- (FIXED) ADD AUDIT LOG ---
    // Get full contact details *before* deleting for a better log message
    const { data: contactToLog } = await supabaseAdmin
      .from("contacts")
      .select("full_name, business_email, company") // Get all the details
      .eq("id", id)
      .single();
    // --- END LOG ---

    const { error } = await supabaseAdmin
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contact:", error);
      return NextResponse.json(
        { error: "Failed to delete contact" },
        { status: 500 }
      );
    }

    // --- (FIXED) ADD AUDIT LOG ---
    // Create the new descriptive message
    const message = `Deleted contact: ${contactToLog?.full_name || "Unknown"} from ${contactToLog?.company || "Unknown"} (${contactToLog?.business_email || id})`;

    await supabaseAdmin.from("admin_audit_log").insert({
      admin_id: authData.user.id,
      action: "contact.delete",
      details: {
        message: message, // Use the new descriptive message
        contact_id: id,
        deleted_name: contactToLog?.full_name,
        deleted_email: contactToLog?.business_email,
        deleted_company: contactToLog?.company,
      },
    });
    // --- END LOG ---

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}