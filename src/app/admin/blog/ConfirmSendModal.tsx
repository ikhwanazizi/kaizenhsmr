// src/app/admin/blog/ConfirmSendModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Mail,
  Users,
  Loader2,
  Send,
  X,
  FileText,
  CalendarClock, // <-- IMPORT THIS
} from "lucide-react";
// 1. Import the new action
import {
  getNewsletterModalData,
  sendTestNewsletter,
  scheduleNewsletter, // <-- IMPORT THE RENAMED ACTION
} from "./newsletterActions";
import type { PostWithAuthor } from "./posts-client";
import { toast } from "react-hot-toast";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  post: PostWithAuthor | null;
  onSendComplete: () => void;
};

type NewsletterData = {
  adminEmail: string;
  postTitle: string;
  postPreview: string;
  postImage: string | null;
  subscriberCount: number;
};

export default function ConfirmSendModal({
  isOpen,
  onClose,
  post,
  onSendComplete,
}: ModalProps) {
  const [data, setData] = useState<NewsletterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false); // <-- Renamed

  useEffect(() => {
    if (isOpen && post) {
      setLoading(true);
      setError(null);
      setData(null);

      getNewsletterModalData(post.id)
        .then((result) => {
          if (result.success) {
            setData(result as NewsletterData);
          } else {
            setError(result.message || "Failed to load data.");
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, post]);

  // This function is already complete
  const handleSendTest = async () => {
    if (!post || !data) return;
    setIsSendingTest(true);
    const toastId = toast.loading("Sending test email...");
    const result = await sendTestNewsletter(post.id, data.adminEmail);
    if (result.success) {
      toast.success("Test email sent successfully!", { id: toastId });
    } else {
      toast.error(`Failed to send test: ${result.message}`, { id: toastId });
    }
    setIsSendingTest(false);
  };

  // --- 2. UPDATE THIS FUNCTION ---
  const handleScheduleAll = async () => {
    if (!data || !post) return;

    if (
      !confirm(
        `Are you sure you want to SCHEDULE this newsletter for all ${data.subscriberCount} subscribers?\n\nIt will be sent in batches based on the daily quota.`
      )
    ) {
      return;
    }

    setIsScheduling(true); // <-- Use renamed state
    const toastId = toast.loading(
      `Scheduling newsletter for ${data.subscriberCount} subscribers...`
    );

    // <-- Call the renamed action
    const result = await scheduleNewsletter(post.id);

    if (result.success) {
      toast.success(result.message || "Campaign scheduled!", { id: toastId });
      onSendComplete(); // This closes modal and refreshes the list
    } else {
      toast.error(`Failed to schedule: ${result.message}`, { id: toastId });
    }
    setIsScheduling(false); // <-- Use renamed state
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Schedule Newsletter
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          {loading && (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="mt-2 text-sm text-gray-500">Loading data...</p>
            </div>
          )}

          {error && (
            // ... (error display remains unchanged) ...
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <p className="mt-2 font-semibold text-red-700">
                Error loading data
              </p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              {/* ... (Preview and Stats sections remain unchanged) ... */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">
                  Email Preview
                </label>
                <div className="flex gap-4 p-4 mt-1 border border-gray-200 rounded-lg dark:border-gray-700">
                  {data.postImage ? (
                    <img
                      src={data.postImage}
                      alt="Preview"
                      className="flex-shrink-0 w-24 h-24 rounded-md object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      <span className="font-bold">Subject:</span>{" "}
                      {data.postTitle}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      <span className="font-bold">Preview:</span>{" "}
                      {data.postPreview}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    Subscribers
                  </p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-200">
                    {data.subscriberCount}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={isSendingTest || isScheduling}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-md dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 disabled:opacity-50"
                >
                  {isSendingTest ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Send Test to {data.adminEmail}
                </button>
                <button
                  type="button"
                  onClick={handleScheduleAll}
                  disabled={
                    isSendingTest || isScheduling || data.subscriberCount === 0
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:bg-green-300"
                >
                  {isScheduling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarClock className="w-4 h-4" /> // <-- Changed Icon
                  )}
                  Schedule for {data.subscriberCount} Subscribers
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isScheduling}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md sm:ml-auto dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
