// src/app/admin/blog/page.tsx
import { getAllPosts } from "../posts/actions";
import PostsClient from "./posts-client";

export default async function BlogManagementPage() {
  const { data: posts, message } = await getAllPosts();

  if (message) {
    return (
      <div className="p-4 text-red-500">Error fetching posts: {message}</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Post Management
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage all blog and development posts for the website.
        </p>
      </div>
      <PostsClient posts={posts as any} />
    </div>
  );
}
