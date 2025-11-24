import Link from "next/link";
import { getPublicSettings } from "@/lib/public-settings";
import FooterNewsletterForm from "./FooterNewsletterForm";

import {
  hrmsSubmenus,
  resourcesSubmenus,
  companySubmenus,
} from "@/data/submenus";

import {
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Github,
  Gitlab,
  Twitch,
  Dribbble,
  Slack,
  Globe,
  Smartphone,
} from "lucide-react";

// ADD THESE
export const dynamic = "force-dynamic";
export const revalidate = 0;

const getSocialIcon = (platformName: string) => {
  const name = platformName.toLowerCase().trim();
  if (name.includes("facebook")) return Facebook;
  if (name.includes("linkedin")) return Linkedin;
  if (name.includes("twitter") || name.includes("x.com") || name === "x")
    return Twitter;
  if (name.includes("youtube")) return Youtube;
  if (name.includes("instagram")) return Instagram;
  if (name.includes("github")) return Github;
  if (name.includes("gitlab")) return Gitlab;
  if (name.includes("twitch")) return Twitch;
  if (name.includes("dribbble")) return Dribbble;
  if (name.includes("slack")) return Slack;
  if (name.includes("tiktok")) return Smartphone;
  return Globe;
};

export default async function Footer() {
  const settings = await getPublicSettings();
  const socialLinks = Array.isArray(settings.social_links)
    ? settings.social_links
    : [];

  return (
    <footer className="bg-[#008080] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* TOP SECTION */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 mb-12">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Kaizen</h2>
            <p className="text-blue-200">{settings.company_slogan}</p>
          </div>

          {/* HRMS Links */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">HRMS</h3>
            <ul className="space-y-2 text-blue-200 md:columns-2">
              {hrmsSubmenus.map((item, index) => (
                <li key={index} className="break-inside-avoid">
                  <Link
                    href={item.path}
                    className="hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-y-12 lg:contents">
            {/* Resources */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-blue-200">
                {resourcesSubmenus.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.path}
                      className="hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-blue-200">
                {companySubmenus.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.path}
                      className="hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* BORDER */}
        <div className="border-t border-white/20"></div>

        {/* BOTTOM SECTION: ACTIONS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 items-start">
          {/* Newsletter */}
          <FooterNewsletterForm />

          {/* Social Media */}
          <div className="flex flex-col justify-end md:justify-start text-center">
            <h3 className="text-lg font-semibold mb-4">Follow us</h3>
            <div className="flex space-x-4 justify-center flex-wrap gap-y-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((link, index) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="bg-white hover:bg-yellow-400 text-[#32353a] p-3 rounded-full transition-colors"
                      title={link.platform}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })
              ) : (
                <span className="text-blue-200 text-sm">
                  No links configured
                </span>
              )}
            </div>
          </div>

          {/* Mobile App Downloads */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">
              Download the Mobile App
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Only show if link exists and is not empty */}
              {settings.link_app_store &&
              settings.link_app_store.trim() !== "" ? (
                <a
                  href={settings.link_app_store}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {/* Embedded SVG for App Store Icon */}
                  <svg
                    className="w-6 h-6 text-white fill-current"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.71-3.06 1.58-.65.74-1.2 1.93-1.05 3.05 1.18.09 2.35-.64 3.04-1.52z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </a>
              ) : null}

              {settings.link_google_play &&
              settings.link_google_play.trim() !== "" ? (
                <a
                  href={settings.link_google_play}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {/* Embedded SVG for Google Play Icon */}
                  <div className="w-6 h-6 text-white">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-full h-full"
                    >
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </a>
              ) : null}
            </div>
            {/* Fallback message if both are empty */}
            {!settings.link_app_store && !settings.link_google_play && (
              <p className="text-blue-200 text-sm italic">Links coming soon.</p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/20 text-center text-blue-200 text-sm">
          <p>{settings.footer_copyright_text}</p>
        </div>
      </div>
    </footer>
  );
}
