// src/app/admin/profile/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper function to create authenticated supabase client
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

// Update user's own profile (full name only)
export async function updateProfile(fullName: string) {
  const supabase = await createAuthClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // Validate input
  if (!fullName || fullName.trim().length === 0) {
    return { success: false, message: "Full name is required" };
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/profile");
  return { success: true, message: "Profile updated successfully!" };
}
