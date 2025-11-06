// src/app/admin/newsletter/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { Database } from "@/types/supabase";
import { ArrowRight, Send, CheckCircle, XCircle } from "lucide-react";

// Define the type for our fetched campaign entry
type CampaignEntry = {
  id: string;
  created_at: string | null;
  subject: string;
  status: string | null;
  total_sent: number | null;
  total_failed: number | null;
  sent_at: string | null;
  profiles: {
    full_name: string | null;
  } | null;
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

export default function NewsletterPage() {
  const [campaigns, setCampaigns] = useState<CampaignEntry[]>([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalSent: 0,
    totalFailed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
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

      // 2. Fetch campaign data if authorized
      const { data: campaignData, error: campaignError } = await supabase
        .from("newsletter_campaigns")
        .select(
          `
          id,
          created_at,
          subject,
          status,
          total_sent,
          total_failed,
          sent_at,
          profiles (
            full_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (campaignError) {
        setError(campaignError.message);
        console.error("Error fetching newsletter campaigns:", campaignError);
      } else {
        const campaignEntries = campaignData as CampaignEntry[];
        setCampaigns(campaignEntries);

        // Calculate stats
        let totalSent = 0;
        let totalFailed = 0;
        campaignEntries.forEach((campaign) => {
          totalSent += campaign.total_sent || 0;
          totalFailed += campaign.total_failed || 0;
        });

        setStats({
          totalCampaigns: campaignEntries.length,
          totalSent,
          totalFailed,
        });
      }
      setLoading(false);
    };

    checkRoleAndFetchData();
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
  const columns: Column<CampaignEntry>[] = [
    {
      key: "subject",
      label: "Campaign Title",
      render: (
        campaign // <-- THIS IS THE FIX. The "S" is removed.
      ) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {campaign.subject || "Untitled Campaign"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (campaign) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            campaign.status === "completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : campaign.status === "failed"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : campaign.status === "scheduled"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}
        >
          {campaign.status
            ? campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)
            : "N/A"}
        </span>
      ),
    },
    {
      key: "sent",
      label: "Sent",
      render: (campaign) => <span>{campaign.total_sent || 0}</span>,
    },
    {
      key: "failed",
      label: "Failed",
      render: (campaign) => (
        <span className={campaign.total_failed ? "text-red-600" : ""}>
          {campaign.total_failed || 0}
        </span>
      ),
    },
    {
      key: "sent_at",
      label: "Sent At",
      sortable: true,
      render: (campaign) => formatDate(campaign.sent_at || campaign.created_at),
    },
    {
      key: "sent_by",
      label: "Sent By",
      render: (campaign) => (
        <span>{campaign.profiles?.full_name || "N/A"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (campaign) => (
        <Link
          href={`/admin/newsletter/${campaign.id}`}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Report
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <p className="p-4 text-slate-500 dark:text-slate-400">
        Loading newsletter campaigns...
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
          Newsletter Campaigns
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          View all past, present, and scheduled newsletter sends.
        </p>
      </div>

      {/* Stats Cards */}
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

      <DataTable
        data={campaigns}
        columns={columns}
        searchable={true}
        searchKeys={["subject", "status", "profiles"]}
        pagination={true}
        itemsPerPage={10}
        emptyMessage="No newsletter campaigns found yet. Send a newsletter from a blog post to see it here."
      />
    </div>
  );
}
