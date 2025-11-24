import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { type PublicSettings } from "@/lib/public-settings";

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

function parseSettingValue(key: string, value: unknown) {
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

  if (typeof value === "boolean") return value.toString();
  if (value === null || value === undefined) return "";

  if (typeof value === "string" && value.startsWith("\"") && value.endsWith("\"")) {
    try {
      value = JSON.parse(value);
    } catch {
      // ignore
    }
  }

  return String(value);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              cache: "no-store",
            }),
        },
      }
    );

    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", PUBLIC_SETTING_KEYS);

    if (error || !data) {
      console.warn("Error fetching public settings via API:", error);
      return NextResponse.json({}, { status: 200 });
    }

    const settings: Partial<PublicSettings> = {};

    data.forEach((item) => {
      settings[item.key] = parseSettingValue(item.key, item.value);
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Public settings API error:", error);
    return NextResponse.json({}, { status: 200 });
  }
}
