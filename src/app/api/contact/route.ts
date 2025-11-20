import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  userConfirmationTemplate,
  adminNotificationTemplate,
  type ContactFormData,
} from "@/lib/email-templates/contact-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client with Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );
  const data = await response.json();
  return data.success;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { formData, captchaToken } = body;

    if (!captchaToken) {
      return NextResponse.json({ error: "Captcha verification required" }, { status: 400 });
    }
    const isCaptchaValid = await verifyTurnstileToken(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
    }

    const requiredFields = ["fullName", "contactNumber", "company", "email", "companySize"];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const { data: contact, error: dbError } = await supabase
      .from("contacts")
      .insert({
        full_name: formData.fullName,
        contact_number: formData.contactNumber,
        company: formData.company,
        business_email: formData.email,
        company_size: formData.companySize,
        message: formData.message || "",
        status: "new",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to save contact information" }, { status: 500 });
    }

    // --- DYNAMIC SETTINGS ---
    const { data: settingsData } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["admin_notification_email", "email_sender_name", "email_sender_address"]);

    const settings: Record<string, string> = {};
    if (settingsData) {
      settingsData.forEach((s) => {
        try {
           const parsed = JSON.parse(s.value);
           settings[s.key] = typeof parsed === 'string' ? parsed : s.value;
        } catch {
           settings[s.key] = s.value;
        }
      });
    }

    const adminEmail = settings["admin_notification_email"] || "kaizenhrdev@kaizenhr.my";
    const senderName = settings["email_sender_name"] || "KaizenHR";
    // Hierarchy: DB Setting > Env Var > Fallback
    const senderEmail = settings["email_sender_address"] || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const fromAddress = `${senderName} <${senderEmail}>`;
    // ------------------------

    const contactData: ContactFormData = {
      fullName: formData.fullName,
      contactNumber: formData.contactNumber,
      company: formData.company,
      email: formData.email,
      companySize: formData.companySize,
      message: formData.message || "",
    };

    const emailLogs: any[] = [];

    try {
      const { error: userEmailError } = await resend.emails.send({
        from: fromAddress,
        to: formData.email,
        subject: "Thank You for Contacting KaizenHR",
        html: userConfirmationTemplate(contactData),
      });

      if (userEmailError) {
        console.error("Resend Error (User):", userEmailError);
        emailLogs.push({ email_type: "contact_reply", status: "failed", error_message: (userEmailError as Error).message });
      } else {
        emailLogs.push({ email_type: "contact_reply", status: "sent" });
      }
    } catch (emailError) {
      console.error("Error sending user confirmation email:", emailError);
      emailLogs.push({ email_type: "contact_reply", status: "failed", error_message: (emailError as Error).message });
    }

    try {
      const { error: adminEmailError } = await resend.emails.send({
        from: fromAddress,
        to: adminEmail,
        subject: `🔔 New Contact Form Submission from ${formData.company}`,
        html: adminNotificationTemplate(contactData),
      });
      if (adminEmailError) console.error("Resend Error (Admin):", adminEmailError);
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
    }

    if (emailLogs.length > 0) {
      await supabase.from("email_send_log").insert(emailLogs);
    }

    return NextResponse.json({ success: true, message: "Contact form submitted successfully", data: contact }, { status: 200 });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 });
  }
}