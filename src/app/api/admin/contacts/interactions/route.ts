// src/app/api/admin/contacts/interactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Re-usable helper to get the authenticated user
async function getAuthUser(req: NextRequest) {
  const cookieStore = await cookies();
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

  if (!profile || profile.status !== "active") return null;
  return { user, profile };
}

// GET - Fetch all interactions for a contact
export async function GET(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Assuming you have a 'contact_interactions' table
    const { data: interactions, error } = await supabaseAdmin
      .from("contact_interactions")
      .select(
        `
        *,
        profiles (
          full_name,
          email
        )
      `
      )
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching interactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch interactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ interactions }, { status: 200 });
  } catch (error) {
    console.error("Fetch interactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a new note (as an interaction)
export async function POST(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { contactId, content } = body;

    if (!contactId || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert a 'note' type interaction
    const { data, error } = await supabaseAdmin
      .from("contact_interactions")
      .insert({
        contact_id: contactId,
        user_id: authData.user.id,
        interaction_type: "note",
        content: content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding note:", error);
      return NextResponse.json(
        { error: "Failed to add note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("Add note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
