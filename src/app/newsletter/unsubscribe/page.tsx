// src/app/newsletter/unsubscribe/page.tsx
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string }>;
}) {
  // ✅ You MUST await this in Next.js 15
  const { status, message } = await searchParams;
  const isSuccess = status === "success";

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-slate-800">
        <div className="text-center">
          {isSuccess ? (
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          ) : (
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
          )}

          <h1 className="mt-4 text-3xl font-bold text-slate-800 dark:text-slate-100">
            {isSuccess ? "Successfully Unsubscribed" : "Something Went Wrong"}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isSuccess
              ? "You will no longer receive newsletters from us."
              : message || "The unsubscribe link is invalid or has expired."}
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
