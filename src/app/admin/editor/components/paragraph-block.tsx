// src/app/admin/editor/components/paragraph-block.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface ParagraphBlockProps {
  content: any; // TipTap JSON content
  onChange: (newContent: any) => void;
}

export default function ParagraphBlock({
  content,
  onChange,
}: ParagraphBlockProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we don't need for a simple paragraph
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({ placeholder: "Type here..." }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
}
