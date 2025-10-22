// src/components/blog/PostRenderer.tsx
"use client";

import { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Import language dependencies in the correct order
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

// ✅ FIX: Enhanced function to handle more Tiptap node types and marks, including tables, alignments, and additional formatting
const renderTiptapContent = (node: any): string => {
    if (!node) return '';

    let html = '';

    // Handle text nodes with marks (bold, italic, link, strike, underline, highlight, code)
    if (node.type === 'text' && node.text) {
        html = node.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        if (node.marks) {
            node.marks.forEach((mark: any) => {
                switch (mark.type) {
                    case 'bold':
                        html = `<strong>${html}</strong>`;
                        break;
                    case 'italic':
                        html = `<em>${html}</em>`;
                        break;
                    case 'strike':
                        html = `<s>${html}</s>`;
                        break;
                    case 'underline':
                        html = `<u>${html}</u>`;
                        break;
                    case 'code':
                        html = `<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded">${html}</code>`;
                        break;
                    case 'highlight':
                        if (mark.attrs && mark.attrs.color) {
                            html = `<mark style="background-color: ${mark.attrs.color};">${html}</mark>`;
                        } else {
                            html = `<mark>${html}</mark>`;
                        }
                        break;
                    case 'link':
                        if (mark.attrs && mark.attrs.href) {
                            html = `<a href="${mark.attrs.href}" class="text-[#008080] hover:underline" target="_blank" rel="noopener noreferrer">${html}</a>`;
                        }
                        break;
                }
            });
        }
    }

    // Handle element nodes (paragraphs, lists, tables, etc.)
    if (node.content) {
        const children = node.content.map(renderTiptapContent).join('');
        let styleAttr = '';
        if (node.attrs && node.attrs.textAlign) {
            styleAttr = ` style="text-align: ${node.attrs.textAlign};"`;
        }
        switch (node.type) {
            case 'paragraph':
                html = `<p class="mb-4"${styleAttr}>${children}</p>`;
                break;
            case 'bulletList':
                html = `<ul class="list-disc pl-6 mb-4"${styleAttr}>${children}</ul>`;
                break;
            case 'orderedList':
                html = `<ol class="list-decimal pl-6 mb-4"${styleAttr}>${children}</ol>`;
                break;
            case 'listItem':
                html = `<li${styleAttr}>${children}</li>`;
                break;
            case 'horizontalRule':
                html = '<hr class="my-8 border-t border-gray-300">';
                break;
            case 'table':
                html = `<table class="w-full border-collapse border border-gray-300">${children}</table>`;
                break;
            case 'tableRow':
                html = `<tr class="border-b border-gray-300 last:border-b-0">${children}</tr>`;
                break;
            case 'tableHeader':
                html = `<th class="border border-gray-300 p-3 text-left bg-gray-100 font-semibold"${styleAttr}>${children}</th>`;
                break;
            case 'tableCell':
                html = `<td class="border border-gray-300 p-3 text-left"${styleAttr}>${children}</td>`;
                break;
            case 'doc': // The root node for a block
                html = children;
                break;
            default:
                html = children; // Render children for any other node type
        }
    }
    
    return html;
};

export default function PostRenderer({ blocks }: { blocks: Block[] }) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
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
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/);
        return match ? match[1] : "";
    };

    const renderBlock = (block: Block) => {
        const blockId = `heading-${block.id}`;

        switch (block.type) {
            case "heading": {
                const { level, text } = block.content;
                const commonProps = {
                    id: blockId,
                    className: level === 2 
                        ? "text-3xl font-bold text-gray-900 mb-6 mt-12" 
                        : "text-2xl font-bold text-gray-800 mb-4 mt-8",
                };

                switch (level) {
                    case 1: return <h1 {...commonProps}>{text}</h1>;
                    case 2: return <h2 {...commonProps}>{text}</h2>;
                    case 3: return <h3 {...commonProps}>{text}</h3>;
                    case 4: return <h4 {...commonProps}>{text}</h4>;
                    case 5: return <h5 {...commonProps}>{text}</h5>;
                    case 6: return <h6 {...commonProps}>{text}</h6>;
                    default: return <p {...commonProps}>{text}</p>;
                }
            }

            case "paragraph":
            case "table": // ✅ FIX: Now handles tables via renderTiptapContent
                return (
                    <div
                        className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-6"
                        dangerouslySetInnerHTML={{ __html: renderTiptapContent(block.content) }}
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
                        <p className="text-xl italic text-gray-800 mb-2">{block.content.text}</p>
                        {block.content.author && (
                            <cite className="text-sm text-gray-600 not-italic">— {block.content.author}</cite>
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
                            {copiedCode === block.id ? ( <><Check size={16} /> Copied</> ) : ( <><Copy size={16} /> Copy</> )}
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
    
    return (
        <div className="prose prose-lg max-w-none">
            {blocks.map((block) => (
                <div key={block.id}>{renderBlock(block)}</div>
            ))}
        </div>
    );
}