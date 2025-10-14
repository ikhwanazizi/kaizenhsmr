// src/app/admin/editor/components/step-3-content.tsx
"use client";

import React from "react";
import type { Database } from "@/types/supabase";
import FeaturedImageUploader from "./featured-image-uploader";
import { BlockWrapper } from "./block-wrapper";
import ParagraphBlock from "./paragraph-block";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusCircle } from "lucide-react";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

interface Step3ContentProps {
  post: Post;
  setPost: React.Dispatch<React.SetStateAction<Post>>;
  blocks: PostBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<PostBlock[]>>;
}

export default function Step3Content({
  post,
  setPost,
  blocks,
  setBlocks,
}: Step3ContentProps) {
  const handleAddBlock = (type: "paragraph" | "heading") => {
    const newBlock: PostBlock = {
      id: crypto.randomUUID(), // Temporary client-side ID
      post_id: post.id,
      type: type,
      content:
        type === "paragraph"
          ? { type: "doc", content: [{ type: "paragraph" }] }
          : { level: 2, text: "" },
      order_index: blocks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleBlockChange = (blockId: string, newContent: any) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content: newContent } : block
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = Array.from(items);
        const [removed] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, removed);
        // Re-assign order_index based on new position
        return newItems.map((item, index) => ({ ...item, order_index: index }));
      });
    }
  };

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

        <FeaturedImageUploader post={post} setPost={setPost} />

        <div className="py-4 relative space-y-4">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <BlockWrapper key={block.id} id={block.id}>
                  {block.type === "paragraph" && (
                    <ParagraphBlock
                      content={block.content}
                      onChange={(newContent) =>
                        handleBlockChange(block.id, newContent)
                      }
                    />
                  )}
                  {/* We will add other block types like Heading here later */}
                </BlockWrapper>
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="text-center">
          <button
            onClick={() => handleAddBlock("paragraph")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <PlusCircle size={16} />
            Add Paragraph
          </button>
        </div>
      </div>
    </div>
  );
}
