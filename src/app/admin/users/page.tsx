"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { PlusCircle } from "lucide-react";
import CreateUserModal from "@/components/admin/CreateUserModal";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import UpdateUserModal from "@/components/admin/UpdateUserModal";
import { type UserProfile } from "@/types/user";
import { deleteUser } from "./actions";
import { useRouter } from "next/navigation";

// Helper component for styling status badges
const StatusBadge = ({ status }: { status: string | null }) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  switch (status) {
    case "active":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          Active
        </span>
      );
    case "inactive":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          Inactive
        </span>
      );
    case "suspended":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          Suspended
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          Unknown
        </span>
      );
  }
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const router = useRouter();

  // State for modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State to hold the user being acted upon
  const [userToUpdate, setUserToUpdate] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // State for async operations
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_all_users_with_profiles");

    if (error) {
      setError(
        "Could not fetch user data. You may not have the required permissions."
      );
      console.error("Error fetching users:", error);
    } else {
      setUsers(data as UserProfile[]);
      setError(null);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(user.id);

      // Fetch the current user's profile to check their role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError("Failed to verify your permissions.");
        setLoading(false);
        return;
      }

      // Check if user is super_admin
      if (profile.role !== "super_admin") {
        setError(
          "Access Denied. Only super administrators can access this page."
        );
        setLoading(false);
        return;
      }

      setCurrentUserRole(profile.role);
      await fetchUsers();
    };
    initializePage();
  }, [fetchUsers, supabase.auth, supabase, router]);

  // Handlers for opening modals
  const handleOpenUpdateModal = (user: UserProfile) => {
    setUserToUpdate(user);
    setIsUpdateModalOpen(true);
  };

  const handleOpenDeleteModal = (user: UserProfile) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    const result = await deleteUser(userToDelete.id);

    if (result.success) {
      fetchUsers(); // Refresh the user list
    } else {
      alert(`Failed to delete user: ${result.message}`);
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  if (loading) return <p className="p-4">Loading users...</p>;

  // Show error page if user doesn't have permission
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={20} />
          <span>Create New User</span>
        </button>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={fetchUsers}
      />

      <UpdateUserModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onUserUpdated={fetchUsers}
        userToUpdate={userToUpdate}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to permanently delete ${
          userToDelete?.full_name || userToDelete?.email
        }? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Full Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Role
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Last Sign In
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {user.full_name || "N/A"}
                </th>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-6 py-4">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-6 py-4 space-x-4 text-right">
                  <button
                    onClick={() => handleOpenUpdateModal(user)}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  {user.id !== currentUserId && (
                    <button
                      onClick={() => handleOpenDeleteModal(user)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
