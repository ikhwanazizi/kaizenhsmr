// src/components/blog/PostRenderer.tsx
"use client";

import { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-csharp";
import { Copy, Check } from "lucide-react";

type Block = {
  id: string;
  type: string;
  content: any;
  order_index: number;
};

// FULLY FIXED: Dark text, bold links, centered text, no prose override
const renderTiptapContent = (node: any): string => {
  if (!node) return "";

  // Handle text nodes
  if (node.type === "text" && node.text) {
    let html = node.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Apply marks (bold, link, etc.)
    if (node.marks) {
      const marks = [...node.marks].reverse();
      marks.forEach((mark) => {
        switch (mark.type) {
          case "bold":
            html = `<strong>${html}</strong>`;
            break;
          case "italic":
            html = `<em>${html}</em>`;
            break;
          case "strike":
            html = `<s>${html}</s>`;
            break;
          case "underline":
            html = `<u>${html}</u>`;
            break;
          case "code":
            html = `<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">${html}</code>`;
            break;
          case "highlight":
            const color = mark.attrs?.color || "#fef9c3";
            html = `<mark style="background-color: ${color}">${html}</mark>`;
            break;
          case "link":
            const href = mark.attrs?.href;
            if (href) {
              const target = mark.attrs?.target || "_blank";
              const rel = mark.attrs?.rel || "noopener noreferrer nofollow";
              const linkClass =
                mark.attrs?.class ||
                "text-[#008080] hover:text-[#006666] underline font-semibold transition-colors";
              html = `<a href="${href}" class="${linkClass}" target="${target}" rel="${rel}">${html}</a>`;
            }
            break;
        }
      });
    }
    return html;
  }

  // Handle container nodes
  const children = node.content
    ? node.content.map(renderTiptapContent).join("")
    : "";

  // Apply textAlign
  const textAlign = node.attrs?.textAlign;
  const styleAttr = textAlign ? ` style="text-align: ${textAlign};"` : "";

  switch (node.type) {
    case "paragraph":
      return `<p class="mb-4 leading-relaxed text-gray-900 font-medium"${styleAttr}>${children || "&nbsp;"}</p>`;

    case "heading":
      const level = node.attrs?.level || 2;
      const headingClass = `font-bold mb-4 mt-8 text-gray-900`;
      const sizeClass =
        level === 1
          ? "text-4xl"
          : level === 2
            ? "text-3xl"
            : level === 3
              ? "text-2xl"
              : "text-xl";
      return `<h${level} class="${sizeClass} ${headingClass}"${styleAttr}>${children}</h${level}>`;

    case "bulletList":
      return `<ul class="list-disc pl-6 mb-4 space-y-1"${styleAttr}>${children}</ul>`;

    case "orderedList":
      return `<ol class="list-decimal pl-6 mb-4 space-y-1"${styleAttr}>${children}</ol>`;

    case "listItem":
      return `<li class="leading-relaxed"${styleAttr}>${children}</li>`;

    case "horizontalRule":
      return '<hr class="my-8 border-t-2 border-gray-200">';

    case "table":
      return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse bg-white border border-gray-200 rounded-lg shadow-sm">${children}</table></div>`;

    case "tableRow":
      return `<tr class="border-b border-gray-200 hover:bg-gray-50">${children}</tr>`;

    case "tableHeader":
      return `<th class="border border-gray-200 px-4 py-2 bg-gray-50 font-semibold text-gray-700 text-center align-middle"${styleAttr}>${children}</th>`;

    case "tableCell":
      return `<td class="border border-gray-200 px-4 py-2 text-gray-700 text-center align-middle"${styleAttr}>${children}</td>`;

    case "doc":
      return children;

    default:
      return children;
  }
};

export default function PostRenderer({ blocks }: { blocks: Block[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }
  }, [blocks]);

  const copyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const extractYouTubeId = (url: string) => {
    if (!url) return "";
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/
    );
    return match ? match[1] : "";
  };

  const renderBlock = (block: Block) => {
    const blockId = `heading-${block.id}`;

    switch (block.type) {
      case "heading": {
        const { level, text } = block.content;
        const commonProps = {
          id: blockId,
          className:
            level === 2
              ? "text-3xl font-bold text-gray-900 mb-6 mt-12"
              : "text-2xl font-bold text-gray-800 mb-4 mt-8",
        };

        switch (level) {
          case 1:
            return <h1 {...commonProps}>{text}</h1>;
          case 2:
            return <h2 {...commonProps}>{text}</h2>;
          case 3:
            return <h3 {...commonProps}>{text}</h3>;
          case 4:
            return <h4 {...commonProps}>{text}</h4>;
          case 5:
            return <h5 {...commonProps}>{text}</h5>;
          case 6:
            return <h6 {...commonProps}>{text}</h6>;
          default:
            return <p {...commonProps}>{text}</p>;
        }
      }

      case "paragraph":
      case "table":
        return (
          <div
            key={block.id}
            dangerouslySetInnerHTML={{
              __html: renderTiptapContent(block.content),
            }}
          />
        );

      case "image":
        return (
          <figure className="my-8">
            <img
              src={block.content.url}
              alt={block.content.alt || ""}
              className="w-full rounded-lg shadow-md"
            />
            {block.content.caption && (
              <figcaption className="text-center text-sm text-gray-600 mt-3">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );

      case "video":
        const videoId = extractYouTubeId(block.content.url);
        if (!videoId) return null;
        return (
          <figure className="my-8">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                title="YouTube Video"
              />
            </div>
            {block.content.caption && (
              <figcaption className="text-center text-sm text-gray-600 mt-3">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        );

      case "quote":
        return (
          <blockquote className="my-8 pl-6 py-4 border-l-4 border-[#008080] bg-[#f0fafa] rounded-r-lg">
            <p className="text-xl italic text-gray-800 mb-2">
              {block.content.text}
            </p>
            {block.content.author && (
              <cite className="text-sm text-gray-600 not-italic">
                — {block.content.author}
              </cite>
            )}
          </blockquote>
        );

      case "code":
        return (
          <div className="my-8 relative">
            <button
              onClick={() => copyCode(block.content.code, block.id)}
              className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm flex items-center gap-2"
            >
              {copiedCode === block.id ? (
                <>
                  <Check size={16} /> Copied
                </>
              ) : (
                <>
                  <Copy size={16} /> Copy
                </>
              )}
            </button>
            <pre className="!mt-0">
              <code className={`language-${block.content.language}`}>
                {block.content.code}
              </code>
            </pre>
          </div>
        );

      default:
        return null;
    }
  };

  // REMOVED `prose` CLASS → NO MORE MUTED TEXT
  return (
    <div className="max-w-none">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block)}</div>
      ))}
    </div>
  );
}
