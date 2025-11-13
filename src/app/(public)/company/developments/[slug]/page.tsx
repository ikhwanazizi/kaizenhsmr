// src/app/(public)/company/developments/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default async function DevelopmentPostPage({
  params,
}: {
  params: { slug: string };
}) {
  return <BlogPostLayout slug={params.slug} category="development" />;
}
