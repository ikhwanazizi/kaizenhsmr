"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === "User is banned") {
        // --- THIS IS THE UPDATED LOGIC ---
        // Instead of querying the table, we call our new secure function
        const { data: status, error: rpcError } = await supabase.rpc(
          "get_user_status_by_email",
          { _email: email }
        );

        if (rpcError) {
          // If the function fails for some reason, show the default
          setError("Your account is disabled. Please contact support.");
          return;
        }

        switch (status) {
          case "inactive":
            setError(
              "This account has been deactivated. If you think this is a mistake, reach out to support."
            );
            break;
          case "suspended":
            setError(
              "This account is temporarily suspended. Please reach out to our team for more details."
            );
            break;
          default:
            setError("Your account is disabled. Please contact support.");
            break;
        }
      } else {
        setError(error.message);
      }
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Admin Login
      </h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 mt-1 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Login
        </button>
        {error && (
          <p className="mt-2 text-sm text-center text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}
