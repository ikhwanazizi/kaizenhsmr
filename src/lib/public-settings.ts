"use server";

import { createClient } from "@/lib/server";

export type PublicSettings = {
  // Contact
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Branding
  company_slogan?: string;
  company_founding_year?: string;
  
  // Social & Apps
  social_links?: string;
  link_app_store?: string;
  link_google_play?: string;
  
  // Hero
  home_hero_video_id?: string;

  // Marketing
  marketing_award_image_1?: string;
  marketing_award_image_2?: string;
  marketing_trial_image?: string;

  // Integrations
  integration_google_maps_embed?: string;
  
  // Footer
  footer_copyright_text?: string;

  // --- NEW: Feature Toggles ---
  enable_maintenance_mode?: string; // "true" | "false"
  enable_public_registration?: string; // "true" | "false"

  // --- NEW: Blog ---
  blog_default_author_name?: string;
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  
  const keys = [
    "contact_address",
    "contact_email",
    "contact_phone",
    "company_slogan",
    "company_founding_year",
    "social_links",
    "link_app_store",
    "link_google_play",
    "home_hero_video_id",
    "marketing_award_image_1",
    "marketing_award_image_2",
    "marketing_trial_image",
    "integration_google_maps_embed",
    "footer_copyright_text",
    // New Keys
    "enable_maintenance_mode",
    "enable_public_registration",
    "blog_default_author_name"
  ];

  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", keys);

  const settings: PublicSettings = {};
  
  if (data) {
    data.forEach((row) => {
      try {
        const parsed = JSON.parse(row.value as string);
        // @ts-ignore
        settings[row.key] = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
      } catch {
        // @ts-ignore
        settings[row.key] = row.value as string;
      }
    });
  }

  return settings;
}