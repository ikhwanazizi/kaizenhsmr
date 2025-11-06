// src/app/admin/newsletter/[campaign_id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { Database } from "@/types/supabase";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  BarChart2,
  Eye,
  MousePointerClick,
  AlertOctagon,
} from "lucide-react";

// Types for our data
type Campaign = Database["public"]["Tables"]["newsletter_campaigns"]["Row"] & {
  profiles: { full_name: string | null } | null;
  posts: { slug: string; category: string } | null;
};
type SendLog = Database["public"]["Tables"]["newsletter_send_log"]["Row"];

// This type definition now matches the RPC function's return
type CampaignStats = {
  total_sent: number;
  total_failed: number;
  total_bounced: number;
  total_opened: number;
  total_clicked: number;
  success_rate: number;
};

// Simple Stat Card component
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

export default function CampaignDetailPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<SendLog[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaign_id as string;

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!campaignId) return;

    const checkRoleAndFetchData = async () => {
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

      // --- FIX 1: Handle null profile or role ---
      if (
        profileError ||
        !profile ||
        !profile.role ||
        !["admin", "super_admin"].includes(profile.role)
      ) {
        setError(
          "Access Denied. You do not have permission to view this page."
        );
        setLoading(false);
        return;
      }

      try {
        // 2. Fetch Campaign Details
        const { data: campaignData, error: campaignError } = await supabase
          .from("newsletter_campaigns")
          .select(
            `
            *,
            profiles (full_name),
            posts (slug, category)
          `
          )
          .eq("id", campaignId)
          .single();

        if (campaignError) throw new Error(campaignError.message);
        setCampaign(campaignData as Campaign);

        // 3. Fetch Campaign Stats
        const { data: statsData, error: statsError } = await supabase.rpc(
          "get_campaign_stats",
          { campaign_uuid: campaignId } // --- FIX 2: Use correct parameter name ---
        );

        if (statsError) throw new Error(statsError.message);

        // --- FIX 3: Manually construct the stats object to satisfy TypeScript ---
        if (statsData && statsData.length > 0) {
          const fetchedStats = statsData[0] as any; // Cast to any to bypass TS inference error
          setStats({
            total_sent: fetchedStats.total_sent || 0,
            total_failed: fetchedStats.total_failed || 0,
            total_bounced: fetchedStats.total_bounced || 0,
            total_opened: fetchedStats.total_opened || 0,
            total_clicked: fetchedStats.total_clicked || 0,
            success_rate: fetchedStats.success_rate || 0,
          });
        }

        // 4. Fetch Send Logs
        const { data: logsData, error: logsError } = await supabase
          .from("newsletter_send_log")
          .select("*")
          .eq("campaign_id", campaignId)
          .order("created_at", { ascending: false });

        if (logsError) throw new Error(logsError.message);
        setLogs(logsData || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch campaign details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndFetchData();
  }, [supabase, router, campaignId]);

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
  const columns: Column<SendLog>[] = [
    {
      key: "email",
      label: "Email",
      render: (log) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {log.email}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (log) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            log.status === "sent"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : log.status === "failed"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {log.status
            ? log.status.charAt(0).toUpperCase() + log.status.slice(1)
            : "N/A"}
        </span>
      ),
    },
    {
      key: "error_message",
      label: "Error Message",
      render: (log) => (
        <span className="text-xs text-red-600 dark:text-red-400">
          {log.error_message || "N/A"}
        </span>
      ),
    },
    {
      key: "sent_at",
      label: "Sent At",
      sortable: true,
      render: (log) => formatDate(log.sent_at || log.created_at),
    },
  ];

  if (loading) {
    return (
      <p className="p-4 text-slate-500 dark:text-slate-400">
        Loading campaign report...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Link
          href="/admin/newsletter"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </Link>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/newsletter"
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {campaign?.subject || "Campaign Report"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sent by {campaign?.profiles?.full_name || "Unknown"} on{" "}
          {formatDate(campaign?.sent_at || null)}{" "}
          {/* --- FIX 4: Handle undefined --- */}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Sent"
          value={stats?.total_sent || 0}
          icon={Send}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.success_rate || 0}%`}
          icon={BarChart2}
        />
        <StatCard
          title="Failed"
          value={stats?.total_failed || 0}
          icon={XCircle}
        />
        <StatCard
          title="Bounced"
          value={stats?.total_bounced || 0}
          icon={AlertOctagon}
        />
        <StatCard title="Opened" value={stats?.total_opened || 0} icon={Eye} />
        {/* <StatCard title="Clicked" value={stats?.total_clicked || 0} icon={MousePointerClick} /> */}
      </div>

      {/* Send Log Table */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          Delivery Log
        </h2>
        <DataTable
          data={logs}
          columns={columns}
          searchable={true}
          searchKeys={["email", "status", "error_message"]}
          pagination={true}
          itemsPerPage={10}
          emptyMessage="No send logs found for this campaign."
        />
      </div>
    </div>
  );
}
