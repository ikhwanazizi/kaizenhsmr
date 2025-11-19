// src/app/admin/settings/SettingsClient.tsx
"use client";

import { useState } from "react";
import { updateSystemSetting } from "./actions";
import { Loader2, Save, Info, AlertTriangle, X } from "lucide-react";
import Toast from "@/components/shared/Toast";
import Link from "next/link";

type SystemSettings = {
  [key: string]: string;
};

// --- Simple Confirmation Modal Component ---
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  newValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newValue: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold">Warning: Limit Change</h3>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            You are changing the Daily Email Limit to{" "}
            <strong>{newValue}</strong>.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Wait!</strong> Do you actually have a paid plan with
              Resend?
              <br />
              <br />
              If you are on the <strong>Free Tier</strong>, increasing this
              number above 100 will cause emails to fail and may break your
              "Contact Us" form for the rest of the day.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Yes, Change It Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // Modal State
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [currentInitialSettings, setInitialSettings] =
    useState(initialSettings);

  // 1. Intercept the Save Action
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if limit has changed AND is different from initial
    const limitChanged =
      settings.newsletter_daily_limit !==
      currentInitialSettings.newsletter_daily_limit;

    if (limitChanged) {
      // If changed, show modal first
      setShowLimitModal(true);
    } else {
      // If not changed (or other fields changed), save immediately
      handleSave();
    }
  };

  // 2. The Actual Save Logic
  const handleSave = async () => {
    setShowLimitModal(false); // Close modal if open
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
            message: result.message || "An unknown error occurred.",
            type: "error",
          });
          break;
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        onConfirm={handleSave}
        newValue={settings.newsletter_daily_limit || "0"}
      />

      <form onSubmit={onFormSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Newsletter Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Newsletter
              </h2>
              {/* LINK TO EXPLAINER PAGE */}
              <Link
                href="/admin/settings/email-logic"
                target="_blank"
                className="flex items-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
              >
                <Info size={14} className="mr-1" />
                How it works?
              </Link>
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
                  <br />
                  <span className="text-amber-600 dark:text-amber-500 font-medium mt-1 inline-block">
                    Default is 100 for Free Tier.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Audit Log Settings Card */}
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
                  <option value="0.0416">1 Hour (Testing)</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days (Recommended)</option>
                  <option value="180">180 Days</option>
                  <option value="365">1 Year</option>
                  <option value="0">Keep Forever (Not Recommended)</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Automatically delete audit logs older than this period.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
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
