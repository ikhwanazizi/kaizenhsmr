import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  eslint: {
    // This will allow your build to complete even if there are errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
