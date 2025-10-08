// src/app/api/admin/contacts/reply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Resend } from "resend";
import {
  replyEmailTemplate,
  type ReplyEmailData,
} from "@/lib/email-templates/reply-template";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
    .select("role, status, full_name, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "active") {
    return null;
  }

  return { user, profile };
}

// POST - Send reply (in-app method)
export async function POST(req: NextRequest) {
  try {
    const authData = await getAuthUser(req);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super_admin
    if (authData.profile.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super admins can send replies" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { contactId, replyMessage, replyMethod } = body;

    // Validate inputs
    if (!contactId || !replyMessage || !replyMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch contact details
    const { data: contact, error: contactError } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Insert reply into contact_replies table
    const { data: reply, error: replyError } = await supabaseAdmin
      .from("contact_replies")
      .insert({
        contact_id: contactId,
        reply_message: replyMessage,
        reply_method: replyMethod,
        replied_by: authData.user.id,
      })
      .select()
      .single();

    if (replyError) {
      console.error("Error saving reply:", replyError);
      return NextResponse.json(
        { error: "Failed to save reply" },
        { status: 500 }
      );
    }

    // If in-app method, send email
    if (replyMethod === "in_app") {
      try {
        const emailData: ReplyEmailData = {
          contactName: contact.full_name,
          contactEmail: contact.business_email,
          replyMessage: replyMessage,
          adminName: authData.profile.full_name || "KaizenHR Team",
          originalMessage: contact.message || "No message provided.",
        };

        // For testing: only send if recipient is verified or use your verified email
        const recipientEmail = contact.business_email;

        const { data: emailResult, error: emailError } =
          await resend.emails.send({
            from: "KaizenHR <onboarding@resend.dev>",
            to: recipientEmail,
            subject: `Re: Your KaizenHR Inquiry`,
            html: replyEmailTemplate(emailData),
          });

        if (emailError) {
          console.error("Resend Error:", emailError);
          console.error(
            "Note: Make sure the recipient email is verified in Resend for testing"
          );
          // Don't fail the request, reply is saved
        } else {
          console.log("Reply email sent successfully to:", recipientEmail);
          console.log("Email ID:", emailResult);
        }
      } catch (emailError) {
        console.error("Error sending reply email:", emailError);
        // Don't fail the request, reply is saved
      }
    }

    // Note: Status and last_reply_at are updated automatically by the trigger

    return NextResponse.json(
      {
        success: true,
        message: "Reply sent successfully",
        data: reply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reply API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Fetch all replies for a contact
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

    const { data: replies, error } = await supabaseAdmin
      .from("contact_replies")
      .select(
        `
        *,
        profiles:replied_by (
          full_name,
          email
        )
      `
      )
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching replies:", error);
      return NextResponse.json(
        { error: "Failed to fetch replies" },
        { status: 500 }
      );
    }

    return NextResponse.json({ replies }, { status: 200 });
  } catch (error) {
    console.error("Fetch replies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
