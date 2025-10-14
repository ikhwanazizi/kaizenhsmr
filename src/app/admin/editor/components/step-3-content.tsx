// src/app/admin/editor/components/step-3-content.tsx
"use client";

import React from "react";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Database } from "@/types/supabase";
import { convertDbBlocksToTiptap } from "../utils/converters";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

interface Step3ContentProps {
  post: Post;
  setPost: React.Dispatch<React.SetStateAction<Post>>;
  initialBlocks: PostBlock[];
  getEditorJSON: React.MutableRefObject<() => JSONContent | undefined>;
}

export default function Step3Content({
  post,
  setPost,
  initialBlocks,
  getEditorJSON,
}: Step3ContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your amazing content here...",
      }),
    ],
    // Load the initial content by converting DB blocks
    content: convertDbBlocksToTiptap(initialBlocks),
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-lg focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      // Expose the editor's content via the passed-in function reference
      getEditorJSON.current = () => editor.getJSON();
    },
    immediatelyRender: false, // Add this to fix SSR/hydration mismatch
  });

  // Initialize the function reference on first render
  if (editor && !getEditorJSON.current) {
    getEditorJSON.current = () => editor.getJSON();
  }

  if (!editor) return null;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <textarea
          rows={1}
          value={post.title || ""}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full text-4xl font-extrabold tracking-tight bg-transparent border-0 resize-none focus:ring-0 p-0"
          placeholder="Post Title"
        />
        <div className="p-4 text-center border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600">
          <p className="text-sm text-gray-500">
            Featured Image Uploader will go here.
          </p>
        </div>
        <div className="py-4 relative">
          <BubbleMenu
            editor={editor}
            options={{
              placement: "top",
              offset: { mainAxis: 10, crossAxis: 0 },
            }}
            className="bg-gray-800 text-white rounded-lg p-1 flex gap-1"
          >
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={
                editor.isActive("bold")
                  ? "bg-gray-600 p-2 rounded"
                  : "p-2 rounded hover:bg-gray-700"
              }
            >
              Bold
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={
                editor.isActive("italic")
                  ? "bg-gray-600 p-2 rounded"
                  : "p-2 rounded hover:bg-gray-700"
              }
            >
              Italic
            </button>
          </BubbleMenu>
          <FloatingMenu
            editor={editor}
            options={{
              placement: "top",
              offset: { mainAxis: 10, crossAxis: 0 },
            }}
            className="bg-white dark:bg-gray-700 shadow-lg rounded-lg border dark:border-gray-600 overflow-hidden"
          >
            <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className="p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Paragraph
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className="p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 font-bold text-xl"
            >
              H2
            </button>
            <button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              className="p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 font-bold text-lg"
            >
              H3
            </button>
          </FloatingMenu>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
