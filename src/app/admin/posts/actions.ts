// src/app/admin/posts/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { nanoid } from "nanoid"; // --- MODIFICATION: Imported nanoid ---

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

// --- MODIFICATION: Removed the old server-side generateSlug function ---
// The slug is now generated and managed on the client in step-2-seo.tsx

export async function createPost(category: "blog" | "development") {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  // --- MODIFICATION: Switched from Date.now() to nanoid ---
  const defaultTitle = "Untitled Post";
  const newShortId = nanoid(8); // Generates a unique 8-character ID (e.g., 'k4fT9aP')
  const initialSlug = `untitled-post-${newShortId}`;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: defaultTitle,
      slug: initialSlug,
      short_id: newShortId, // Save the new alphanumeric ID to the database
      category: category,
      author_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return { success: false, message: "Failed to create post." };
  }

  revalidatePath("/admin/blog");
  return { success: true, postId: data.id };
}

export async function getAllPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      title,
      slug,
      category,
      status,
      published_at,
      author_id,
      author:profiles (
        full_name,
        email
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    console.error("Error deleting post:", error);
    return { success: false, message: "Failed to delete post." };
  }

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/editor/${postId}`);
  return { success: true, message: "Post deleted successfully." };
}

export async function getPostById(postId: string) {
  const supabase = await createClient();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (postError) {
    console.error("Error fetching post:", postError);
    return { success: false, message: "Post not found.", post: null, blocks: [] };
  }

  const { data: blocks, error: blocksError } = await supabase
    .from("post_blocks")
    .select("*")
    .eq("post_id", postId)
    .order("order_index", { ascending: true });

  if (blocksError) {
    console.error("Error fetching blocks:", blocksError);
    return { success: true, post, blocks: [] };
  }

  return { success: true, post, blocks: blocks || [] };
}

export async function updatePostCategory(
  postId: string,
  category: "blog" | "development"
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update({ category })
    .eq("id", postId);

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/admin/editor/${postId}`);
  return { success: true };
}

export async function updatePostDetails(
  postId: string,
  details: Partial<Database["public"]["Tables"]["posts"]["Row"]>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posts")
    .update(details)
    .eq("id", postId);

  if (error) {
    return { success: false, message: error.message };
  }
  revalidatePath(`/admin/editor/${postId}`);
  return { success: true, message: "Details saved successfully." };
}

export async function updatePostContent(
  postId: string,
  postDetails: Partial<Database["public"]["Tables"]["posts"]["Row"]>,
  blocks: Omit<
    Database["public"]["Tables"]["post_blocks"]["Row"],
    "id" | "created_at" | "updated_at"
  >[]
) {
  const supabase = await createClient();

  // 1. Update the post details (title, excerpt, etc.)
  const { error: postUpdateError } = await supabase
    .from("posts")
    .update(postDetails)
    .eq("id", postId);

  if (postUpdateError) {
    console.error("Error updating post content:", postUpdateError);
    return { success: false, message: postUpdateError.message };
  }

  // 2. Delete all existing blocks for this post
  const { error: deleteError } = await supabase
    .from("post_blocks")
    .delete()
    .eq("post_id", postId);

  if (deleteError) {
    console.error("Error deleting old blocks:", deleteError);
    return { success: false, message: deleteError.message };
  }

  // 3. Insert the new blocks
  if (blocks.length > 0) {
    const { error: insertError } = await supabase
      .from("post_blocks")
      .insert(blocks);

    if (insertError) {
      console.error("Error inserting new blocks:", insertError);
      return { success: false, message: insertError.message };
    }
  }

  revalidatePath(`/admin/editor/${postId}`);
  return { success: true, message: "Content saved successfully." };
}

export async function publishPost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    console.error("Error publishing post:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/editor/${postId}`);
  revalidatePath("/resources/blog-articles");
  revalidatePath("/company/developments");

  return { success: true, message: "Post published successfully!" };
}