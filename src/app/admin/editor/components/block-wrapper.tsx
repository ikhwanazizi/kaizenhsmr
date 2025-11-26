// src/app/admin/editor/components/block-wrapper.tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React from "react";

interface BlockWrapperProps {
  id: string;
  children: React.ReactNode;
}

export function BlockWrapper({ id, children }: BlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 cursor-grab opacity-0 group-hover:opacity-50 transition-opacity"
      >
        <GripVertical size={20} />
      </div>
      {children}
    </div>
  );
}
