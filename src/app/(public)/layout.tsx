// src/app/(public)/layout.tsx
import React from "react";

// No metadata or fonts needed here, the root layout at src/app/layout.tsx handles it.

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // A nested layout should just return its children directly.
  // The <html> and <body> from the root layout will wrap this.
  return <>{children}</>;
}
