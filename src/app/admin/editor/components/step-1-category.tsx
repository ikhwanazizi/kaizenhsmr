// src/app/admin/editor/components/step-1-category.tsx
"use client";

type Step1CategoryProps = {
  onSelectCategory: (category: "blog" | "development") => void;
  isSaving: boolean;
};

export default function Step1Category({
  onSelectCategory,
  isSaving,
}: Step1CategoryProps) {
  return (
    <div className="max-w-xl mx-auto text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Choose Post Category</h2>
      <p className="text-gray-600 mb-8">
        Select whether you are writing a blog article or a product development
        update. This cannot be changed later.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelectCategory("blog")}
          disabled={isSaving}
          className="p-6 border-2 border-gray-300 rounded-lg text-left hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          <h3 className="font-bold text-lg">📝 Blog Post</h3>
          <p className="text-sm text-gray-500 mt-1">
            Write an article, share news, or publish insights for your audience.
          </p>
        </button>
        <button
          onClick={() => onSelectCategory("development")}
          disabled={isSaving}
          className="p-6 border-2 border-gray-300 rounded-lg text-left hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
        >
          <h3 className="font-bold text-lg">🚀 Development Update</h3>
          <p className="text-sm text-gray-500 mt-1">
            Announce new features, bug fixes, or updates to your product.
          </p>
        </button>
      </div>
    </div>
  );
}
