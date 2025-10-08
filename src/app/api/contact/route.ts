// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  userConfirmationTemplate,
  adminNotificationTemplate,
  type ContactFormData,
} from "@/lib/email-templates/contact-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify Cloudflare Turnstile token
async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    // Validate captcha token
    if (!captchaToken) {
      return NextResponse.json(
        { error: "Captcha verification required" },
        { status: 400 }
      );
    }

    const isCaptchaValid = await verifyTurnstileToken(captchaToken);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { error: "Captcha verification failed. Please try again." },
        { status: 400 }
      );
    }

    // Validate form data
    const requiredFields = [
      "fullName",
      "contactNumber",
      "company",
      "email",
      "companySize",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Insert into Supabase
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
      return NextResponse.json(
        { error: "Failed to save contact information" },
        { status: 500 }
      );
    }

    // Prepare email data
    const contactData: ContactFormData = {
      fullName: formData.fullName,
      contactNumber: formData.contactNumber,
      company: formData.company,
      email: formData.email,
      companySize: formData.companySize,
      message: formData.message || "",
    };

    // Send confirmation email to user
    try {
      const { data: userData, error: userEmailError } =
        await resend.emails.send({
          from: "KaizenHR <onboarding@resend.dev>",
          to: formData.email,
          subject: "Thank You for Contacting KaizenHR",
          html: userConfirmationTemplate(contactData),
        });

      if (userEmailError) {
        console.error("Resend Error (User):", userEmailError);
      } else {
        console.log("User confirmation email sent:", userData);
      }
    } catch (emailError) {
      console.error("Error sending user confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    // Send notification to super admin
    try {
      const { data: adminData, error: adminEmailError } =
        await resend.emails.send({
          from: "KaizenHR Notifications <onboarding@resend.dev>",
          to: "ikhwan0059@gmail.com",
          subject: `🔔 New Contact Form Submission from ${formData.company}`,
          html: adminNotificationTemplate(contactData),
        });

      if (adminEmailError) {
        console.error("Resend Error (Admin):", adminEmailError);
      } else {
        console.log("Admin notification email sent:", adminData);
      }
    } catch (emailError) {
      console.error("Error sending admin notification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Contact form submitted successfully",
        data: contact,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
