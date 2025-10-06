// src/app/api/newsletter/unsubscribe/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  if (!id) {
    return NextResponse.redirect(
      `${siteUrl}/newsletter/unsubscribe?status=error&message=Invalid link: ID is missing.`
    );
  }

  try {
    // STEP 1: First, find the subscriber by their ID.
    const { data: subscriber, error: findError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("status")
      .eq("id", id)
      .single();

    // If no subscriber is found, the link is invalid.
    if (findError || !subscriber) {
      console.error("Unsubscribe find error:", findError);
      return NextResponse.redirect(
        `${siteUrl}/newsletter/unsubscribe?status=error&message=This unsubscribe link is invalid.`
      );
    }

    // STEP 2: Check if they are already unsubscribed. If so, it's a success.
    if (subscriber.status === "unsubscribed") {
      return NextResponse.redirect(
        `${siteUrl}/newsletter/unsubscribe?status=success`
      );
    }

    // STEP 3: If they are not unsubscribed, update their status.
    const { error: updateError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("id", id);

    // If the update itself fails, it's an error.
    if (updateError) {
      console.error("Unsubscribe update error:", updateError);
      return NextResponse.redirect(
        `${siteUrl}/newsletter/unsubscribe?status=error&message=Could not process your request.`
      );
    }

    // If we get here, the update was successful.
    return NextResponse.redirect(
      `${siteUrl}/newsletter/unsubscribe?status=success`
    );
  } catch (error) {
    console.error("Unsubscribe process error:", error);
    return NextResponse.redirect(
      `${siteUrl}/newsletter/unsubscribe?status=error&message=An unexpected error occurred.`
    );
  }
}
