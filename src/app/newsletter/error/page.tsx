// src/app/newsletter/error/page.tsx
import { Suspense } from "react";
import ErrorDisplay from "./error-client";

// This is now a Server Component
export default function ErrorPage() {
  return (
    // Wrap your new client component in <Suspense>
    <Suspense fallback={<div>Loading error...</div>}>
      <ErrorDisplay />
    </Suspense>
  );
}
