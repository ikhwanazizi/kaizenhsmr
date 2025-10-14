// src/app/admin/editor/components/step-2-seo.tsx
"use client";

import type { Database } from "@/types/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];

interface Step2SEOProps {
  post: Post;
  setPost: React.Dispatch<React.SetStateAction<Post>>;
}

export default function Step2SEO({ post, setPost }: Step2SEOProps) {
  const metadata = (post.metadata || {}) as any;

  // Helper to update post state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setPost((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper to update metadata state
  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost((prev) => ({
      ...prev,
      metadata: {
        ...(prev.metadata as object),
        [e.target.name]: e.target.value,
      },
    }));
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">Search Engine Optimization</h2>
          <p className="text-sm text-gray-500">
            Customize how your post appears on search engines like Google.
          </p>
        </div>

        {/* Slug Field */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            URL Slug
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
              /posts/
            </span>
            <input
              type="text"
              name="slug"
              id="slug"
              value={post.slug || ""}
              onChange={handleChange}
              className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              placeholder="your-post-slug"
            />
          </div>
        </div>

        {/* SEO Title */}
        <div>
          <label
            htmlFor="seo_meta_title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Meta Title
          </label>
          <input
            type="text"
            name="seo_meta_title"
            id="seo_meta_title"
            value={post.seo_meta_title || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            placeholder="A catchy title for search results"
          />
        </div>

        {/* SEO Description */}
        <div>
          <label
            htmlFor="seo_meta_description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Meta Description
          </label>
          <textarea
            name="seo_meta_description"
            id="seo_meta_description"
            rows={3}
            value={post.seo_meta_description || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            placeholder="A brief summary to entice readers."
          />
        </div>

        {/* Conditional Fields for Development Category */}
        {post.category === "development" && (
          <div className="space-y-6 pt-6 border-t dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold">Development Details</h2>
              <p className="text-sm text-gray-500">
                Provide versioning and release information.
              </p>
            </div>
            <div>
              <label
                htmlFor="version"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Version Number (e.g., v1.2.0)
              </label>
              <input
                type="text"
                name="version"
                id="version"
                value={metadata.version || ""}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="v1.2.0"
              />
            </div>
            <div>
              <label
                htmlFor="release_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Release Date
              </label>
              <input
                type="date"
                name="release_date"
                id="release_date"
                value={metadata.release_date || ""}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="release_notes_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Release Notes URL
              </label>
              <input
                type="url"
                name="release_notes_url"
                id="release_notes_url"
                value={metadata.release_notes_url || ""}
                onChange={handleMetadataChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="https://your-repo.com/releases/v1.2.0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
