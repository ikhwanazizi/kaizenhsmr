// src/lib/public-settings.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// ADD THESE LINES AT THE TOP
export const revalidate = 0;
export const dynamic = "force-dynamic";

export type PublicSettings = {
  company_slogan: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
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
  contact_phone: "+603-62010242",
  contact_email: "inquiry@kaizenhrms.com",
  contact_address: "Suite D-05-01, 5th Floor, Block D, Plaza Mont Kiara, 50480 Kuala Lumpur, Malaysia",
  social_links: [],
  link_app_store: "",
  link_google_play: "",
  footer_copyright_text: "© KaiZenHR Sdn Bhd 2025. All Rights Reserved.",
  home_hero_video_id: "https://www.youtube.com/embed/p4-USNtPYrY",
  marketing_trial_image: "",
  marketing_award_image_1: "/apicta.png",
  marketing_award_image_2: "/Module_Brochure_Kaizen_Draft.png",
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            cache: "no-store", // This disables Next.js caching
          }),
      },
    }
  );

  try {
    const keys = [
      "company_slogan",
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

    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", keys);

    if (error || !data) {
      console.warn("Error fetching public settings:", error);
      return DEFAULT_SETTINGS;
    }

    const settings: any = { ...DEFAULT_SETTINGS };

    data.forEach((item) => {
      const key = item.key;
      let value = item.value;

      if (key === "social_links") {
        if (typeof value === "string") {
          try { value = JSON.parse(value); } catch {}
          if (typeof value === "string") {
            try { value = JSON.parse(value); } catch {}
          }
        }
        settings[key] = Array.isArray(value) ? value : [];
      } else {
        if (typeof value === "string") {
          if (value.startsWith('"') && value.endsWith('"')) {
            try { value = JSON.parse(value); } catch {}
          }
        }
        settings[key] = value === null || value === undefined ? "" : String(value);
      }
    });

    return settings as PublicSettings;
  } catch (error) {
    console.error("Failed to fetch public settings:", error);
    return DEFAULT_SETTINGS;
  }
}