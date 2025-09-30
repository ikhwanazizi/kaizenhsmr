"use client";

import { updateUser, resetUserPassword } from "@/app/admin/users/actions";
import { type UserProfile } from "@/types/user";
import { useRef, useState } from "react";

export default function UpdateUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  userToUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  userToUpdate: UserProfile | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    const result = await updateUser(formData);
    if (result.success) {
      onUserUpdated();
      onClose();
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  const handlePasswordReset = async () => {
    setMessage(null);
    if (userToUpdate?.email) {
      const result = await resetUserPassword(userToUpdate.email);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    }
  };

  if (!isOpen || !userToUpdate) return null;

  const isTargetSuperAdmin = userToUpdate.role === "super_admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold">
          Edit User: {userToUpdate.full_name || userToUpdate.email}
        </h2>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={userToUpdate.id} />

          <div>
            <label>Full Name</label>
            <input
              name="fullName"
              defaultValue={userToUpdate.full_name || ""}
              required
              className="w-full p-2 border"
            />
          </div>
          <div>
            <label>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={userToUpdate.email || ""}
              disabled={isTargetSuperAdmin}
              readOnly={isTargetSuperAdmin}
              required
              className="w-full p-2 border disabled:bg-gray-100"
            />
            {isTargetSuperAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                Super admin email cannot be changed.
              </p>
            )}
          </div>
          <div>
            <label>Role</label>
            <select
              name="role"
              defaultValue={userToUpdate.role || "admin"}
              disabled={isTargetSuperAdmin}
              className="w-full p-2 border disabled:bg-gray-100"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {isTargetSuperAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                Super admin roles cannot be changed.
              </p>
            )}
          </div>
          <div>
            <label>Status</label>
            <select
              name="status"
              defaultValue={userToUpdate.status || "active"}
              disabled={isTargetSuperAdmin}
              className="w-full p-2 border disabled:bg-gray-100"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            {isTargetSuperAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                Super admin status cannot be changed.
              </p>
            )}
          </div>

          {message && (
            <p
              className={
                message.type === "success" ? "text-green-600" : "text-red-600"
              }
            >
              {message.text}
            </p>
          )}

          <div className="pt-4 border-t flex justify-between items-center">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Send Password Reset
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
