// src/app/(public)/resources/blog-articles/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <BlogPostLayout slug={resolvedParams.slug} category="blog" />;
}
