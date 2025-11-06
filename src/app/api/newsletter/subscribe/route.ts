// src/app/api/newsletter/subscribe/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { render } from "@react-email/render";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 }
    );
  }

  try {
    // 1. Check if the user is already subscribed and verified
    const { data: existingSubscriber, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("status")
      .eq("email", email)
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.status === "subscribed") {
        return NextResponse.json(
          { message: "You are already subscribed." },
          { status: 409 }
        ); // 409 Conflict
      }
      if (existingSubscriber.status === "unverified") {
        return NextResponse.json(
          {
            message:
              "You have already signed up. Please check your email to verify.",
          },
          { status: 409 }
        );
      }
    }

    // 2. If not, insert a new record with 'unverified' status
    const { data: newSubscriber, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email, status: "unverified" })
      .select("verification_token")
      .single();

    if (insertError || !newSubscriber) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { message: "Could not subscribe. Please try again." },
        { status: 500 }
      );
    }

    const verificationToken = newSubscriber.verification_token;
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/verify?token=${verificationToken}`;

    const emailHtml = await render(VerificationEmail({ verificationUrl }));

    // 4. Send verification email using Resend
    const { data, error } = await resend.emails.send({
      from: "Kaizen Newsletter <onboarding@resend.dev>",
      to: email,
      subject: "Verify Your Newsletter Subscription",
      html: emailHtml,
    });

    // --- ✅ ADDED: Log this email send ---
    if (error) {
      console.error("Resend Error:", error);
      // Log failure
      await supabase.from("email_send_log").insert({
        email_type: "subscriber_verification",
        status: "failed",
        error_message: error.message,
      });
      return NextResponse.json({ message: error.message }, { status: 500 });
    } else {
      // Log success
      await supabase.from("email_send_log").insert({
        email_type: "subscriber_verification",
        status: "sent",
      });
    }
    // --- End of Log ---

    console.log("Resend Success Response:", data);

    return NextResponse.json(
      { message: "Subscription pending! Please check your email to verify." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Subscription process error:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}