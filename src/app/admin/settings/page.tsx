// src/app/admin/settings/page.tsx
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { getSystemSettings } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();

  // 1. Check user and role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only super admins can view this page
  if (profile?.role !== "super_admin") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  // 2. Fetch all settings
  const { settings, success, message } = await getSystemSettings();

  if (!success) {
    return (
      <div className="p-4 text-red-500">Error fetching settings: {message}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage system-wide settings and configurations.
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
