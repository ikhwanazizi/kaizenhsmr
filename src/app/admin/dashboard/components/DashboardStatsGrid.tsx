// src/app/admin/dashboard/components/DashboardStatsGrid.tsx
"use client";

import { DashboardStat } from "@/types/dashboard";
import {
  FileText,
  Users,
  Mail,
  Activity,
  ShieldAlert,
  Server,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const iconMap = {
  FileText,
  Users,
  Mail,
  Activity,
  ShieldAlert,
  Server,
};

const colorMap = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  yellow:
    "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  purple:
    "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function DashboardStatsGrid({
  stats,
}: {
  stats: DashboardStat[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.iconName] || Activity;
        return (
          <Link
            key={index}
            href={stat.href}
            className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${colorMap[stat.color]}`}>
                <Icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              View details <ArrowRight size={12} className="ml-1" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
