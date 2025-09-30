// src/types/user.ts
export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  last_sign_in_at: string | null;
  created_by_id: string | null;
  created_by_name: string | null;
};
