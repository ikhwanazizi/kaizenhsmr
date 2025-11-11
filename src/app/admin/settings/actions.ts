// src/app/admin/settings/actions.ts
"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

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
      message: authCheck.message || "Access denied.", // Add fallback
    };
  }

  const settingsKeys = [
    "newsletter_daily_limit",
    "audit_log_retention_days",
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
    // The value is stored as a JSON string (e.g., '"90"'), so we parse it.
    try {
      settingsMap[row.key] = JSON.parse(row.value as string);
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
    .update({
      value: valueToSave as any, // Cast to any to bypass strict type
      updated_by: authCheck.userId,
    })
    .eq("key", key);

  if (error) {
    return { success: false, message: error.message };
  }

  // Log this action to the audit log
  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "settings.update",
    details: {
      message: `Updated system setting: ${key} to ${value}`,
      key,
      value,
    },
  });

  revalidatePath("/admin/settings");
  return { success: true, message: "Setting updated successfully" };
}