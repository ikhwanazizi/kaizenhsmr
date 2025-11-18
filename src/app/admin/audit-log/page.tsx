// src/app/admin/audit-log/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { Database } from "@/types/supabase";

// Define the type for our fetched log entry
type AuditLogEntry = {
  id: string;
  created_at: string | null;
  action: string;
  adminName: string;
  message: string;
  details: {
    message: string;
    [key: string]: any;
  } | null;
  profiles: {
    full_name: string | null;
  } | null;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkRoleAndFetchLogs = async () => {
      setLoading(true);

      // 1. Check user and role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile.role !== "super_admin") {
        setError(
          "Access Denied. Only super administrators can view this page."
        );
        setLoading(false);
        return;
      }

      // 2. Fetch logs if authorized
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
        setError(logError.message);
        console.error("Error fetching audit logs:", logError);
      } else {
        const transformedLogs = (logData ?? []).map((log) => ({
          ...(log as AuditLogEntry),
          adminName: log.profiles?.full_name || "System",
          message: log.details?.message || "No message provided.",
        }));

        setLogs(transformedLogs);
      }
      setLoading(false);
    };

    checkRoleAndFetchLogs();
  }, [supabase, router]);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define table columns
  const columns: Column<AuditLogEntry>[] = [
    {
      key: "admin",
      label: "Admin",
      render: (log) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {log.adminName}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (log) => (
        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
          {log.action}
        </code>
      ),
    },
    {
      key: "message",
      label: "Message",
      render: (log) => <span>{log.message}</span>,
    },
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (log) => formatDate(log.created_at),
    },
  ];

  if (loading) {
    return (
      <p className="p-4 text-slate-500 dark:text-slate-400">
        Loading audit logs...
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl dark:bg-slate-800">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
            Access Denied
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
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

      <DataTable
        data={logs}
        columns={columns}
        searchable={true}
        searchKeys={["action", "message", "adminName"]}
        pagination={true}
        itemsPerPage={20}
        emptyMessage="No audit logs found yet. Perform an action (like creating a user) to see it here."
      />
    </div>
  );
}
