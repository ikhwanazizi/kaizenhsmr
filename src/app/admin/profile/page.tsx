// src/app/admin/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User, Mail, Shield, Calendar, Clock, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ProfileData } from "@/types/profile";
import EditProfileModal from "@/components/admin/EditProfileModal";
import Toast from "@/components/shared/Toast";
import { updateProfile } from "./actions";

const StatusBadge = ({ status }: { status: string }) => {
  const baseClasses =
    "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";
  switch (status) {
    case "active":
      return (
        <span
          className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`}
        >
          Active
        </span>
      );
    case "inactive":
      return (
        <span
          className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}
        >
          Inactive
        </span>
      );
    case "suspended":
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}
        >
          Suspended
        </span>
      );
    default:
      return (
        <span
          className={`${baseClasses} bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300`}
        >
          Unknown
        </span>
      );
  }
};

const RoleBadge = ({ role }: { role: string }) => {
  const baseClasses =
    "px-2.5 py-1 text-xs font-semibold rounded-full inline-block";

  if (role === "super_admin") {
    return (
      <span
        className={`${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`}
      >
        Super Admin
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}
    >
      Admin
    </span>
  );
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, status, created_at")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("Failed to load profile data.");
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }

      // Get last sign in from auth.users
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_last_sign_in",
        { user_id: user.id }
      );

      if (userError) {
        console.error("Error fetching last sign in:", userError);
      }

      setProfile({
        ...profileData,
        last_sign_in_at: userData || null,
      } as ProfileData);

      setLoading(false);
    };

    fetchProfile();
  }, [supabase, router]);

  const handleSaveProfile = async (newName: string) => {
    setIsSaving(true);
    const result = await updateProfile(newName);
    setIsSaving(false);

    if (result.success) {
      setProfile((prev) => (prev ? { ...prev, full_name: newName } : null));
      setIsEditModalOpen(false);
      setToast({
        show: true,
        message: result.message,
        type: "success",
      });
    } else {
      setToast({
        show: true,
        message: result.message,
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 dark:text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-xl dark:bg-slate-800">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">
            Error Loading Profile
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            {error || "Unable to load your profile data."}
          </p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-full px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Profile
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View and manage your profile information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow dark:bg-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900/50">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div> */}
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {profile.full_name || "N/A"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                  {profile.role?.replace("_", " ")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Edit size={16} />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Personal Information */}
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <p className="text-slate-900 dark:text-white">
                  {profile.full_name || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <p className="text-slate-900 dark:text-white">
                  {profile.email}
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Role
                </label>
                <RoleBadge role={profile.role} />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Status
                </label>
                <StatusBadge status={profile.status} />
              </div>

              {/* Account Created */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Account Created
                </label>
                <p className="text-slate-900 dark:text-white">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Last Login */}
              <div>
                <label className="flex items-center mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Last Login
                </label>
                <p className="text-slate-900 dark:text-white">
                  {profile.last_sign_in_at
                    ? new Date(profile.last_sign_in_at).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={profile.full_name || ""}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </>
  );
}
