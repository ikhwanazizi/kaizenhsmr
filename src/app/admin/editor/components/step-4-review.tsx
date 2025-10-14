// src/app/admin/editor/components/step-4-review.tsx
"use client";

import type { Database } from "@/types/supabase";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { convertDbBlocksToTiptap } from "../utils/converters";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

interface Step4ReviewProps {
  post: Post;
  blocks: PostBlock[];
}

export default function Step4Review({ post, blocks }: Step4ReviewProps) {
  // Create a read-only editor instance to display the content
  const editor = useEditor({
    editable: false,
    extensions: [StarterKit],
    content: convertDbBlocksToTiptap(blocks),
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-lg max-w-none",
      },
    },
    immediatelyRender: false,
  });

  const metadata = (post.metadata || {}) as any;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-center">Review & Publish</h2>
          <p className="text-center text-gray-500 mt-2">
            This is a preview of your post. Review everything before publishing.
          </p>
        </div>

        {/* Post Details Summary */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-lg border-b pb-2 mb-4 dark:border-gray-700">
            Post Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                Category
              </div>
              <div className="capitalize">{post.category}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                Status
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Draft
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                URL Slug
              </div>
              <div className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
                /posts/{post.slug}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-600 dark:text-gray-400">
                Meta Title
              </div>
              <div>{post.seo_meta_title || post.title}</div>
            </div>
            {post.category === "development" && (
              <>
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400">
                    Version
                  </div>
                  <div>{metadata.version || "N/A"}</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600 dark:text-gray-400">
                    Release Date
                  </div>
                  <div>{metadata.release_date || "N/A"}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {post.title}
          </h1>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
