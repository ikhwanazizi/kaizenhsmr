"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Inbox,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { createBrowserClient } from "@supabase/ssr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// --- Components ---

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
  href,
}: any) => (
  <Link href={href} className="block group">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>
          {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div
          className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  </Link>
);

const ActivityItem = ({ log }: { log: any }) => {
  const getActionColor = (action: string) => {
    if (action.includes("delete"))
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (action.includes("create"))
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (action.includes("update"))
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  };

  return (
    <div className="flex gap-4 p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div
        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${getActionColor(log.action).replace("bg-", "bg-").split(" ")[0]}`}
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {log.profiles?.full_name || "System"}{" "}
            <span className="text-slate-400 font-normal">performed</span>{" "}
            {log.action}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
            {new Date(log.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {typeof log.details === "string"
            ? log.details
            : log.details?.message || JSON.stringify(log.details)}
        </p>
      </div>
    </div>
  );
};

const ContactItem = ({ contact }: { contact: any }) => (
  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
        {contact.full_name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {contact.full_name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {contact.company}
        </p>
      </div>
    </div>
    <div className="text-right">
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${
          contact.status === "new"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        }`}
      >
        {contact.status.toUpperCase()}
      </span>
      <p className="text-xs text-slate-400 mt-1">
        {new Date(contact.created_at).toLocaleDateString()}
      </p>
    </div>
  </div>
);

// --- Chart Components ---

const SubscriberChart = ({ data }: { data: any[] }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-full">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Subscriber Growth
      </h3>
    </div>
    <div className="h-64 w-full">
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="subscribers"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          No subscriber data available
        </div>
      )}
    </div>
  </div>
);

const InquiryChart = ({ data }: { data: any[] }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-500" />
          Inquiry Status
        </h3>
      </div>
      <div className="h-64 w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No inquiry data available
          </div>
        )}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const init = async () => {
      // 1. Get User Name
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(" ")[0]); // First name
      }

      // 2. Fetch Dashboard Stats
      try {
        const res = await fetch("/api/admin/dashboard");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data?.stats || {};
  const chartData = data?.charts || { subscribers: [], inquiries: [] };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {userName} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here's what's happening with your system today.
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Subscribers"
          value={stats.totalSubscribers?.toLocaleString()}
          subtext="Newsletter audience"
          icon={Mail}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
          href="/admin/subscribers"
        />
        <StatCard
          title="Pending Inquiries"
          value={stats.newContacts?.toLocaleString()}
          subtext={`${stats.totalContacts} total messages`}
          icon={Inbox}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
          href="/admin/contacts"
        />
        <StatCard
          title="Blog Posts"
          value={stats.totalPosts?.toLocaleString()}
          subtext="Published content"
          icon={FileText}
          colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
          href="/admin/blog"
        />
        <StatCard
          title="System Users"
          value={stats.totalUsers?.toLocaleString()}
          subtext="Active admins"
          icon={Users}
          colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          href="/admin/users"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-blue-500" />
              Recent Inquiries
            </h2>
            <Link
              href="/admin/contacts"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1">
            {data?.recentContacts?.length > 0 ? (
              <div>
                {data.recentContacts.map((contact: any) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No recent inquiries found.
              </div>
            )}
          </div>
        </div>

        {/* System Activity (1/3 width) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </h2>
            <Link
              href="/admin/audit-log"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Logs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-1">
            {data?.recentActivity?.length > 0 ? (
              <div>
                {data.recentActivity.map((log: any) => (
                  <ActivityItem key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No recent activity recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row - MOVED DOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriberChart data={chartData.subscribers} />
        <InquiryChart data={chartData.inquiries} />
      </div>
    </div>
  );
}
