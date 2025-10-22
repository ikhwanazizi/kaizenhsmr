// src/app/(public)/blog-articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";

async function getPostBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles (
        full_name,
        email
      )
    `
    )
    .eq("slug", slug)
    .eq("category", "blog")
    .eq("status", "published")
    .single();

  if (error || !post) return null;

  const { data: blocks } = await supabase
    .from("post_blocks")
    .select("*")
    .eq("post_id", post.id)
    .order("order_index", { ascending: true });

  return { post, blocks: blocks || [] };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const resolvedParams = await params;
  const data = await getPostBySlug(resolvedParams.slug);

  if (!data) {
    return notFound();
  }

  const { post, blocks } = data;
  const author = post.author as any;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow pt-16">
        <article>
          {/* Hero Section with Featured Image */}
          {post.featured_image && (
            <div className="w-full h-[400px] relative bg-gray-100">
              <img
                src={post.featured_image}
                alt={post.featured_image_alt || post.title || "Featured image"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <Container className="py-12">
            <div className="max-w-4xl mx-auto">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  Blog
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
              )}

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pb-6 border-b border-gray-200">
                <div>
                  By{" "}
                  <span className="font-semibold text-gray-700">
                    {author?.full_name || author?.email || "Anonymous"}
                  </span>
                </div>
                <span>•</span>
                <div>
                  {new Date(post.published_at || "").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              </div>
            </div>
          </Container>

          {/* Article Content */}
          <Container className="py-8">
            <div className="max-w-4xl mx-auto prose prose-lg prose-blue max-w-none">
              {blocks.map((block) => {
                const content = block.content as any;

                switch (block.type) {
                  case "heading":
                    const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;
                    return (
                      <HeadingTag key={block.id} className="font-bold mt-8 mb-4">
                        {content.text}
                      </HeadingTag>
                    );

                  case "paragraph":
                  case "table":
                    return (
                      <div
                        key={block.id}
                        dangerouslySetInnerHTML={{
                          __html: renderTiptapContent(content),
                        }}
                      />
                    );

                  case "image":
                    return (
                      <figure key={block.id} className="my-8">
                        <img
                          src={content.url}
                          alt={content.alt || ""}
                          className="w-full h-auto rounded-lg"
                        />
                        {content.caption && (
                          <figcaption className="text-center text-sm text-gray-600 mt-2">
                            {content.caption}
                          </figcaption>
                        )}
                      </figure>
                    );

                  case "video":
                    return (
                      <figure key={block.id} className="my-8">
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                          <iframe
                            src={content.url}
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {content.caption && (
                          <figcaption className="text-center text-sm text-gray-600 mt-2">
                            {content.caption}
                          </figcaption>
                        )}
                      </figure>
                    );

                  case "quote":
                    return (
                      <blockquote key={block.id} className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-xl text-gray-700">
                        <p>{content.text}</p>
                        {content.author && (
                          <footer className="text-sm text-gray-600 mt-2">
                            — {content.author}
                          </footer>
                        )}
                      </blockquote>
                    );

                  case "code":
                    return (
                      <div key={block.id} className="my-6">
                        <div className="bg-gray-900 rounded-lg overflow-hidden">
                          <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs font-semibold">
                            {content.language}
                          </div>
                          <pre className="p-4 overflow-x-auto">
                            <code className="text-sm text-gray-100">
                              {content.code}
                            </code>
                          </pre>
                        </div>
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </div>
          </Container>
        </article>
      </main>

      <Footer />
    </div>
  );
}

// Helper function to render Tiptap content as HTML
function renderTiptapContent(content: any): string {
  if (!content || !content.content) return "";

  const renderNode = (node: any): string => {
    if (node.type === "text") {
      let text = node.text || "";
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case "bold":
              text = `<strong>${text}</strong>`;
              break;
            case "italic":
              text = `<em>${text}</em>`;
              break;
            case "underline":
              text = `<u>${text}</u>`;
              break;
            case "strike":
              text = `<s>${text}</s>`;
              break;
            case "link":
              text = `<a href="${mark.attrs.href}" class="text-blue-600 underline">${text}</a>`;
              break;
            case "highlight":
              text = `<mark>${text}</mark>`;
              break;
          }
        });
      }
      return text;
    }

    const children = node.content?.map(renderNode).join("") || "";
    const attrs = node.attrs || {};

    switch (node.type) {
      case "paragraph":
        const textAlign = attrs.textAlign ? `text-align: ${attrs.textAlign};` : "";
        return `<p style="${textAlign}">${children}</p>`;
      case "heading":
        return `<h${attrs.level}>${children}</h${attrs.level}>`;
      case "bulletList":
        return `<ul class="list-disc pl-6 my-4">${children}</ul>`;
      case "orderedList":
        return `<ol class="list-decimal pl-6 my-4">${children}</ol>`;
      case "listItem":
        return `<li class="my-1">${children}</li>`;
      case "horizontalRule":
        return `<hr class="my-8 border-gray-300" />`;
      case "table":
        return `<table class="my-4 border-collapse w-full">${children}</table>`;
      case "tableRow":
        return `<tr>${children}</tr>`;
      case "tableHeader":
        return `<th class="border border-gray-300 p-2 font-bold bg-gray-100">${children}</th>`;
      case "tableCell":
        return `<td class="border border-gray-300 p-2">${children}</td>`;
      default:
        return children;
    }
  };

  return content.content.map(renderNode).join("");
}