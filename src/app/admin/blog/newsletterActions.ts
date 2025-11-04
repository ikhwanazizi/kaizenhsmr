// src/app/admin/blog/newsletterActions.ts
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { Resend } from "resend"; // 1. Import Resend
import { postNewsletterTemplate } from "@/lib/email-templates/post-newsletter-template"; // 2. Import the template

// --- 1. ADD THIS NEW HELPER FUNCTION ---

/**
 * Finds the first text content from Tiptap 'paragraph' blocks.
 * @param blocks An array of post_blocks from Supabase.
 * @returns The first 150 characters of text, or null.
 */
function generatePreviewFromBlocks(blocks: any[]): string | null {
  if (!blocks || blocks.length === 0) return null;

  // Find the first paragraph block
  const firstParagraph = blocks.find((block) => block.type === "paragraph");
  if (!firstParagraph || !firstParagraph.content?.content) return null;

  try {
    // Tiptap's structure is { type: "doc", content: [ { type: "paragraph", content: [ { type: "text", text: "..." } ] } ] }
    for (const node of firstParagraph.content.content) {
      if (node.type === "paragraph" && node.content) {
        for (const innerNode of node.content) {
          if (innerNode.type === "text" && innerNode.text) {
            // Found the first piece of text!
            let text = innerNode.text.trim();
            if (text.length > 150) {
              // Truncate and add ellipsis
              text = text.substring(0, 150).trim() + "...";
            }
            return text;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error parsing block content:", e);
    return null;
  }

  return null; // No text found in the first paragraph
}
// --- END OF HELPER FUNCTION ---

// ... (keep the createClient and createAdminClient functions)
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

// Helper to create an admin-context client (bypasses RLS)
async function createAdminClient() {
  const cookieStore = await cookies(); // <-- 1. YOU MUST AWAIT this function

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        // 2. Use the 'cookieStore' variable you just created
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
}

export async function getNewsletterModalData(postId: string) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = await createAdminClient();

    // 1. Get admin user email
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) {
      throw new Error("Not authenticated");
    }

    // 2. Get the post data
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("title, excerpt, featured_image")
      .eq("id", postId)
      .single();

    if (postError) {
      throw new Error(`Post not found: ${postError.message}`);
    }

    // --- 3. NEW: FETCH POST BLOCKS ---
    const { data: postBlocks, error: blocksError } = await supabase
      .from("post_blocks")
      .select("type, content")
      .eq("post_id", postId)
      .order("order_index", { ascending: true });

    if (blocksError) {
      throw new Error(`Could not fetch post content: ${blocksError.message}`);
    }

    // --- 4. NEW: AUTO-GENERATE PREVIEW ---
    const postPreview =
      post.excerpt || // Use the manual excerpt if it exists
      generatePreviewFromBlocks(postBlocks) || // Otherwise, generate from blocks
      "Read the full article on our website."; // Fallback

    // 5. Get subscriber count
    const { count, error: countError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "subscribed");

    if (countError) {
      throw new Error(`Could not count subscribers: ${countError.message}`);
    }

    return {
      success: true,
      adminEmail: user.email,
      postTitle: post.title || "Untitled Post",
      postPreview: postPreview, // <-- Use our new auto-generated preview
      postImage: post.featured_image,
      subscriberCount: count || 0,
    };
  } catch (error: any) {
    console.error("Error in getNewsletterModalData:", error.message);
    return { success: false, message: error.message };
  }
}

export async function sendTestNewsletter(postId: string, testEmail: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createClient();

  try {
    // 1. Get the full post data
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("title, excerpt, featured_image, slug, category")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      throw new Error("Post not found.");
    }

    // --- 2. NEW: FETCH POST BLOCKS ---
    const { data: postBlocks, error: blocksError } = await supabase
      .from("post_blocks")
      .select("type, content")
      .eq("post_id", postId)
      .order("order_index", { ascending: true });

    if (blocksError) {
      throw new Error("Could not fetch post content.");
    }

    // --- 3. NEW: AUTO-GENERATE PREVIEW ---
    const postPreview =
      post.excerpt || // Use the manual excerpt if it exists
      generatePreviewFromBlocks(postBlocks) || // Otherwise, generate from blocks
      "Read the full article on our website."; // Fallback

    // 4. Construct URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kaizenhrms.com";
    const postPath =
      post.category === "blog"
        ? "resources/blog-articles"
        : "company/developments";
    const readMoreUrl = `${siteUrl}/${postPath}/${post.slug}`;
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=test-token`; // Test token

    // 5. Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "KaizenHR <onboarding@resend.dev>",
      to: [testEmail],
      subject: `[TEST] ${post.title}`,
      html: postNewsletterTemplate({
        postTitle: post.title || "Untitled Post",
        postPreviewText: postPreview, // <-- Use our new auto-generated preview
        postImageUrl: post.featured_image,
        readMoreUrl: readMoreUrl,
        unsubscribeUrl: unsubscribeUrl,
      }),
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending test newsletter:", error.message);
    return { success: false, message: error.message };
  }
}

export async function sendNewsletterToAll(postId: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  try {
    // 1. --- Authorization ---
    // First, get the current user and check if they are a super_admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      throw new Error("You do not have permission to perform this action.");
    }

    // 2. --- Get Post Data ---
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("title, excerpt, featured_image, slug, category, newsletter_sent_at")
      .eq("id", postId)
      .single();

    if (postError || !post) throw new Error("Post not found.");
    if (post.newsletter_sent_at) throw new Error("This newsletter has already been sent.");

    // 3. --- Get Post Content (for Preview) ---
    const { data: postBlocks, error: blocksError } = await supabase
      .from("post_blocks")
      .select("type, content")
      .eq("post_id", postId)
      .order("order_index", { ascending: true });

    if (blocksError) throw new Error("Could not fetch post content.");

    const postPreview =
      post.excerpt ||
      generatePreviewFromBlocks(postBlocks) ||
      "Read the full article on our website.";

    // 4. --- Get Subscribers ---
    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("status", "subscribed");

    if (subsError) throw new Error("Could not fetch subscribers.");
    if (!subscribers || subscribers.length === 0) {
      return { success: false, message: "There are no subscribers to send to." };
    }

    // 5. --- Create Campaign Log ---
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("newsletter_campaigns")
      .insert({
        post_id: postId,
        subject: post.title || "Untitled Post",
        preview_text: postPreview,
        sent_by: user.id,
        total_recipients: subscribers.length,
        status: "sending",
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Failed to create campaign log: ${campaignError?.message}`);
    }

    // 6. --- Prepare and Send All Emails in Parallel ---
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kaizenhrms.com";
    const postPath = post.category === "blog" ? "resources/blog-articles" : "company/developments";
    const readMoreUrl = `${siteUrl}/${postPath}/${post.slug}`;

    const sendPromises = subscribers.map(subscriber => {
      const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?id=${subscriber.id}`;
      
      return resend.emails.send({
        from: "KaizenHR <onboarding@resend.dev>",
        to: [subscriber.email],
        subject: post.title || "A new post from KaizenHR",
        html: postNewsletterTemplate({
          postTitle: post.title || "Untitled Post",
          postPreviewText: postPreview,
          postImageUrl: post.featured_image,
          readMoreUrl: readMoreUrl,
          unsubscribeUrl: unsubscribeUrl,
        }),
      }).then(response => ({
        ...response,
        subscriber_id: subscriber.id,
        email: subscriber.email,
      }));
    });

    const results = await Promise.allSettled(sendPromises);

    // 7. --- Log All Send Results ---
    const logEntries = results.map(result => {
      if (result.status === 'fulfilled' && !result.value.error) {
        return {
          campaign_id: campaign.id,
          subscriber_id: result.value.subscriber_id,
          email: result.value.email,
          status: 'sent',
          sent_at: new Date().toISOString(),
        };
      } else {
        const error = result.status === 'rejected' ? result.reason : (result.value.error as any);
        return {
          campaign_id: campaign.id,
          subscriber_id: (result as any).value?.subscriber_id || null,
          email: (result as any).value?.email || 'unknown',
          status: 'failed',
          error_message: error?.message || 'Failed to send',
        };
      }
    });

    // We have to filter out null subscriber_id entries for the log
    const validLogEntries = logEntries.filter(entry => entry.subscriber_id);
    if (validLogEntries.length > 0) {
      await supabaseAdmin.from("newsletter_send_log").insert(validLogEntries);
    }
    
    const successfulSends = validLogEntries.filter(e => e.status === 'sent').length;
    const failedSends = validLogEntries.length - successfulSends;

    // 8. --- Update Campaign and Post ---
    await supabaseAdmin
      .from("newsletter_campaigns")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        total_sent: successfulSends,
        total_failed: failedSends,
      })
      .eq("id", campaign.id);

    await supabase
      .from("posts")
      .update({ newsletter_sent_at: new Date().toISOString() })
      .eq("id", postId);

    return { 
      success: true, 
      message: `Newsletter sent to ${successfulSends} subscribers. ${failedSends} failed.` 
    };

  } catch (error: any) {
    console.error("Error sending newsletter to all:", error.message);
    return { success: false, message: error.message };
  }
}

