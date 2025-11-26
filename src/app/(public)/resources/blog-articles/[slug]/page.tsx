// src/app/(public)/resources/blog-articles/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default async function BlogArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  return <BlogPostLayout slug={params.slug} category="blog" />;
}
