// src/components/admin/CreateUserModal.tsx
"use client";

import { createUser } from "@/app/admin/users/actions";
import { useRef, useState } from "react";

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated, // <-- 1. Accept the new prop
}: {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void; // <-- Define its type
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await createUser(formData);
    if (result.success) {
      onUserCreated(); // <-- 2. Call the function to refresh the user list
      formRef.current?.reset();
      onClose(); // Close the modal on success
    } else {
      setMessage(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg text-gray-700">
        <h2 className="mb-4 text-xl font-bold">Create New User</h2>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input
            name="fullName"
            placeholder="Full Name"
            required
            className="w-full p-2 border"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full p-2 border"
          />
          <select
            name="role"
            defaultValue="admin"
            className="w-full p-2 border"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            name="status"
            defaultValue="active"
            className="w-full p-2 border"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          {message && <p className="text-red-500">{message}</p>}
          <div className="flex justify-end space-x-2">
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
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
