// src/app/admin/dashboard/components/QuickActions.tsx
"use client";

import Link from "next/link";
import { PlusCircle, Mail, Send, UserCog, Settings } from "lucide-react";

export default function QuickActions({
  isSuperAdmin,
}: {
  isSuperAdmin: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Link
        href="/admin/blog" // Redirects to blog list where "New Post" exists
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
      >
        <PlusCircle size={18} />
        <span>New Post</span>
      </Link>

      {/* Only show extra actions on larger screens to save space */}
      <div className="hidden sm:flex gap-2">
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="View Inquiries"
        >
          <Mail size={18} />
        </Link>

        {isSuperAdmin && (
          <>
            <Link
              href="/admin/newsletter"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Newsletter Campaigns"
            >
              <Send size={18} />
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Manage Users"
            >
              <UserCog size={18} />
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="System Settings"
            >
              <Settings size={18} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
