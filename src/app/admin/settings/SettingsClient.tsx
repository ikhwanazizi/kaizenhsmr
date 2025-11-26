// src/app/admin/settings/SettingsClient.tsx
"use client";

import { useState, useEffect } from "react";
import { updateSystemSetting } from "./actions";
import {
  Loader2,
  Save,
  Info,
  ChevronRight,
  Globe,
  Share2,
  Layout,
  Award,
  Plug,
  Copyright,
  RotateCcw,
  Plus,
  Trash2,
  ToggleLeft,
  Mail,
  FileText,
} from "lucide-react";
import Toast from "@/components/shared/Toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import SettingsImageUploader from "@/components/admin/SettingsImageUploader";

type SystemSettings = {
  [key: string]: string;
};

type Category = {
  id: string;
  label: string;
  icon: any;
};

type SocialLink = {
  platform: string;
  url: string;
};

const CATEGORIES: Category[] = [
  { id: "general", label: "General System", icon: Layout },
  { id: "features", label: "Feature Toggles", icon: ToggleLeft },
  { id: "email_config", label: "Email Configuration", icon: Mail },
  { id: "blog_config", label: "Blog Settings", icon: FileText },
  { id: "contact", label: "Contact & Company", icon: Globe },
  { id: "social", label: "Social & Apps", icon: Share2 },
  { id: "hero", label: "Homepage Hero", icon: Layout },
  { id: "marketing", label: "Marketing (Trial/Awards)", icon: Award },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "footer", label: "Footer", icon: Copyright },
];

// Define Factory Defaults
const FACTORY_DEFAULTS: SystemSettings = {
  newsletter_daily_limit: "100",
  audit_log_retention_days: "90",
  contact_address:
    "Suite D-05-01, 5th Floor, Block D,\nPlaza Mont Kiara,\n50480 Kuala Lumpur, Malaysia",
  contact_email: "inquiry@kaizenhrms.com",
  contact_phone: "+603-62010242",
  company_slogan: "Malaysia's Tier 1 Enterprise HR Solution",
  company_founding_year: "1997",
  social_links: JSON.stringify([
    { platform: "Facebook", url: "https://facebook.com" },
    { platform: "LinkedIn", url: "https://linkedin.com" },
  ]),
  link_app_store: "",
  link_google_play: "",
  home_hero_video_id: "https://www.youtube.com/embed/p4-USNtPYrY",
  marketing_award_image_1: "/apicta.png",
  marketing_award_image_2: "/Module_Brochure_Kaizen_Draft.png",
  marketing_trial_image:
    "https://www.kaizenhr.my/wp-content/uploads/2015/01/business.webp",
  integration_google_maps_embed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.72930091868!2d101.64939557528581!3d3.165847553049145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f1965b1f3f%3A0xd37a5feb10a562f9!2sKaiZenHR%20Sdn%20Bhd!5e0!3m2!1sen!2smy!4v1763566181982!5m2!1sen!2smy",
  footer_copyright_text: "© KaiZenHR Sdn Bhd 2025. All Rights Reserved.",
  enable_maintenance_mode: "false",
  enable_public_registration: "true",
  admin_notification_email: "kaizenhrdev@kaizenhr.my",
  email_sender_name: "KaizenHR",
  email_sender_address: "onboarding@resend.dev",
  blog_default_author_name: "KaizenHR Team",
};

