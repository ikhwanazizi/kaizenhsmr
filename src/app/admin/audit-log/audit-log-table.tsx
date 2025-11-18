// src/app/admin/audit-log/audit-log-table.tsx
"use client";

import DataTable, { type Column } from "@/components/shared/DataTable";

export type AuditLogEntry = {
  id: string;
  created_at: string | null;
  action: string;
  details: {
    message: string;
    [key: string]: any;
  } | null;
  profiles: {
    full_name: string | null;
  } | null;
};

type AuditLogTableProps = {
  logs: AuditLogEntry[];
};

export default function AuditLogTable({ logs }: AuditLogTableProps) {
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

  const columns: Column<AuditLogEntry>[] = [
    {
      key: "admin",
      label: "Admin",
      render: (log) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {log.profiles?.full_name || "System"}
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
      render: (log) => <span>{log.details?.message || "No message provided."}</span>,
    },
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      render: (log) => formatDate(log.created_at),
    },
  ];

  return (
    <DataTable
      data={logs}
      columns={columns}
      searchable={true}
      searchKeys={["action", "details", "profiles"]}
      pagination={true}
      itemsPerPage={20}
      emptyMessage="No audit logs found yet. Perform an action (like creating a user) to see it here."
    />
  );
}
