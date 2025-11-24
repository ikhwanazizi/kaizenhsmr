// src/lib/public-settings.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// ADD THESE LINES AT THE TOP
export const revalidate = 0;
export const dynamic = "force-dynamic";

export type PublicSettings = {
  company_slogan: string;
  company_founding_year: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  integration_google_maps_embed: string;
  social_links: { platform: string; url: string }[];
  link_app_store: string;
  link_google_play: string;
  footer_copyright_text: string;
  enable_maintenance_mode?: string;
  enable_public_registration?: string;
  blog_default_author_name?: string;
  home_hero_video_id?: string;
  marketing_trial_image?: string;
  marketing_award_image_1?: string;
  marketing_award_image_2?: string;
};

const DEFAULT_SETTINGS: PublicSettings = {
  company_slogan: "Malaysia's Tier 1 Enterprise HR Solution",
  company_founding_year: "1997",
  contact_phone: "+603-62010242",
  contact_email: "inquiry@kaizenhrms.com",
  contact_address: "Suite D-05-01, 5th Floor, Block D, Plaza Mont Kiara, 50480 Kuala Lumpur, Malaysia",
  integration_google_maps_embed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.72930091868!2d101.64939557528581!3d3.165847553049145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f1965b1f3f%3A0xd37a5feb10a562f9!2sKaiZenHR%20Sdn%20Bhd!5e0!3m2!1sen!2smy!4v1763520954012!5m2!1sen!2smy",
  social_links: [],
  link_app_store: "",
  link_google_play: "",
  footer_copyright_text: "© KaiZenHR Sdn Bhd 2025. All Rights Reserved.",
  home_hero_video_id: "https://www.youtube.com/embed/p4-USNtPYrY",
  marketing_trial_image: "",
  marketing_award_image_1: "/apicta.png",
  marketing_award_image_2: "/Module_Brochure_Kaizen_Draft.png",
};

const PUBLIC_SETTING_KEYS = [
  "company_slogan",
  "company_founding_year",
  "contact_phone",
  "contact_email",
  "contact_address",
  "social_links",
  "link_app_store",
  "link_google_play",
  "footer_copyright_text",
  "enable_maintenance_mode",
  "enable_public_registration",
  "blog_default_author_name",
  "home_hero_video_id",
  "marketing_trial_image",
  "marketing_award_image_1",
  "marketing_award_image_2",
  "integration_google_maps_embed",
];

function parseSettingValue(
  key: keyof PublicSettings,
  value: unknown
): PublicSettings[keyof PublicSettings] {
  if (key === "social_links") {
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
      }
    }
    return Array.isArray(value) ? value : [];
  }

  // Preserve booleans so toggles behave consistently for middleware checks
  if (typeof value === "boolean") return value.toString();

  if (value === null || value === undefined) return "";

  // Handle wrapped JSON strings (e.g., "\"value\"")
  if (typeof value === "string" && value.startsWith("\"") && value.endsWith("\"")) {
    try {
      value = JSON.parse(value);
    } catch {
      // fallthrough
    }
  }

  return String(value);
}

async function fetchSettingsFromSupabase() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store", // Disable Next.js caching
          }),
      },
    }
  );

  const { data, error } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", PUBLIC_SETTING_KEYS);

  if (error || !data) {
    console.warn("Error fetching public settings:", error);
    return DEFAULT_SETTINGS;
  }

  const settings: Partial<PublicSettings> = { ...DEFAULT_SETTINGS };

  data.forEach((item) => {
    settings[item.key] = parseSettingValue(item.key, item.value);
  });

  return settings as PublicSettings;
}

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    // On the client, fetch via the API route so we don't need to expose privileged keys
    if (typeof window !== "undefined") {
      const res = await fetch("/api/public-settings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch public settings");
      const data = await res.json();
      return { ...DEFAULT_SETTINGS, ...data } as PublicSettings;
    }

    // Server-side fetch uses service role to bypass any public RLS restrictions
    return await fetchSettingsFromSupabase();
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return DEFAULT_SETTINGS;
  }
}