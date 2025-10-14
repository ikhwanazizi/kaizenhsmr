// src/app/admin/editor/utils/converters.ts
import type { Database } from "@/types/supabase";
import { JSONContent } from "@tiptap/react";

type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

// Converts TipTap's JSON format into an array of blocks for our database.
export function convertTiptapToDbBlocks(
  postId: string,
  editorJSON: JSONContent
): Omit<PostBlock, "id" | "created_at" | "updated_at">[] {
  if (!editorJSON.content) {
    return [];
  }

  const blocks: Omit<PostBlock, "id" | "created_at" | "updated_at">[] = [];

  editorJSON.content.forEach((node, index) => {
    let blockType: PostBlock["type"] | null = null;
    let content: PostBlock["content"] = {};

    switch (node.type) {
      case "heading":
        blockType = "heading";
        content = {
          level: node.attrs?.level,
          text: node.content?.[0]?.text || "",
        };
        break;
      case "paragraph":
        blockType = "paragraph";
        content = { text: node.content || [] };
        break;
      // Add cases for other block types (list, quote, etc.) here later
    }

    if (blockType) {
      blocks.push({
        post_id: postId,
        type: blockType,
        content: content,
        order_index: index,
      });
    }
  });

  return blocks;
}

// Converts our database blocks into a single TipTap JSON document.
export function convertDbBlocksToTiptap(blocks: PostBlock[]): JSONContent {
  const tiptapContent: JSONContent[] = blocks
    .sort((a, b) => a.order_index - b.order_index)
    .map((block) => {
      let node: JSONContent | null = null;
      const blockContent = block.content as any;

      switch (block.type) {
        case "heading":
          node = {
            type: "heading",
            attrs: { level: blockContent.level },
            content: [{ type: "text", text: blockContent.text }],
          };
          break;
        case "paragraph":
          node = {
            type: "paragraph",
            content: blockContent.text || [],
          };
          break;
        // Add cases for other block types here later
      }
      return node;
    })
    .filter((n): n is JSONContent => n !== null);

  return {
    type: "doc",
    content: tiptapContent,
  };
}