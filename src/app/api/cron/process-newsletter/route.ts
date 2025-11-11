// src/app/api/cron/process-newsletter/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { processNewsletterQueue } from "@/app/admin/blog/newsletterActions";

export async function GET(req: NextRequest) {
  // 1. Secure the endpoint
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Run the queue processing
  try {
    const result = await processNewsletterQueue();
    if (!result.success) {
      // Log the error but return a 500
      console.error("Cron Job Error:", result.message);
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // --- ✅ FIX: 'result' already contains the 'success' property ---
    return NextResponse.json(result, { status: 200 });
    // --- End of Fix ---

  } catch (error: any) {
    console.error("Cron API Error:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}