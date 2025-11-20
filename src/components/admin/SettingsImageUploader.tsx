"use client";

import { useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { compressImage } from "@/app/admin/editor/utils/image-compressor"; // Using your existing compressor

interface SettingsImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucketName?: string;
}

export default function SettingsImageUploader({
  label,
  value,
  onChange,
  bucketName = "post-images", // Defaulting to your existing bucket
}: SettingsImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side Supabase for storage uploads
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Compress image (Optimizes JPG/PNG/HEIF to WebP, preserves GIFs)
      const processedFile = await compressImage(file, {
        maxWidth: 1200,
        quality: 0.8,
      });

      // 2. Prepare file path
      const fileExt = processedFile.type === "image/gif" ? "gif" : "webp";
      const fileName = `settings-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `public/settings/${fileName}`;

      // 3. Upload to Supabase
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, processedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // 4. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      // 5. Update parent state
      onChange(publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Image Preview Area */}
      {value && (
        <div className="relative w-full max-w-md h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-600">
          {/* Use img tag for broad compatibility with external URLs */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={`${label} Preview`}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-sm"
            type="button"
            title="Remove Image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Controls */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg dark:bg-gray-900 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none dark:text-white transition-all"
            placeholder="https://example.com/image.jpg"
          />
          <ImageIcon
            className="absolute left-3 top-2.5 text-gray-400"
            size={16}
          />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/gif, image/heif, image/webp"
          onChange={handleUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          Upload
        </button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Supported: JPG, PNG, GIF, HEIF. Max size: 5MB.
      </p>
    </div>
  );
}
