// src/components/admin/AdminSidebar.tsx
import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Users,
  UserCog,
  Settings,
} from "lucide-react"; // npm install lucide-react

export default async function AdminSidebar() {
  // Add 'await' here to resolve the Promise
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the user's profile to get their role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  return (
    <aside className="hidden w-64 p-4 text-white bg-gray-800 md:block dark:bg-gray-950">
      <div className="mb-8 text-2xl font-bold">
        <Link href="/admin">KaizenHRMS</Link>
      </div>
      <nav className="flex flex-col space-y-4">
        {/* OVERVIEW */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Overview
          </h3>
          <Link
            href="/admin/dashboard"
            className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* CONTENT */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Content
          </h3>
          <div className="space-y-1">
            <Link
              href="/admin/blog"
              className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
            >
              <FileText size={20} />
              <span>Blog Posts</span>
            </Link>
            <Link
              href="/admin/contacts"
              className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
            >
              <Mail size={20} />
              <span>Contacts</span>
            </Link>
            <Link
              href="/admin/subscribers"
              className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
            >
              <Users size={20} />
              <span>Subscribers</span>
            </Link>
          </div>
        </div>

        {/* ADMINISTRATION */}
        <div>
          <h3 className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Administration
          </h3>
          <div className="space-y-1">
            {/* This link is only visible to super admins */}
            {profile?.role === "super_admin" && (
              <Link
                href="/admin/users"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
              >
                <UserCog size={20} />
                <span>User Management</span>
              </Link>
            )}
            <Link
              href="/admin/settings"
              className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700"
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
