// src/app/newsletter/error/error-client.tsx
"use client";
import { useSearchParams } from "next/navigation";

export default function ErrorDisplay() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") || "An unexpected error occurred.";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-red-600">Verification Failed</h1>
      <p className="mt-4">{message}</p>
    </div>
  );
}
