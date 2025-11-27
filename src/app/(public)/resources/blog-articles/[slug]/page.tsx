// src/app/(public)/resources/blog-articles/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>; // 1. Change type to Promise
}) {
  const { slug } = await params; // 2. Await the params
  return <BlogPostLayout slug={slug} category="blog" />;
}
