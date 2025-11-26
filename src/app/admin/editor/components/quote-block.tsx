// src/app/admin/editor/components/quote-block.tsx
"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Copy,
  Trash2,
  Type,
  Heading1,
  Quote as QuoteIcon,
} from "lucide-react";

interface QuoteBlockProps {
  content: { text: string; author: string };
  onChange: (newContent: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvert: (newType: "paragraph" | "heading" | "quote") => void;
}

export default function QuoteBlock({
  content,
  onChange,
  onDelete,
  onDuplicate,
  onConvert,
}: QuoteBlockProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
        <QuoteIcon size={18} className="text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quote
        </span>

        <div className="flex-1" />

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            title="More options"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
              <button
                onClick={() => {
                  onDuplicate();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy size={14} />
                Duplicate
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    onConvert("paragraph");
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Type size={14} />
                  Convert to Paragraph
                </button>
                <button
                  onClick={() => {
                    onConvert("heading");
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Heading1 size={14} />
                  Convert to Heading
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    onDelete();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quote Content */}
      <div className="p-4">
        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <textarea
            value={content.text}
            onChange={(e) => {
              onChange({ ...content, text: e.target.value });
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            placeholder="Enter quote text..."
            className="w-full text-xl italic text-gray-800 dark:text-gray-200 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none"
            rows={2}
          />
          <input
            type="text"
            value={content.author}
            onChange={(e) => onChange({ ...content, author: e.target.value })}
            placeholder="Author name (optional)"
            className="w-full mt-2 text-sm text-gray-600 dark:text-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
