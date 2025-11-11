// src/app/admin/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { updateSystemSetting } from "./actions";
import { Loader2, Save } from "lucide-react";
import Toast from "@/components/shared/Toast";

type SystemSettings = {
  [key: string]: string;
};

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: SystemSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Need to update the 'initialSettings' state when saving
  const [currentInitialSettings, setInitialSettings] =
    useState(initialSettings);

  const handleSave = async () => {
    setIsSaving(true);
    let hasError = false;

    // Create a copy of the settings to compare against
    const savedSettings = { ...settings };

    // Save all settings that have changed
    for (const key of Object.keys(settings)) {
      if (settings[key] !== currentInitialSettings[key]) {
        // Compare against current state
        const result = await updateSystemSetting(key, settings[key]);
        if (!result.success) {
          hasError = true;
          setToast({
            show: true,
            message: result.message || "An unknown error occurred.",
            type: "error",
          });
          break; // Stop on first error
        }
      }
    }

    if (!hasError) {
      setToast({
        show: true,
        message: "Settings saved successfully!",
        type: "success",
      });
      // Update initialSettings to reflect the new saved state
      setInitialSettings(savedSettings);
    }

    setIsSaving(false);
  };

  const isChanged =
    JSON.stringify(settings) !== JSON.stringify(currentInitialSettings);

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Use a form element for semantic correctness */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        {/* --- THIS IS THE NEW GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Newsletter Settings Card (Column 1) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Newsletter
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="newsletter_daily_limit"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Daily Email Send Limit
                </label>
                <input
                  type="number"
                  id="newsletter_daily_limit"
                  value={settings.newsletter_daily_limit || "100"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      newsletter_daily_limit: e.target.value,
                    })
                  }
                  className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Set the total number of emails (newsletter + transactional)
                  that can be sent per day.
                </p>
              </div>
            </div>
          </div>

          {/* Audit Log Settings Card (Column 2) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Audit Log
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="audit_log_retention_days"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >
                  Log Retention Period
                </label>
                <select
                  id="audit_log_retention_days"
                  value={settings.audit_log_retention_days || "90"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      audit_log_retention_days: e.target.value,
                    })
                  }
                  className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="180">180 Days</option>
                  <option value="365">1 Year</option>
                  <option value="0">Keep Forever (Not Recommended)</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Automatically delete audit logs older than this period. "Keep
                  Forever" will disable pruning.
                </p>
              </div>
            </div>
          </div>

          {/* FUTURE SETTINGS:
            Just add another card here and it will wrap automatically.
            e.g.:
            <div className="bg-white ...">
              <div className="p-5 border-b ...">
                <h2 className="text-lg ...">New Feature</h2>
              </div>
              <div className="p-5 ...">
                ...
              </div>
            </div>
          */}
        </div>

        {/* --- SAVE BUTTON (MOVED) --- */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={!isChanged || isSaving}
            className="inline-flex items-center justify-center px-4 py-2 space-x-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </>
  );
}
