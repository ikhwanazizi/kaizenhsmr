// src/app/admin/audit-log/page.tsx
import { redirect } from "next/navigation";

import AuditLogTable, { type AuditLogEntry } from "./audit-log-table";
import { createClient } from "@/lib/server";

type UnauthorizedStateProps = {
  message: string;
};

function AccessDenied({ message }: UnauthorizedStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl dark:bg-slate-800">
        <div className="mb-4 text-6xl">🔒</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
          Access Denied
        </h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">{message}</p>
        <a
          href="/admin/dashboard"
          className="w-full inline-flex justify-center px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

async function getAuditLogs() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "super_admin") {
    return { logs: null as AuditLogEntry[] | null };
  }

  const { data: logData, error: logError } = await supabase
    .from("admin_audit_log")
    .select(
      `
        id,
        created_at,
        action,
        details,
        profiles (
          full_name
        )
      `
    )
    .order("created_at", { ascending: false });

  if (logError) {
    throw logError;
  }

  // FIX: Map the data to flatten the profiles array into a single object
  const logs: AuditLogEntry[] = (logData || []).map((log: any) => ({
    id: log.id,
    created_at: log.created_at,
    action: log.action,
    details: log.details,
    // Supabase often returns joined relations as arrays; extract the first one or return null
    profiles: Array.isArray(log.profiles)
      ? log.profiles[0] || null
      : log.profiles,
  }));

  return { logs };
}

export default async function AuditLogPage() {
  const { logs } = await getAuditLogs();

  if (!logs) {
    return (
      <AccessDenied message="Access Denied. Only super administrators can view this page." />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Admin Audit Log
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          A log of all important actions taken by administrators.
        </p>
      </div>

      <AuditLogTable logs={logs} />
    </div>
  );
}
