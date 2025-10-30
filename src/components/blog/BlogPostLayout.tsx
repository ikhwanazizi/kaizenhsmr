// src/components/blog/BlogPostLayout.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { StickySidebar } from "./StickySidebar"; // ✅ FIX: Use a named import here
import PostRenderer from "./PostRenderer";

// Type definitions
type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string;
  author_id: string | null;
  author?: {
    full_name: string | null;
    email: string;
  };
};

type Block = {
  id: string;
  type: string;
  content: any;
  order_index: number;
};

type TOCItem = {
  id: string;
  text: string;
  level: number;
};

export default function BlogPostLayout({
  slug,
  category,
}: {
  slug: string;
  category: "blog" | "development";
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPost();
  }, [slug, category]);

  useEffect(() => {
    if (blocks.length > 0) {
      generateTOC();
    }
  }, [blocks]);

  const fetchPost = async () => {
    try {
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`*, author:profiles(full_name, email)`)
        .eq("slug", slug)
        .eq("category", category)
        .eq("status", "published")
        .single();

      if (postError) throw postError;

      const { data: blocksData, error: blocksError } = await supabase
        .from("post_blocks")
        .select("*")
        .eq("post_id", postData.id)
        .order("order_index", { ascending: true });

      if (blocksError) throw blocksError;

      setPost(postData);
      setBlocks(blocksData || []);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateTOC = () => {
    const headings: TOCItem[] = [];
    blocks.forEach((block) => {
      if (
        block.type === "heading" &&
        (block.content.level === 2 || block.content.level === 3)
      ) {
        headings.push({
          id: `heading-${block.id}`,
          text: block.content.text,
          level: block.content.level,
        });
      }
    });
    setToc(headings);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The post you're looking for doesn't exist.
          </p>
          <a
            href={
              category === "blog"
                ? "/resources/blog-articles"
                : "/company/developments"
            }
            className="text-[#008080] hover:underline"
          >
            ← Back to {category === "blog" ? "Blog" : "Developments"}
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="relative bg-gray-100 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-0">
            <div className="md:col-span-3 relative h-64 md:h-[282px]">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#008080] to-[#20b2aa] flex items-center justify-center">
                  <span className="text-white text-xl">KaizenHR</span>
                </div>
              )}
            </div>
            <div className="md:col-span-2 bg-white p-6 md:p-8 flex flex-col justify-center">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              <div className="flex items-center text-gray-600">
                <span>
                  By{" "}
                  {post.author?.full_name ||
                    post.author?.email ||
                    "KaizenHR Team"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          <aside
            className="hidden lg:block lg:w-2/5 lg:sticky lg:top-24 lg:self-start order-2 lg:order-1"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            <StickySidebar
              toc={toc}
              activeSection={activeSection}
              postTitle={post.title}
            />
          </aside>
          <article className="lg:w-3/5 order-1 lg:order-2">
            <PostRenderer blocks={blocks} />
          </article>
        </div>
      </div>
      {/* Mobile-only Sidebar content */}
      <div className="lg:hidden px-4 mb-8">
        <StickySidebar
          toc={toc}
          activeSection={activeSection}
          postTitle={post.title}
        />
      </div>
      <Footer />
    </div>
  );
}
