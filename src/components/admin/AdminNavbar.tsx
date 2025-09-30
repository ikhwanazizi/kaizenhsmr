"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";

// The prop is now named onMenuClick for clarity
export default function AdminNavbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white shadow-md sm:px-6 lg:px-8">
      <div className="flex items-center">
        {/* Hamburger Menu for Mobile */}
        <button
          onClick={onMenuClick} // This opens the sidebar
          className="mr-4 text-gray-700 md:hidden hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
        <div className="text-xl font-bold text-gray-800">
          <Link href="/admin/dashboard">KaizenHRMS</Link>
        </div>
      </div>

      {/* User Dropdown Menu on the right */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 py-2 font-semibold text-gray-700 rounded-md hover:bg-gray-100"
        >
          {user?.email || "Account"}
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <Link
                href="/admin/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                Profile Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
