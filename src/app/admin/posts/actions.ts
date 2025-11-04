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

  // If the post has unpublished changes, load the draft content for the editor
  if (post.has_unpublished_changes) {
    const draftPost = {
      ...post,
      title: post.draft_title || post.title,
      excerpt: post.draft_excerpt || post.excerpt,
      featured_image: post.draft_featured_image || post.featured_image,
      featured_image_alt: post.draft_featured_image_alt || post.featured_image_alt,
      seo_meta_title: post.draft_seo_meta_title || post.seo_meta_title,
      seo_meta_description: post.draft_seo_meta_description || post.seo_meta_description,
      seo_og_image: post.draft_seo_og_image || post.seo_og_image,
    };
    
    // Use draft_blocks if they exist and are valid JSON
    let blocks: any[] = [];
    if (Array.isArray(post.draft_blocks)) {
      blocks = post.draft_blocks;
    }

    return { success: true, post: draftPost, blocks: blocks || [] };
  }

  // If no unpublished changes, load the LIVE blocks
  const { data: blocks, error: blocksError } = await supabase
    .from("post_blocks")
    .select("*")
    .eq("post_id", postId)
    .order("order_index", { ascending: true });

  if (blocksError) {
    console.error("Error fetching blocks:", blocksError);
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

// export async function updatePostContent(
//   postId: string,
//   postDetails: Partial<Database["public"]["Tables"]["posts"]["Row"]>,
//   blocks: Omit<
//     Database["public"]["Tables"]["post_blocks"]["Row"],
//     "id" | "created_at" | "updated_at"
//   >[]
// ) {
//   const supabase = await createClient();

//   // 1. Update the post details (title, excerpt, etc.)
//   const { error: postUpdateError } = await supabase
//     .from("posts")
//     .update(postDetails)
//     .eq("id", postId);

//   if (postUpdateError) {
//     console.error("Error updating post content:", postUpdateError);
//     return { success: false, message: postUpdateError.message };
//   }

//   // 2. Delete all existing blocks for this post
//   const { error: deleteError } = await supabase
//     .from("post_blocks")
//     .delete()
//     .eq("post_id", postId);

//   if (deleteError) {
//     console.error("Error deleting old blocks:", deleteError);
//     return { success: false, message: deleteError.message };
//   }

//   // 3. Insert the new blocks
//   if (blocks.length > 0) {
//     const { error: insertError } = await supabase
//       .from("post_blocks")
//       .insert(blocks);

//     if (insertError) {
//       console.error("Error inserting new blocks:", insertError);
//       return { success: false, message: insertError.message };
//     }
//   }

//   revalidatePath(`/admin/editor/${postId}`);
//   return { success: true, message: "Content saved successfully." };
// }

export async function autoSaveDraft(
  postId: string,
  postDetails: Partial<Database["public"]["Tables"]["posts"]["Row"]>,
  blocks: any[] // The blocks array from the editor state
) {
  const supabase = await createClient();
  
  const { error: postUpdateError } = await supabase
    .from("posts")
    .update({
      draft_title: postDetails.title,
      draft_excerpt: postDetails.excerpt,
      draft_featured_image: postDetails.featured_image,
      draft_featured_image_alt: postDetails.featured_image_alt,
      draft_seo_meta_title: postDetails.seo_meta_title,
      draft_seo_meta_description: postDetails.seo_meta_description,
      draft_seo_og_image: postDetails.seo_og_image,
      draft_blocks: blocks, // Save the entire block array as JSON
      has_unpublished_changes: true,
      last_autosaved_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (postUpdateError) {
    console.error("Error autosaving draft:", postUpdateError);
    return { success: false, message: postUpdateError.message };
  }

  // No revalidation needed, as this doesn't affect the public site
  return { success: true, message: "Draft saved." };
}

/**
 * MODIFIED: This function now "goes live".
 * It copies all content from the 'draft_' columns to the live columns
 * and rebuilds the live 'post_blocks' table.
 */
export async function publishPost(postId: string) {
  const supabase = await createClient();

  // 1. Get the latest draft data from the 'posts' table
  const { data: draftData, error: fetchError } = await supabase
    .from("posts")
    .select(
      // ----------------- FIX #1: ADD 'draft_slug' TO THIS LIST -----------------
      "draft_title, draft_slug, draft_excerpt, draft_featured_image, draft_featured_image_alt, draft_seo_meta_title, draft_seo_meta_description, draft_seo_og_image, draft_blocks"
    )
    .eq("id", postId)
    .single();

  if (fetchError || !draftData) {
    console.error("Error fetching draft data to publish:", fetchError);
    return { success: false, message: "Could not find draft data to publish." };
  }

  // 2. Delete all existing *live* blocks
  // ... (this part is correct, no changes needed) ...
  const { error: deleteError } = await supabase
    .from("post_blocks")
    .delete()
    .eq("post_id", postId);

  if (deleteError) {
    console.error("Error deleting old blocks:", deleteError);
    return { success: false, message: deleteError.message };
  }

  // 3. Insert the new blocks from 'draft_blocks' into 'post_blocks'
  // ... (this part is correct, no changes needed) ...
  if (draftData.draft_blocks && Array.isArray(draftData.draft_blocks)) {
    const blocksToInsert = (draftData.draft_blocks as any[]).map(
      (block, index) => ({
        post_id: postId,
        type: block.type,
        content: block.content,
        order_index: index,
      })
    );

    if (blocksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("post_blocks")
        .insert(blocksToInsert);

      if (insertError) {
        console.error("Error inserting new blocks:", insertError);
        return { success: false, message: insertError.message };
      }
    }
  }

  // 4. Update the main post record to "go live"
  const { error } = await supabase
    .from("posts")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      
      // ----------------- FIX #2: ADD FALLBACKS FOR NULL VALUES -----------------
      // We must provide a default value in case the draft title/slug is null
      title: draftData.draft_title || "Untitled Post",
      slug: draftData.draft_slug || `post-${nanoid(8)}`,
      // -------------------------------------------------------------------------

      excerpt: draftData.draft_excerpt,
      featured_image: draftData.draft_featured_image,
      featured_image_alt: draftData.draft_featured_image_alt,
      seo_meta_title: draftData.draft_seo_meta_title,
      seo_meta_description: draftData.draft_seo_meta_description,
      seo_og_image: draftData.draft_seo_og_image,
      
      // Clear draft fields
      has_unpublished_changes: false,
      draft_title: null,
      draft_slug: null,
      draft_excerpt: null,
      draft_featured_image: null,
      draft_featured_image_alt: null,
      draft_seo_meta_title: null,
      draft_seo_meta_description: null,
      draft_seo_og_image: null,
      draft_blocks: null,
    })
    .eq("id", postId);

  if (error) {
    console.error("Error publishing post:", error);
    return { success: false, message: error.message };
  }

  // Revalidate all public paths
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/editor/${postId}`);
  revalidatePath("/resources/blog-articles");
  revalidatePath("/company/developments");

  return { success: true, message: "Post published successfully!" };
}