// src/types/profile.ts
export type ProfileData = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "super_admin";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  last_sign_in_at: string | null;
};
