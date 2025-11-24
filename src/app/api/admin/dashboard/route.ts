// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to verify auth
async function checkAuth(req: NextRequest) {
  const cookieStore = await cookies();
  const { createServerClient } = await import("@supabase/ssr");
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await checkAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Run counts in parallel for speed
    const [
      { count: subscribersCount },
      { count: contactsCount },
      { count: usersCount },
      { count: postsCount },
      { count: newContactsCount },
    ] = await Promise.all([
      supabaseAdmin.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("contact_submissions").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

    // 2. Fetch recent contacts (Limit 5)
    const { data: recentContacts } = await supabaseAdmin
      .from("contact_submissions")
      .select("id, full_name, company, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Fetch recent audit logs (Limit 5)
    const { data: recentActivity } = await supabaseAdmin
      .from("admin_audit_log")
      .select(`
        id,
        action,
        created_at,
        details,
        profiles:admin_id (full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    // 4. --- CHART DATA GENERATION ---

    // A. Inquiry Status Distribution
    // Fetch only the status column to aggregate in memory (efficient for < 10k records)
    const { data: allContacts } = await supabaseAdmin
      .from("contact_submissions")
      .select("status");

    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      replied: 0,
      closed: 0
    };

    allContacts?.forEach((c) => {
      const s = c.status?.toLowerCase();
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    });

    const inquiryChartData = [
      { name: 'New', value: statusCounts.new, color: '#3b82f6' },
      { name: 'Contacted', value: statusCounts.contacted, color: '#f59e0b' },
      { name: 'Replied', value: statusCounts.replied, color: '#10b981' },
      { name: 'Closed', value: statusCounts.closed, color: '#64748b' },
    ];

    // B. Subscriber Growth (Last 6 Months Cumulative)
    const { data: allSubscribers } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("created_at")
      .order("created_at", { ascending: true });

    const subscriberChartData = [];
    const monthsToTrack = 6;
    const today = new Date();
    
    for (let i = monthsToTrack - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      // Calculate end of this month
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      // Count subscribers created on or before this month
      const count = allSubscribers?.filter(s => new Date(s.created_at) <= endOfMonth).length || 0;
      
      subscriberChartData.push({ name: monthName, subscribers: count });
    }

    return NextResponse.json({
      stats: {
        totalSubscribers: subscribersCount || 0,
        totalContacts: contactsCount || 0,
        newContacts: newContactsCount || 0,
        totalUsers: usersCount || 0,
        totalPosts: postsCount || 0,
      },
      recentContacts: recentContacts || [],
      recentActivity: recentActivity || [],
      charts: {
        inquiries: inquiryChartData,
        subscribers: subscriberChartData
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}