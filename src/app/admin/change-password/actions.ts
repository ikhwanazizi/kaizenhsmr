// src/app/admin/change-password/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const supabase = await createAuthClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // Verify old password by trying to sign in with it
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: oldPassword,
  });

  if (signInError) {
    return { success: false, message: "Current password is incorrect" };
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  // Sign out the user
  await supabase.auth.signOut();

  return { success: true, message: "Password changed successfully!" };
}
