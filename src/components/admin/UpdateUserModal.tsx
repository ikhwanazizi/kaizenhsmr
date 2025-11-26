"use client";

import { updateUser } from "@/app/admin/users/actions";
import { type UserProfile } from "@/types/user";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  User,
  Mail,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setMessage(null);

    const result = await updateUser(formData);

    if (result.success) {
      onUserUpdated();
      onClose();
    } else {
      setMessage({
        type: "error",
        text: result.message || "Failed to update user.",
      });
    }
    setIsSubmitting(false);
  };

  if (!mounted || !isOpen || !userToUpdate) return null;

  const isTargetSuperAdmin = userToUpdate.role === "super_admin";

  const modalContent = (
    <>
      {/* FULL-SCREEN BACKDROP */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        {/* MODAL CARD */}
        <div
          className="pointer-events-auto relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all border border-slate-200 dark:border-slate-700"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Edit User
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Update details for{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {userToUpdate.email}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form ref={formRef} action={handleSubmit}>
            <input type="hidden" name="id" value={userToUpdate.id} />

            <div className="p-6 space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="fullName"
                    defaultValue={userToUpdate.full_name || ""}
                    required
                    className="block w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 transition-all"
                  />
                </div>
              </div>

              {/* Email (Read Only/Disabled logic based on role) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    defaultValue={userToUpdate.email || ""}
                    disabled={isTargetSuperAdmin}
                    readOnly={isTargetSuperAdmin}
                    required
                    className={`block w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 transition-all ${
                      isTargetSuperAdmin
                        ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
                        : ""
                    }`}
                  />
                </div>
                {isTargetSuperAdmin && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    Super admin email cannot be changed directly.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      name="role"
                      defaultValue={userToUpdate.role || "admin"}
                      disabled={isTargetSuperAdmin}
                      className={`block w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 transition-all appearance-none ${
                        isTargetSuperAdmin
                          ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
                          : ""
                      }`}
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Activity className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      name="status"
                      defaultValue={userToUpdate.status || "active"}
                      disabled={isTargetSuperAdmin}
                      className={`block w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm py-2.5 transition-all appearance-none ${
                        isTargetSuperAdmin
                          ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800"
                          : ""
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {message && (
                <div
                  className={`rounded-lg p-3 text-sm flex items-center gap-2 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {message.text}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
