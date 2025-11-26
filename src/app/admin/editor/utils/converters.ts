import type { Database } from "@/types/supabase";
import { JSONContent } from "@tiptap/react";

type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

/**
 * ✅ Convert TipTap JSON → Database Blocks
 * Preserves link marks with href attributes.
 */
export function convertTiptapToDbBlocks(
  postId: string,
  editorJSON: JSONContent
): Omit<PostBlock, "id" | "created_at" | "updated_at">[] {
  if (!editorJSON.content) return [];

  const blocks: Omit<PostBlock, "id" | "created_at" | "updated_at">[] = [];

  editorJSON.content.forEach((node, index) => {
    let blockType: PostBlock["type"] | null = null;
    let content: any = {};

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
        content = {
          text: node.content?.map((child) => {
            if (child.type === "text") {
              const textNode: any = {
                type: "text",
                text: child.text,
              };

              // ✅ Preserve link marks
              if (child.marks && child.marks.length > 0) {
                textNode.marks = child.marks.map((mark: any) => {
                  if (mark.type === "link" && mark.attrs?.href) {
                    return {
                      type: "link",
                      attrs: { href: mark.attrs.href },
                    };
                  }
                  return mark;
                });
              }

              return textNode;
            }
            return child;
          }) || [],
        };
        break;

      // Add other block types (quote, list, image, etc.) later
    }

    if (blockType) {
      blocks.push({
        post_id: postId,
        type: blockType,
        content,
        order_index: index,
      });
    }
  });

  return blocks;
}

/**
 * ✅ Convert Database Blocks → TipTap JSON
 * Reconstructs full TipTap document with preserved link hrefs.
 */
export function convertDbBlocksToTiptap(blocks: PostBlock[]): JSONContent {
  const tiptapContent = blocks
    .sort((a, b) => a.order_index - b.order_index)
    .map((block): JSONContent | null => {
      const content = block.content as any;

      switch (block.type) {
        case "heading":
          return {
            type: "heading",
            attrs: { level: content.level },
            content: [{ type: "text", text: content.text }],
          };

        case "paragraph":
          return {
            type: "paragraph",
            content: content.text?.map((child: any) => {
              if (child.type === "text") {
                const textNode: any = {
                  type: "text",
                  text: child.text,
                };

                // ✅ Reattach link marks
                if (child.marks && child.marks.length > 0) {
                  textNode.marks = child.marks.map((mark: any) => {
                    if (mark.type === "link" && mark.attrs?.href) {
                      return {
                        type: "link",
                        attrs: { href: mark.attrs.href },
                      };
                    }
                    return mark;
                  });
                }

                return textNode;
              }
              return child;
            }) || [],
          };

        default:
          return null;
      }
    })
    // ✅ Simpler filter that TypeScript accepts
    .filter((node): node is Exclude<typeof node, null> => node !== null);

  return { type: "doc", content: tiptapContent };
}

