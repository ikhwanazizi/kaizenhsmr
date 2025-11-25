// src/app/admin/dashboard/page.tsx

import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { DashboardStat, ActivityItem } from "@/types/dashboard";
import Container from "@/components/layout/Container";
import DashboardStatsGrid from "./components/DashboardStatsGrid";
import ActivityTimeline from "./components/ActivityTimeline";
import ContactsTable from "./components/ContactsTable";
import QuickActions from "./components/QuickActions";
import SubscriberChart from "./components/SubscriberChart"; // New Import

export const metadata = {
  title: "Admin Dashboard | Kaizen",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Auth & Role Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    redirect("/");
  }

  const isSuperAdmin = profile.role === "super_admin";

  // 2. Parallel Data Fetching
  const [
    postsResult,
    contactsResult,
    subscribersResult,
    campaignsResult,
    quotaResult,
    settingsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, status, created_at, author_id")
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("contacts")
      .select("id, full_name, company, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),

    // Fetch ALL subscribers specifically to calculate growth chart
    supabase
      .from("newsletter_subscribers")
      .select("id, status, created_at")
      .order("created_at", { ascending: true }),

    supabase
      .from("newsletter_campaigns")
      .select(
        "id, subject, status, sent_at, total_sent, total_failed, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(5),

    supabase.rpc("get_remaining_daily_email_quota"),

    isSuperAdmin
      ? supabase.from("system_settings").select("key, value")
      : Promise.resolve({ data: null }),

    isSuperAdmin
      ? supabase
          .from("admin_audit_log")
          .select("id, action, details, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  // 3. Process Stats
  const posts = postsResult.data || [];
  const contacts = contactsResult.data || [];
  const subscribers = subscribersResult.data || [];
  const campaigns = campaignsResult.data || [];
  const remainingQuota =
    typeof quotaResult.data === "number" ? quotaResult.data : 0;

  // Calculate Stats
  const totalPosts = posts.length;
  const newContactsCount = contacts.filter((c) => c.status === "new").length;
  const totalSubscribers = subscribers.filter(
    (s) => s.status === "subscribed"
  ).length;

  // --- NEW: Process Chart Data ---
  // Group subscribers by month (Jan, Feb, Mar) and calculate cumulative sum
  const chartDataMap = new Map<string, number>();
  let cumulativeCount = 0;

  // 1. Initialize last 6 months with 0 if needed (optional, keeps chart looking full)
  // 2. Loop through subscribers
  subscribers.forEach((sub) => {
    if (sub.status !== "subscribed") return;

    const date = new Date(sub.created_at);
    const key = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }); // e.g. "Oct 24"

    // Since they are ordered by date, we can just increment a running total?
    // Actually, easiest is to count per month then running total.
    chartDataMap.set(key, (chartDataMap.get(key) || 0) + 1);
  });

  // Convert Map to Array and Calculate Cumulative
  let runningTotal = 0;
  const chartData = Array.from(chartDataMap.entries()).map(([date, count]) => {
    runningTotal += count;
    return { date, count: runningTotal };
  });

  // If empty, provide dummy data so the chart renders something pretty
  if (chartData.length === 0) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    months.forEach((m, i) => chartData.push({ date: m, count: i * 5 + 2 }));
  }

  const stats: DashboardStat[] = [
    {
      label: "Recent Posts",
      value: totalPosts,
      href: "/admin/blog",
      iconName: "FileText",
      color: "blue",
    },
    {
      label: "Pending Inquiries",
      value: newContactsCount,
      href: "/admin/contacts?filter=new",
      iconName: "Users",
      color: newContactsCount > 0 ? "yellow" : "green",
    },
    {
      label: "Active Subscribers",
      value: totalSubscribers,
      href: "/admin/subscribers",
      iconName: "Mail",
      color: "purple",
    },
    {
      label: "Last Campaign",
      value:
        campaigns[0]?.status === "sent" || campaigns[0]?.status === "completed"
          ? `${campaigns[0].total_sent} Sent`
          : campaigns[0]?.status || "No Data",
      href: "/admin/newsletter",
      iconName: "Activity",
      color: "green",
    },
  ];

  if (isSuperAdmin) {
    stats.push({
      label: "Email Quota",
      value: `${remainingQuota} Remaining`,
      href: "/admin/settings",
      iconName: "Server",
      color: remainingQuota < 20 ? "red" : "blue",
    });
  }

  // 4. Process Activity Timeline
  let activities: ActivityItem[] = [];

  posts.forEach((p) => {
    activities.push({
      id: p.id,
      type: "post",
      title: p.title,
      status: p.status || "draft",
      timestamp: p.created_at,
      href: `/admin/editor/${p.id}`,
    });
  });

  contacts.slice(0, 5).forEach((c) => {
    activities.push({
      id: c.id,
      type: "contact",
      title: `New inquiry from ${c.full_name}`,
      subtitle: c.company,
      status: c.status || "new",
      timestamp: c.created_at,
      href: `/admin/contacts`,
    });
  });

  campaigns.forEach((c) => {
    activities.push({
      id: c.id,
      type: "campaign",
      title: c.subject,
      status: c.status || "pending",
      timestamp: c.created_at,
      href: `/admin/newsletter/${c.id}`,
    });
  });

  if (isSuperAdmin && auditLogsResult.data) {
    auditLogsResult.data.forEach((log) => {
      activities.push({
        id: log.id,
        type: "audit_log",
        title: log.action,
        status: "info",
        timestamp: log.created_at,
        href: "/admin/audit-log",
      });
    });
  }

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  activities = activities.slice(0, 10);

  return (
    <Container className="py-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, {profile.full_name?.split(" ")[0] || "Admin"}. Here's
            what's happening today.
          </p>
        </div>
        <QuickActions isSuperAdmin={isSuperAdmin} />
      </div>

      {/* 1. Top Stats - Remains the same */}
      <DashboardStatsGrid stats={stats} />

      {/* 2. Middle: Subscriber Chart (Full Width) */}
      <div className="w-full">
        <SubscriberChart data={chartData} />
      </div>

      {/* 3. Bottom: Asymmetrical Split 
          Activity (Narrower: col-span-1) | Contacts (Wider: col-span-2) 
      */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Activity Timeline (Narrower) */}
        <div className="lg:col-span-1">
          <ActivityTimeline items={activities} />
        </div>

        {/* Right Column: Contacts Table (Wider) */}
        <div className="lg:col-span-2 space-y-8">
          <ContactsTable contacts={contacts.slice(0, 5)} />
        </div>
      </div>
    </Container>
  );
}
