// src/app/admin/users/actions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Helper function to create admin supabase client
async function createAdminClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

// Helper function to check if current user is super_admin
async function checkSuperAdminAccess() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, message: "Not authenticated", userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return {
      authorized: false,
      message: "Access denied. Super admin role required.",
      userId: user.id,
    };
  }

  return { authorized: true, userId: user.id };
}

// Create the new user function
export async function createUser(formData: FormData) {
  // Check authorization first
  const authCheck = await checkSuperAdminAccess();
  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message };
  }

  const supabase = await createAdminClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;

  // Create the new user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

  if (authError) {
    return { success: false, message: authError.message };
  }

  // The trigger already created a profile, now we update it
  if (authData.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: role,
        status: status,
        created_by: authCheck.userId,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      return { success: false, message: profileError.message };
    }

    // Ban user immediately if status is not active
    if (status !== "active") {
      await supabase.auth.admin.updateUserById(authData.user.id, {
        ban_duration: "876000h",
      });
    }

    // --- (FIXED) ADD AUDIT LOG ---
    await supabase.from("admin_audit_log").insert({
      admin_id: authCheck.userId,
      action: "user.create",
      target_user_id: authData.user.id,
      details: {
        message: `Created user ${email} with role ${role}`,
        email: email,
        role: role,
        status: status,
      },
    });
    // --- END LOG ---
  }

  revalidatePath("/admin/users");
  return { success: true, message: "User created successfully!" };
}

// Delete user function
export async function deleteUser(userId: string) {
  // Check authorization first
  const authCheck = await checkSuperAdminAccess();
  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message };
  }

  const supabase = await createAdminClient();

  // Get user email *before* deleting, for the log message
  const { data: userToLog } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, message: error.message };
  }

  // --- (FIXED) ADD AUDIT LOG ---
  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "user.delete",
    target_user_id: userId,
    details: {
      message: `Deleted user ${userToLog?.email || userId}`,
      deleted_email: userToLog?.email || "unknown",
    },
  });
  // --- END LOG ---

  revalidatePath("/admin/users");
  return { success: true, message: "User deleted successfully!" };
}

// Update user function
export async function updateUser(formData: FormData) {
  // Check authorization first
  const authCheck = await checkSuperAdminAccess();
  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message };
  }

  const supabase = await createAdminClient();

  const id = formData.get("id") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const status = formData.get("status") as string;

  // Get current data for logging changes
  const { data: oldData } = await supabase
    .from("profiles")
    .select("role, status, email, full_name")
    .eq("id", id)
    .single();

  // Safety Check: Prevent demoting the last super_admin
  if (oldData?.role === "super_admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("role", "super_admin");

    if (count === 1 && role !== "super_admin") {
      return { success: false, message: "Cannot demote the last super admin." };
    }
  }

  // Get current user from auth
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(id);

  if (!user) {
    return { success: false, message: "User not found in auth system." };
  }

  // Update email if changed
  if (user.email !== email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      email: email,
    });
    if (authError) {
      return {
        success: false,
        message: `Failed to update auth email: ${authError.message}`,
      };
    }
  }

  // Handle ban/unban based on status
  if (status === "inactive" || status === "suspended") {
    const { error: banError } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "876000h",
    });
    if (banError) console.error("Failed to ban user:", banError);
  } else if (status === "active") {
    const { error: unbanError } = await supabase.auth.admin.updateUserById(id, {
      ban_duration: "none",
    });
    if (unbanError) console.error("Failed to unban user:", unbanError);
  }

  // Update the public.profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, email: email, role: role, status: status })
    .eq("id", id);

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  // --- (FIXED) ADD AUDIT LOG ---
  const changes: string[] = [];
  if (oldData?.full_name !== fullName) {
    changes.push(`name to '${fullName}'`);
  }
  if (oldData?.email !== email) {
    changes.push(`email to '${email}'`);
  }
  if (oldData?.role !== role) {
    changes.push(`role from '${oldData?.role}' to '${role}'`);
  }
  if (oldData?.status !== status) {
    changes.push(`status from '${oldData?.status}' to '${status}'`);
  }
  
  const message = `Updated user ${email}. Changes: ${changes.join(", ")}`;

  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "user.update",
    target_user_id: id,
    details: {
      message: message, // This is the improved message
      changes: {
        role: { old: oldData?.role, new: role },
        status: { old: oldData?.status, new: status },
        email: { old: oldData?.email, new: email },
        full_name: { old: oldData?.full_name, new: fullName },
      },
    },
  });
  // --- END LOG ---

  revalidatePath("/admin/users");
  return { success: true, message: "User updated successfully!" };
}

// Action to send a password reset email
export async function resetUserPassword(email: string) {
  // Check authorization first
  const authCheck = await checkSuperAdminAccess();
  if (!authCheck.authorized || !authCheck.userId) {
    return { success: false, message: authCheck.message };
  }

  const supabase = await createAdminClient();

  const { error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: email,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // --- (FIXED) ADD AUDIT LOG ---
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  await supabase.from("admin_audit_log").insert({
    admin_id: authCheck.userId,
    action: "user.password_reset",
    target_user_id: targetUser?.id || null,
    details: {
      message: `Sent password reset link to ${email}`,
      email: email,
    },
  });
  // --- END LOG ---

  return { success: true, message: "Password reset link sent successfully!" };
}