// src/app/admin/newsletter/CampaignsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { CampaignWithDetails } from "./page";
import { cn } from "@/lib/utils";
import { Send, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"; // Import icons

// --- ✅ ADDED: Your StatCard component ---
function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-slate-800">
      <div className="flex items-center">
        <div className="p-2 mr-3 bg-blue-100 rounded-full dark:bg-blue-900">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
// --- END ---

// Helper to format dates
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

// Helper to generate a status badge
const StatusBadge = ({ status }: { status: string | null }) => {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full";
  let colorClasses = "";
  let text =
    (status || "unknown").charAt(0).toUpperCase() +
    (status || "unknown").slice(1);
  let icon = <Clock size={12} />;

  switch (status) {
    case "completed":
      colorClasses =
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      icon = <CheckCircle size={12} />;
      break;
    case "scheduled":
      colorClasses =
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      icon = <Clock size={12} />;
      break;
    case "in_progress":
      colorClasses =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
      text = "In Progress";
      break;
    case "failed":
      colorClasses =
        "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      icon = <AlertCircle size={12} />;
      break;
    default:
      colorClasses =
        "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
  }
  return (
    <span className={cn(baseClasses, colorClasses)}>
      {icon} {text}
    </span>
  );
};

export default function CampaignsClient({
  campaigns,
  stats, // <-- Receive stats as a prop
}: {
  campaigns: CampaignWithDetails[];
  stats: {
    totalCampaigns: number;
    totalSent: number;
    totalFailed: number;
  };
}) {
  const router = useRouter();

  const columns: Column<CampaignWithDetails>[] = [
    {
      key: "subject",
      label: "Subject",
      render: (campaign) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {campaign.subject}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (campaign) => <StatusBadge status={campaign.status} />,
    },
    {
      key: "recipients",
      label: "Recipients",
      render: (campaign) => (
        <div className="flex flex-col">
          <span className="text-slate-800 dark:text-slate-200">
            {campaign.sent_count || 0} sent
          </span>
          <span className="text-xs text-slate-500">
            {campaign.queued_count || 0} queued
          </span>
          <span className="text-xs text-red-400">
            {campaign.total_failed || 0} failed
          </span>
        </div>
      ),
    },
    {
      key: "total_recipients",
      label: "Total",
      sortable: true,
      render: (campaign) => (
        <span className="font-medium">{campaign.total_recipients}</span>
      ),
    },
    {
      key: "sent_by",
      label: "Sent By",
      render: (campaign) => (
        <span>{campaign.profiles?.full_name || "N/A"}</span>
      ),
    },
    {
      key: "scheduled_at",
      label: "Scheduled At",
      sortable: true,
      render: (campaign) => formatDate(campaign.scheduled_at),
    },
  ];

  return (
    <div className="space-y-6">
      {" "}
      {/* Added wrapper */}
      {/* --- ✅ ADDED: Your Stat Cards Grid --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={Send}
        />
        <StatCard
          title="Total Sent"
          value={stats.totalSent}
          icon={CheckCircle}
        />
        <StatCard
          title="Total Failed"
          value={stats.totalFailed}
          icon={XCircle}
        />
      </div>
      {/* --- END --- */}
      <DataTable
        data={campaigns}
        columns={columns}
        searchable={true}
        searchKeys={["subject", "status"]}
        pagination={true}
        itemsPerPage={15}
        onRowClick={(campaign) => {
          router.push(`/admin/newsletter/${campaign.id}`);
        }}
        emptyMessage="No campaigns found."
      />
    </div>
  );
}
