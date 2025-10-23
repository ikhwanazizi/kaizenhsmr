// src/app/(public)/company/developments/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default async function DevelopmentPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params;
  return <BlogPostLayout slug={resolvedParams.slug} category="development" />;
}