// Map keys to categories
const CATEGORY_KEYS: Record<string, string[]> = {
  general: ["newsletter_daily_limit", "audit_log_retention_days"],
  features: ["enable_maintenance_mode", "enable_public_registration"],
  email_config: [
    "admin_notification_email",
    "email_sender_name",
    "email_sender_address",
  ],
  blog_config: ["blog_default_author_name"],
  contact: [
    "company_slogan",
    "company_founding_year",
    "contact_address",
    "contact_email",
    "contact_phone",
  ],
  social: ["social_links", "link_app_store", "link_google_play"],
  hero: ["home_hero_video_id"],
  marketing: [
    "marketing_trial_image",
    "marketing_award_image_1",
    "marketing_award_image_2",
  ],
  integrations: ["integration_google_maps_embed"],
  footer: ["footer_copyright_text"],
};

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: SystemSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("contact");
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const [currentInitialSettings, setInitialSettings] =
    useState(initialSettings);
  const [socialLinksList, setSocialLinksList] = useState<SocialLink[]>([]);

  useEffect(() => {
    try {
      const parsed = settings.social_links
        ? JSON.parse(settings.social_links)
        : [];
      if (Array.isArray(parsed)) {
        setSocialLinksList(parsed);
      }
    } catch (e) {
      setSocialLinksList([]);
    }
  }, [settings.social_links]);

  const handleSave = async () => {
    setIsSaving(true);
    let hasError = false;
    const savedSettings = { ...settings };

    for (const key of Object.keys(settings)) {
      if (settings[key] !== currentInitialSettings[key]) {
        const result = await updateSystemSetting(key, settings[key]);
        if (!result.success) {
          hasError = true;
          setToast({
            show: true,
            message: result.message || `Error saving ${key}`,
            type: "error",
          });
        }
      }
    }

    if (!hasError) {
      setToast({
        show: true,
        message: "Settings saved successfully!",
        type: "success",
      });
      setInitialSettings(savedSettings);
    }

    setIsSaving(false);
  };

  const handleReset = () => {
    if (confirm("Reset this section to FACTORY DEFAULTS?")) {
      const keysToReset = CATEGORY_KEYS[activeCategory] || [];
      const newSettings = { ...settings };

      keysToReset.forEach((key) => {
        newSettings[key] = FACTORY_DEFAULTS[key] || "";
      });

      if (activeCategory === "social") {
        try {
          const defaultSocials = JSON.parse(FACTORY_DEFAULTS.social_links);
          setSocialLinksList(defaultSocials);
        } catch (e) {
          setSocialLinksList([]);
        }
      }

      setSettings(newSettings);
      setToast({
        show: true,
        message: "Restored factory defaults.",
        type: "success",
      });
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addSocialLink = () => {
    const newList = [...socialLinksList, { platform: "", url: "" }];
    setSocialLinksList(newList);
    handleChange("social_links", JSON.stringify(newList));
  };

  const removeSocialLink = (index: number) => {
    const newList = [...socialLinksList];
    newList.splice(index, 1);
    setSocialLinksList(newList);
    handleChange("social_links", JSON.stringify(newList));
  };

  const updateSocialLink = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const newList = [...socialLinksList];
    newList[index][field] = value;
    setSocialLinksList(newList);
    handleChange("social_links", JSON.stringify(newList));
  };

  const isChanged =
    JSON.stringify(settings) !== JSON.stringify(currentInitialSettings);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0",
                activeCategory === cat.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <div className="flex items-center gap-3">
                <cat.icon size={18} />
                <span>{cat.label}</span>
              </div>
              {activeCategory === cat.id && <ChevronRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {CATEGORIES.find((c) => c.id === activeCategory)?.label} Settings
            </h2>
            {isChanged && (
              <span className="text-xs text-amber-600 font-medium animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>

          <div className="p-6 space-y-6">
            {activeCategory === "general" && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Daily Email Send Limit
                    </label>
                    <Link
                      href="/admin/settings/email-logic"
                      target="_blank"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Info size={12} /> Logic Explained
                    </Link>
                  </div>
                  <input
                    type="number"
                    value={settings.newsletter_daily_limit || "100"}
                    onChange={(e) =>
                      handleChange("newsletter_daily_limit", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Audit Log Retention
                  </label>
                  <select
                    value={settings.audit_log_retention_days || "90"}
                    onChange={(e) =>
                      handleChange("audit_log_retention_days", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  >
                    <option value="0.0416">1 Hour (Testing)</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
              </>
            )}

            {activeCategory === "features" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block">
                      Maintenance Mode
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Disable public access to the site.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enable_maintenance_mode === "true"}
                      onChange={(e) =>
                        handleChange(
                          "enable_maintenance_mode",
                          String(e.target.checked)
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white block">
                      Public Registration
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow new users to sign up for newsletter.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.enable_public_registration === "true"}
                      onChange={(e) =>
                        handleChange(
                          "enable_public_registration",
                          String(e.target.checked)
                        )
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeCategory === "email_config" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Admin Notification Email
                  </label>
                  <input
                    type="email"
                    value={settings.admin_notification_email || ""}
                    onChange={(e) =>
                      handleChange("admin_notification_email", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Sender Name
                  </label>
                  <input
                    type="text"
                    value={settings.email_sender_name || ""}
                    onChange={(e) =>
                      handleChange("email_sender_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sender Email Address
                  </label>
                  <input
                    type="text"
                    value={settings.email_sender_address || ""}
                    onChange={(e) =>
                      handleChange("email_sender_address", e.target.value)
                    }
                    placeholder="onboarding@resend.dev"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Must be 'onboarding@resend.dev' (Free) or a verified domain
                    email (Paid). Falls back to .env if empty.
                  </p>
                </div>
              </>
            )}

            {activeCategory === "blog_config" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Default Blog Author
                </label>
                <input
                  type="text"
                  value={settings.blog_default_author_name || ""}
                  onChange={(e) =>
                    handleChange("blog_default_author_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {activeCategory === "contact" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Slogan
                  </label>
                  <input
                    type="text"
                    value={settings.company_slogan || ""}
                    onChange={(e) =>
                      handleChange("company_slogan", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Founding Year
                  </label>
                  <input
                    type="number"
                    value={settings.company_founding_year || ""}
                    onChange={(e) =>
                      handleChange("company_founding_year", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Office Address
                  </label>
                  <textarea
                    rows={3}
                    value={settings.contact_address || ""}
                    onChange={(e) =>
                      handleChange("contact_address", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Public Email
                    </label>
                    <input
                      type="email"
                      value={settings.contact_email || ""}
                      onChange={(e) =>
                        handleChange("contact_email", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={settings.contact_phone || ""}
                      onChange={(e) =>
                        handleChange("contact_phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {activeCategory === "social" && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Social Media Links
                    </label>
                  </div>
                  {socialLinksList.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No social links added yet.
                    </p>
                  )}
                  <div className="space-y-3">
                    {socialLinksList.map((link, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="w-1/3">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) =>
                              updateSocialLink(
                                index,
                                "platform",
                                e.target.value
                              )
                            }
                            placeholder="Platform"
                            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) =>
                              updateSocialLink(index, "url", e.target.value)
                            }
                            placeholder="URL"
                            className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <button
                          onClick={() => removeSocialLink(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addSocialLink}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600"
                  >
                    <Plus size={16} /> Add Social Link
                  </button>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        App Store (iOS)
                      </label>
                      <input
                        type="text"
                        value={settings.link_app_store || ""}
                        onChange={(e) =>
                          handleChange("link_app_store", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Google Play (Android)
                      </label>
                      <input
                        type="text"
                        value={settings.link_google_play || ""}
                        onChange={(e) =>
                          handleChange("link_google_play", e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeCategory === "hero" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Homepage Video URL (Embed)
                </label>
                <input
                  type="text"
                  value={settings.home_hero_video_id || ""}
                  onChange={(e) =>
                    handleChange("home_hero_video_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {activeCategory === "marketing" && (
              <>
                <div className="space-y-2">
                  <SettingsImageUploader
                    label="Trial Image URL"
                    value={settings.marketing_trial_image || ""}
                    onChange={(url) =>
                      handleChange("marketing_trial_image", url)
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <SettingsImageUploader
                      label="Award Image 1 URL"
                      value={settings.marketing_award_image_1 || ""}
                      onChange={(url) =>
                        handleChange("marketing_award_image_1", url)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <SettingsImageUploader
                      label="Award Image 2 URL"
                      value={settings.marketing_award_image_2 || ""}
                      onChange={(url) =>
                        handleChange("marketing_award_image_2", url)
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {activeCategory === "integrations" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Google Maps Embed URL
                </label>
                <textarea
                  rows={4}
                  value={settings.integration_google_maps_embed || ""}
                  onChange={(e) =>
                    handleChange(
                      "integration_google_maps_embed",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white font-mono text-xs"
                />
              </div>
            )}

            {activeCategory === "footer" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={settings.footer_copyright_text || ""}
                  onChange={(e) =>
                    handleChange("footer_copyright_text", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleReset}
              type="button"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset to Default</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isChanged || isSaving}
              className="inline-flex items-center justify-center px-6 py-2 space-x-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
