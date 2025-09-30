"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Users,
  UserCog,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

// Define a type for the profile for better type safety
type Profile = {
  role: "admin" | "super_admin";
};

export default function AdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // ADD THIS FIRST LOG
      console.log("User object from Supabase Auth:", user);
      setUser(user);
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // ADD THIS SECOND LOG
        console.log("Profile object fetched from profiles table:", profile);

        setProfile(profileData as Profile);
      }
    };
    fetchData();
  }, [supabase]);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 h-full w-64 p-4 text-white bg-gray-800
    transform transition-transform duration-300 ease-in-out
    md:relative md:translate-x-0
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  return (
    <>
      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-bold">
            <Link href="/admin">KaizenHRMS</Link>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="md:hidden">
            <X size={24} />
          </button>
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
          <div className="">
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

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}
