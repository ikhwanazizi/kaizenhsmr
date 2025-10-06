// src/components/layout/Footer.tsx

"use client"; // This component now needs client-side interactivity

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import {
  hrmsSubmenus,
  resourcesSubmenus,
  companySubmenus,
} from "@/data/submenus";
import { Facebook, Linkedin, Apple, Send, Loader2 } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (!email) {
      setMessage("Email address is required.");
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setMessage(data.message);
      setIsError(false);
      setEmail(""); // Clear input on success
    } catch (error: any) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#008080] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* TOP SECTION: LINKS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-10 mb-12">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Kaizen</h2>
            <p className="text-blue-200">
              Malaysia's Tier 1 <br /> Enterprise HR Solution
            </p>
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
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Subscribe to Kaizen's Newsletter
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="flex bg-[#525861] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="email"
                  placeholder="Your business email"
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-[#4a4f57] hover:bg-gray-500 text-white px-5 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </form>
            {message && (
              <p
                className={`mt-2 text-sm ${
                  isError ? "text-red-400" : "text-green-300"
                }`}
              >
                {message}
              </p>
            )}
          </div>

          {/* Social Media -- THIS SECTION IS NOW RESTORED */}
          <div className="flex flex-col justify-end md:justify-start text-center">
            <h3 className="text-lg font-semibold mb-4">Follow us</h3>
            <div className="flex space-x-4 justify-center">
              <a
                href="#"
                aria-label="Facebook"
                className="bg-white hover:bg-yellow-400 text-[#32353a] p-3 rounded-full transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="bg-white hover:bg-yellow-400 text-[#32353a] p-3 rounded-full transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Mobile App Downloads -- THIS SECTION IS NOW RESTORED */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">
              Download the Mobile App
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="#"
                className="bg-black hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Apple size={24} />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="bg-black hover:bg-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M6.375 21.25c-.287 0-.575-.063-.844-.194a1.25 1.25 0 0 1-.861-1.22l.983-6.685L.23 7.828a1.25 1.25 0 0 1 .687-2.132l6.76-.585L10.66.31a1.25 1.25 0 0 1 2.238 0l2.982 4.801 6.76.585a1.25 1.25 0 0 1 .688 2.132l-5.423 5.324.983 6.685a1.25 1.25 0 0 1-1.705 1.413L12 18.273l-5.781 3.783a1.248 1.248 0 0 1-.844.194z"
                    opacity=".4"
                  />
                  <path d="M21.393 9.4l-9.358-5.347a1.25 1.25 0 0 0-1.875 1.083v10.693a1.25 1.25 0 0 0 1.875 1.083l9.358-5.347a1.25 1.25 0 0 0 0-2.166z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">GET IT ON</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-8 border-t border-white/20 text-center text-blue-200 text-sm">
          © KaiZenHR Sdn Bhd 2025. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
