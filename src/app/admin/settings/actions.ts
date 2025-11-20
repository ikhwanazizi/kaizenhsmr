// src/app/admin/settings/actions.ts
"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

type SystemSettings = {
  [key: string]: string;
};

// Helper function to check if current user is super_admin
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

/**
 * Fetches all relevant system settings for the admin panel.
 * Only accessible by super admins.
 */
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
    // Existing
    "newsletter_daily_limit",
    "audit_log_retention_days",
    
    // Part 1: Contact & Company Information
    "contact_address",
    "contact_email",
    "contact_phone",
    "company_slogan",
    "company_founding_year",
    
    // Part 2: Social Media & App Links
    "social_links",
    "link_app_store",
    "link_google_play",
    
    // Part 3: Homepage - Hero Section
    "home_hero_video_id",
    
    // Part 4: Marketing Sections
    "marketing_award_image_1",
    "marketing_award_image_2",
    "marketing_trial_image",

    // Part 5: Integrations
    "integration_google_maps_embed",
    
    // Part 6: Footer
    "footer_copyright_text",

    // --- NEW APPROVED SETTINGS ---
    "blog_default_author_name",
    "user_ban_duration_hours",
    "admin_notification_email",
    "email_sender_name",
    "enable_maintenance_mode",
    "enable_public_registration"
  ];

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", settingsKeys);

  if (error) {
    return { success: false, settings: {}, message: error.message };
  }

  const settingsMap: SystemSettings = {};
  data.forEach((row) => {
    try {
      // Handle JSON strings if they were saved that way
      const parsed = JSON.parse(row.value as string);
      settingsMap[row.key] = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch (e) {
      settingsMap[row.key] = row.value as string;
    }
  });

  return { success: true, settings: settingsMap, message: "Settings fetched" };
}

/**
 * Updates a single system setting in the database.
 * Only accessible by super admins.
 */
export async function updateSystemSetting(key: string, value: string) {
  const supabase = await createClient();
  const authCheck = await checkSuperAdminAccess(supabase);
  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message };
  }

  // The value must be stored as a JSONB string
  const valueToSave = JSON.stringify(value);

  const { error } = await supabase
    .from("system_settings")
    .upsert({
      key: key,
      value: valueToSave as any,
      updated_by: authCheck.userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

  if (error) {
    return { success: false, message: error.message };
  }

  // Log this action
  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "settings.update",
    details: {
      message: `Updated setting: ${key}`,
      key,
      // value, // Omitted for brevity in logs if sensitive
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout"); 
  
  return { success: true, message: "Setting updated successfully" };
}