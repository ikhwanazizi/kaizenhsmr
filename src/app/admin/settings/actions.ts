// src/app/admin/settings/actions.ts
"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

type SystemSettings = {
  [key: string]: string | number | boolean | object;
};

async function checkSuperAdminAccess(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, message: "Not authenticated", userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return {
      authorized: false,
      message: "Access denied. Super admin role required.",
      userId: user.id,
    };
  }

  return { authorized: true, userId: user.id };
}

export async function getSystemSettings(): Promise<{
  success: boolean;
  settings: SystemSettings;
  message: string;
}> {
  const supabase = await createClient();
  const authCheck = await checkSuperAdminAccess(supabase);
  if (!authCheck.authorized) {
    return {
      success: false,
      settings: {},
      message: authCheck.message || "Access denied.",
    };
  }

  const settingsKeys = [
    "newsletter_daily_limit",
    "audit_log_retention_days",
    "contact_address",
    "contact_email",
    "contact_phone",
    "company_slogan",
    "company_founding_year",
    "social_links",
    "link_app_store",
    "link_google_play",
    "home_hero_video_id",
    "marketing_award_image_1",
    "marketing_award_image_2",
    "marketing_trial_image",
    "integration_google_maps_embed",
    "footer_copyright_text",
    "blog_default_author_name",
    "user_ban_duration_hours",
    "admin_notification_email",
    "email_sender_name",
    "email_sender_address",
    "enable_maintenance_mode",
    "enable_public_registration",
  ];

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", settingsKeys);

  if (error || !data) {
    return { success: false, settings: {}, message: error?.message || "Failed to fetch settings" };
  }

  const settingsMap: SystemSettings = {};

  data.forEach((row) => {
    if (typeof row.value === "object" && row.value !== null) {
      settingsMap[row.key] = JSON.stringify(row.value);
    } else {
      settingsMap[row.key] = String(row.value ?? "");
    }
  });

  return { success: true, settings: settingsMap, message: "Settings fetched successfully" };
}

export async function updateSystemSetting(key: string, value: string) {
  const supabase = await createClient();
  const authCheck = await checkSuperAdminAccess(supabase);

  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message || "Unauthorized" };
  }

  let valueToSave: any = value;

  // Critical Fix: Save boolean toggles as actual booleans (not strings)
  if (key === "enable_maintenance_mode" || key === "enable_public_registration") {
    valueToSave = value === "true" || value === true;
  }
  // Handle JSON fields like social_links
  else if (key === "social_links" || key === "integration_google_maps_embed") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) || typeof parsed === "object") {
        valueToSave = parsed;
      }
    } catch {
      // If parsing fails, save as string (fallback)
      valueToSave = value;
    }
  }
  // All other fields: try to parse JSON, fallback to string
  else {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        valueToSave = parsed;
      }
    } catch {
      valueToSave = value;
    }
  }

  const { error } = await supabase
    .from("system_settings")
    .upsert(
      {
        key,
        value: valueToSave,
        updated_by: authCheck.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) {
    console.error("Supabase upsert error:", error);
    return { success: false, message: error.message };
  }

  // Log to audit
  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "settings.update",
    details: {
      message: `Updated setting: ${key}`,
      key,
      value: valueToSave,
    },
  });

  // Critical: Revalidate public pages so changes appear instantly
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { success: true, message: "Setting updated successfully" };
}