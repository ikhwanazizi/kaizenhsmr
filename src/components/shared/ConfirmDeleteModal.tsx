// src/components/shared/ConfirmDeleteModal.tsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  isDeleting?: boolean;
};

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent scroll
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <>
      {/* FULL-SCREEN BACKDROP – PORTAL GUARANTEES COVERAGE */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-lg z-[9998] transition-opacity duration-200"
        onClick={onClose}
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          position: "fixed",
        }}
      />

      {/* MODAL CARD */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto w-full max-w-md rounded-xl bg-white dark:bg-gray-800",
            "border border-gray-200 dark:border-gray-700",
            "shadow-2xl overflow-hidden",
            "animate-in fade-in-0 zoom-in-95 duration-200 ease-out"
          )}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2
                id="delete-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
                "hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors",
                isDeleting && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg",
                "bg-red-600 text-white hover:bg-red-700",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              )}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // RENDER VIA PORTAL TO document.body
  return createPortal(modal, document.body);
}
