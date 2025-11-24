// src/components/layout/FooterNewsletterForm.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";

export default function FooterNewsletterForm() {
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
      setEmail("");
    } catch (error: any) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
