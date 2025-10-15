// src/app/admin/editor/components/heading-block.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, Copy, Trash2, Type, Quote } from "lucide-react";

interface HeadingBlockProps {
  content: { level: number; text: string };
  onChange: (newContent: any) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onConvert: (newType: "paragraph" | "heading" | "quote") => void;
}

export default function HeadingBlock({
  content,
  onChange,
  onDelete,
  onDuplicate,
  onConvert,
}: HeadingBlockProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ ...content, text: e.target.value });
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleLevelChange = (level: number) => {
    onChange({ ...content, level });
  };

  const headingClasses = {
    1: "text-4xl",
    2: "text-3xl",
    3: "text-2xl",
    4: "text-xl",
    5: "text-lg",
    6: "text-base",
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-2">
        {/* Heading Level Selector */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                content.level === level
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
              title={`Heading ${level}`}
            >
              H{level}
            </button>
          ))}
        </div>

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
                    onConvert("quote");
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Quote size={14} />
                  Convert to Quote
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

      {/* Heading Input */}
      <textarea
        value={content.text}
        onChange={handleTextChange}
        placeholder={`Heading ${content.level}`}
        className={`w-full px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 resize-none font-bold text-gray-900 dark:text-white ${
          headingClasses[content.level as keyof typeof headingClasses]
        }`}
        rows={1}
        style={{ overflow: "hidden" }}
      />
    </div>
  );
}
