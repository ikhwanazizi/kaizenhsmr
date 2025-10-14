// src/app/admin/blog/posts-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/shared/DataTable";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import { createPost, deletePost } from "../posts/actions";

// Define the type for a single post, including the author object
type PostWithAuthor = {
  id: string;
  title: string | null;
  slug: string | null;
  category: string | null;
  status: string | null;
  published_at: string | null;
  author: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function PostsClient({ posts }: { posts: PostWithAuthor[] }) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<PostWithAuthor | null>(null);

  const handleCreatePost = async (category: "blog" | "development") => {
    setIsCreating(true);
    const result = await createPost(category);
    if (result.success && result.postId) {
      router.push(`/admin/editor/${result.postId}`);
    } else {
      alert(result.message || "Failed to create post.");
      setIsCreating(false);
    }
  };

  const handleOpenDeleteModal = (post: PostWithAuthor) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    const result = await deletePost(postToDelete.id);
    if (!result.success) {
      alert(result.message || "Failed to delete post.");
    }
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setPostToDelete(null);
    // The page will be revalidated by the server action, so no need to refetch here.
  };

  const columns: Column<PostWithAuthor>[] = [
    {
      key: "title",
      label: "Title",
      render: (post) => (
        <span className="font-medium text-slate-900 dark:text-white">
          {post.title}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (post) => (
        <span className="capitalize">{post.category || "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (post) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            post.status === "published"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {post.status
            ? post.status.charAt(0).toUpperCase() + post.status.slice(1)
            : "N/A"}
        </span>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (post) => post.author?.full_name || post.author?.email || "N/A",
    },
    {
      key: "published_at",
      label: "Published Date",
      render: (post) =>
        post.published_at
          ? new Date(post.published_at).toLocaleDateString()
          : "Not Published",
    },
  ];

  return (
    <div className="space-y-6">
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message={`Are you sure you want to permanently delete "${
          postToDelete?.title || "this post"
        }"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />

      <DataTable
        data={posts}
        columns={columns}
        searchable={true}
        searchKeys={["title", "category", "status"]}
        pagination={true}
        itemsPerPage={10}
        headerActions={
          <div className="flex gap-2">
            <button
              onClick={() => handleCreatePost("blog")}
              disabled={isCreating}
              className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <PlusCircle size={20} />
              <span>New Blog Post</span>
            </button>
            <button
              onClick={() => handleCreatePost("development")}
              disabled={isCreating}
              className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm font-semibold text-white transition-colors bg-purple-600 rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-50"
            >
              <PlusCircle size={20} />
              <span>New Development Post</span>
            </button>
          </div>
        }
        actions={(post) => (
          <>
            <button
              onClick={() => router.push(`/admin/editor/${post.id}`)}
              className="font-medium text-blue-600 transition-colors hover:text-blue-800"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleOpenDeleteModal(post)}
              className="font-medium text-red-600 transition-colors hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
        emptyMessage="No posts found. Create one to get started."
      />
    </div>
  );
}
