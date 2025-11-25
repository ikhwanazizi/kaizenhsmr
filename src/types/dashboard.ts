// src/types/dashboard.ts

export type DashboardStat = {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string; // e.g., "+12%"
  trendLabel?: string; // e.g., "from last month"
  href: string;
  iconName: "FileText" | "Users" | "Mail" | "Activity" | "ShieldAlert" | "Server"; 
  color: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
};

export type ActivityItem = {
  id: string;
  type: "post" | "contact" | "campaign" | "audit_log";
  title: string; // Title, Subject, or Action name
  subtitle?: string; // Author, Company, or Target
  status: string;
  timestamp: string; // ISO string
  href: string;
};

export type SystemHealth = {
  emailQuota: {
    used: number;
    remaining: number;
    total: number;
  };
  auditLogRetention: number; // days
  maintenanceMode: boolean;
};

export type ContactQuickView = {
  id: string;
  full_name: string;
  company: string;
  status: string;
  created_at: string;
};

export type DashboardData = {
  stats: DashboardStat[];
  recentActivity: ActivityItem[];
  recentContacts: ContactQuickView[]; // For the table
  systemHealth?: SystemHealth; // Super Admin only
  userRole: "admin" | "super_admin";
  userName: string;
};