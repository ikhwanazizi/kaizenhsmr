// src/app/admin/editor/[postId]/editor-client.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/supabase";
import {
  updatePostCategory,
  updatePostDetails,
  updatePostContent,
  publishPost,
} from "../../posts/actions";
import { convertTiptapToDbBlocks } from "../utils/converters";
import StepIndicator from "../components/step-indicator";
import Step1Category from "../components/step-1-category";
import Step2SEO from "../components/step-2-seo";
import Step3Content from "../components/step-3-content";
import Step4Review from "../components/step-4-review"; // <-- Import Step 4
import { JSONContent } from "@tiptap/react";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostBlock = Database["public"]["Tables"]["post_blocks"]["Row"];

export default function EditorClient({
  initialPost,
  initialBlocks,
}: {
  initialPost: Post;
  initialBlocks: PostBlock[];
}) {
  const router = useRouter();
  const STEPS = ["Category", "SEO", "Content", "Review"];
  const [currentStep, setCurrentStep] = useState(
    initialPost.category ? (initialPost.title !== "Untitled Post" ? 3 : 2) : 1
  );
  const [post, setPost] = useState<Post>(initialPost);
  const [blocks, setBlocks] = useState<PostBlock[]>(initialBlocks);
  const [isSaving, setIsSaving] = useState(false);

  // A ref to hold a function that can get the editor's current JSON state
  const getEditorJSONRef = useRef<(() => JSONContent | undefined) | undefined>(
    undefined
  );

  const handleSelectCategory = async (category: "blog" | "development") => {
    setIsSaving(true);
    const result = await updatePostCategory(post.id, category);
    if (result.success) {
      setPost({ ...post, category });
      setCurrentStep(2);
    } else {
      alert(result.message);
    }
    setIsSaving(false);
  };

  const handleNext = async () => {
    setIsSaving(true);
    let success = false;

    if (currentStep === 2) {
      const result = await updatePostDetails(post.id, post);
      if (result.success) setCurrentStep(3);
      success = result.success;
    } else if (currentStep === 3) {
      const editorJSON = getEditorJSONRef.current?.();
      if (editorJSON) {
        const newBlocks = convertTiptapToDbBlocks(post.id, editorJSON);
        const result = await updatePostContent(
          post.id,
          { title: post.title, excerpt: post.excerpt },
          newBlocks
        );
        if (result.success) {
          setBlocks(newBlocks as PostBlock[]); // Update local blocks state
          setCurrentStep(4);
        }
        success = result.success;
      }
    } else if (currentStep === 4) {
      // Publish the post
      const result = await publishPost(post.id);
      if (result.success) {
        alert("Post published successfully!");
        router.push("/admin/blog");
      } else {
        alert(result.message);
      }
      success = result.success;
    } else {
      setCurrentStep(currentStep + 1);
      success = true;
    }

    setIsSaving(false);
  };

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          setStep={goToStep}
          totalSteps={STEPS.length}
        />
      </div>

      <div className="flex-grow">
        {currentStep === 1 && (
          <Step1Category
            onSelectCategory={handleSelectCategory}
            isSaving={isSaving}
          />
        )}
        {currentStep === 2 && <Step2SEO post={post} setPost={setPost} />}
        {currentStep === 3 && (
          <Step3Content
            post={post}
            setPost={setPost}
            initialBlocks={blocks}
            getEditorJSON={getEditorJSONRef as any}
          />
        )}
        {currentStep === 4 && <Step4Review post={post} blocks={blocks} />}
      </div>

      {currentStep > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isSaving}
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
              currentStep === STEPS.length
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving
              ? "Saving..."
              : currentStep === STEPS.length
                ? "Publish Now"
                : "Next Step"}
          </button>
        </div>
      )}
    </div>
  );
}
