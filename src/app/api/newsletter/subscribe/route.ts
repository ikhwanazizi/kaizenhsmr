import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import VerificationEmail from "@/components/emails/VerificationEmail";
import { render } from "@react-email/render";

// Initialize Supabase client with Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // 1. Fetch Settings
    const { data: settingsData } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["enable_public_registration", "email_sender_name"]);

    const settings: Record<string, string> = {};
    if (settingsData) {
      settingsData.forEach((s) => {
        try {
           const parsed = JSON.parse(s.value);
           settings[s.key] = typeof parsed === 'string' ? parsed : String(parsed);
        } catch {
           settings[s.key] = s.value;
        }
      });
    }

    // 2. Check Feature Toggle
    if (settings["enable_public_registration"] === "false") {
      return NextResponse.json(
        { message: "New newsletter registrations are currently disabled." },
        { status: 403 }
      );
    }

    // 3. Determine Sender Details
    // IMPORTANT: On Resend Free Tier, you MUST send from 'onboarding@resend.dev'
    // unless you have verified your own domain.
    // We prioritize the environment variable RESEND_FROM_EMAIL if set.
    // Otherwise, we fallback to 'onboarding@resend.dev'.
    const senderEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const senderName = settings["email_sender_name"] || "KaizenHR";
    const fromAddress = `${senderName} <${senderEmail}>`;

    // 4. Check existing subscriber
    const { data: existingSubscriber, error: existingError } = await supabase
      .from("newsletter_subscribers")
      .select("status, id")
      .eq("email", email)
      .single();

    if (existingSubscriber) {
      if (existingSubscriber.status === "subscribed") {
        return NextResponse.json(
          { message: "You are already subscribed." },
          { status: 409 }
        );
      }
      // If unverified, we check if we should resend verification or just notify
      if (existingSubscriber.status === "unverified") {
        // Ideally, you might want a resend logic here. 
        // For now, we return the standard message.
        return NextResponse.json(
          {
            message:
              "You have already signed up. Please check your email to verify.",
          },
          { status: 409 }
        );
      }
    }

    // 5. Insert new subscriber (Unverified)
    const { data: newSubscriber, error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email, status: "unverified" })
      .select("verification_token, id")
      .single();

    if (insertError || !newSubscriber) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { message: "Could not subscribe. Please try again." },
        { status: 500 }
      );
    }

    // 6. Prepare Verification Email
    const verificationToken = newSubscriber.verification_token;
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/verify?token=${verificationToken}`;
    const emailHtml = await render(VerificationEmail({ verificationUrl }));

    // 7. Send Verification Email
    const { data, error } = await resend.emails.send({
      from: fromAddress, 
      to: email,
      subject: "Verify Your Newsletter Subscription",
      html: emailHtml,
    });

    // 8. Log Result & Handle Failure
    if (error) {
      console.error("Resend Error:", error);
      
      // CRITICAL FIX: If sending fails, delete the subscriber so they can try again later
      // otherwise they are stuck in "already signed up" limbo without an email.
      await supabase.from("newsletter_subscribers").delete().eq("id", newSubscriber.id);

      await supabase.from("email_send_log").insert({
        email_type: "subscriber_verification",
        status: "failed",
        error_message: error.message,
      });
      
      return NextResponse.json({ message: `Email sending failed: ${error.message}` }, { status: 500 });
    } else {
      await supabase.from("email_send_log").insert({
        email_type: "subscriber_verification",
        status: "sent",
      });
    }

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
