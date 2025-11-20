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
  social_links?: string; // JSON string: { platform: string; url: string }[]
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
};

export async function getPublicSettings(): Promise<PublicSettings> {
  const supabase = await createClient();
  
  const keys = [
    "contact_address",
    "contact_email",
    "contact_phone",
    "company_slogan",
    "company_founding_year",
    "social_links", // <--- CHANGED
    "link_app_store",
    "link_google_play",
    "home_hero_video_id",
    "marketing_award_image_1",
    "marketing_award_image_2",
    "marketing_trial_image",
    "integration_google_maps_embed",
    "footer_copyright_text"
  ];

  const { data } = await supabase
    .from("system_settings")
    .select("key, value")
    .in("key", keys);

  const settings: PublicSettings = {};
  
  if (data) {
    data.forEach((row) => {
      try {
        // Handle JSON strings if they were saved that way
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