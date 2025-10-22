// src/app/(public)/resources/blog-articles/[slug]/page.tsx
import BlogPostLayout from "@/components/blog/BlogPostLayout";

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  return <BlogPostLayout slug={params.slug} category="blog" />;
}