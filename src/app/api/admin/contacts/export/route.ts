// src/app/api/admin/contacts/export/route.ts
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

// Convert data to CSV
function convertToCSV(contacts: any[]) {
  if (contacts.length === 0) return "";

  // Define CSV headers
  const headers = [
    "ID",
    "Full Name",
    "Email",
    "Contact Number",
    "Company",
    "Company Size",
    "Message",
    "Status",
    "Created At",
    "Reply Note",
    "Replied At",
    "Replied By",
  ];

  // Create CSV rows
  const rows = contacts.map((contact) => {
    return [
      contact.id,
      `"${contact.full_name.replace(/"/g, '""')}"`, // Escape quotes
      contact.business_email,
      contact.contact_number,
      `"${contact.company.replace(/"/g, '""')}"`,
      contact.company_size,
      `"${(contact.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Escape and remove newlines
      contact.status,
      new Date(contact.created_at).toLocaleString("en-MY", {
        timeZone: "Asia/Kuala_Lumpur",
      }),
      contact.reply_note
        ? `"${contact.reply_note.replace(/"/g, '""').replace(/\n/g, " ")}"`
        : "",
      contact.replied_at
        ? new Date(contact.replied_at).toLocaleString("en-MY", {
            timeZone: "Asia/Kuala_Lumpur",
          })
        : "",
      contact.profiles?.full_name || "",
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

export async function GET(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all contacts
    const { data: contacts, error } = await supabaseAdmin
      .from("contacts")
      .select(
        `
        *,
        profiles:replied_by (
          full_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contacts for export:", error);
      return NextResponse.json(
        { error: "Failed to fetch contacts" },
        { status: 500 }
      );
    }

    // Convert to CSV
    const csv = convertToCSV(contacts || []);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const filename = `contacts-export-${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
