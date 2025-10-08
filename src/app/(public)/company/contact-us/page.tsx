// src/app/(public)/company/contact-us/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

declare global {
  interface Window {
    turnstile: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    company: "",
    email: "",
    companySize: "",
    message: "",
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Load Turnstile script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Handle Turnstile events
  useEffect(() => {
    const handleSuccess = (e: any) => {
      setCaptchaToken(e.detail);
    };

    const handleError = () => {
      setCaptchaToken(null);
      setSubmitStatus({
        type: "error",
        message: "Captcha verification failed. Please try again.",
      });
    };

    const handleExpired = () => {
      setCaptchaToken(null);
    };

    window.addEventListener("turnstile-success", handleSuccess);
    window.addEventListener("turnstile-error", handleError);
    window.addEventListener("turnstile-expired", handleExpired);

    return () => {
      window.removeEventListener("turnstile-success", handleSuccess);
      window.removeEventListener("turnstile-error", handleError);
      window.removeEventListener("turnstile-expired", handleExpired);
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: "" });

    if (!captchaToken) {
      setSubmitStatus({
        type: "error",
        message: "Please complete the captcha verification",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formData,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      setSubmitStatus({
        type: "success",
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        fullName: "",
        contactNumber: "",
        company: "",
        email: "",
        companySize: "",
        message: "",
      });

      // Reset captcha
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setCaptchaToken(null);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-14 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your HR?
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our experts to discover how KaizenHR can empower
              your organization.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Status Message */}
          {submitStatus.type && (
            <div
              className={`mb-8 p-4 rounded-lg flex items-start gap-3 ${
                submitStatus.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  submitStatus.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {submitStatus.message}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Contact Info & Map */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Contact Information
                </h2>
                <p className="text-lg text-gray-600">
                  We're here to help. Reach out to us via phone, email, or visit
                  our office.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Our Office Address
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Suite D-05-01, 5th Floor, Block D, Plaza Mont Kiara
                      <br />
                      50480 Kuala Lumpur, Malaysia
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Email Us
                    </h3>
                    <a
                      href="mailto:inquiry@kaizenhrms.com"
                      className="text-blue-600 hover:underline"
                    >
                      inquiry@kaizenhrms.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Call Us
                    </h3>
                    <a
                      href="tel:+60362010242"
                      className="text-gray-600 hover:text-black"
                    >
                      +603-62010242
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3107.1002762799844!2d101.65145551015911!3d3.166211776708818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc48f1965b1f3f%3A0xd37a5feb10a562f9!2sKaiZenHR%20Sdn%20Bhd!5e1!3m2!1sen!2smy!4v1758764819207!5m2!1sen!2smy"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl shadow-lg border border-gray-200"
                ></iframe>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Send Us a Message
                </h2>
                <p className="text-gray-600">
                  Fill out the form and we'll get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                  </div>
                  {/* Contact Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="+60 12-345 6789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Your company name"
                    />
                  </div>
                  {/* Business Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="your.email@company.com"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Size *
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select company size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1,000 employees</option>
                    <option value="1000-1500">1,000-1,500 employees</option>
                    <option value="1501-2000">1,501-2,000 employees</option>
                    <option value="2001-3000">2,001-3,000 employees</option>
                    <option value="3000+">3,000+ employees</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    disabled={isSubmitting}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors duration-300 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Tell us about your HR needs..."
                  />
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center">
                  <div
                    ref={turnstileRef}
                    className="cf-turnstile"
                    data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    data-callback="onTurnstileSuccess"
                    data-error-callback="onTurnstileError"
                    data-expired-callback="onTurnstileExpired"
                  ></div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !captchaToken}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  By submitting, you agree to our{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Turnstile Callbacks */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onTurnstileSuccess = function(token) {
              window.dispatchEvent(new CustomEvent('turnstile-success', { detail: token }));
            };
            window.onTurnstileError = function() {
              window.dispatchEvent(new CustomEvent('turnstile-error'));
            };
            window.onTurnstileExpired = function() {
              window.dispatchEvent(new CustomEvent('turnstile-expired'));
            };
          `,
        }}
      />
    </div>
  );
};

export default ContactUsPage;
