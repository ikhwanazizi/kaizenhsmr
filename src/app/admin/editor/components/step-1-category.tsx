// src/app/admin/editor/components/step-1-category.tsx
"use client";
import { FileText, Rocket } from "lucide-react";

type Step1CategoryProps = {
  onSelectCategory: (category: "blog" | "development") => void;
  isSaving: boolean;
};

export default function Step1Category({
  onSelectCategory,
  isSaving,
}: Step1CategoryProps) {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Choose Post Category
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select the type of content you want to create. This cannot be
            changed later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blog Post Option */}
          <button
            onClick={() => onSelectCategory("blog")}
            disabled={isSaving}
            className="group relative border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-left">
                Blog Post
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-left leading-relaxed">
                Write an article, share news, or publish insights for your
                audience.
              </p>

              {/* Feature List */}
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Articles and thought leadership</span>
                </li>
                <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Company news and updates</span>
                </li>
                <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Industry insights</span>
                </li>
              </ul>
            </div>
          </button>

          {/* Development Update Option */}
          <button
            onClick={() => onSelectCategory("development")}
            disabled={isSaving}
            className="group relative border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-purple-50 dark:bg-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 dark:bg-purple-900/50 rounded-lg group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-left">
                Development Update
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 text-left leading-relaxed">
                Announce new features, bug fixes, or updates to your product.
              </p>

              {/* Feature List */}
              <ul className="mt-4 space-y-2 text-left">
                <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Product releases</span>
                </li>
                {/* <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Bug fixes and improvements</span>
                </li> */}
                <li className="flex items-start text-xs text-gray-500 dark:text-gray-400">
                  <span className="mr-2">•</span>
                  <span>Technical announcements</span>
                </li>
              </ul>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Note:</strong> The category affects how your post appears in
            navigation and determines the URL structure. Choose carefully as
            this cannot be changed later.
          </p>
        </div>
      </div>
    </div>
  );
}
