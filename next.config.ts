import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Don't fail production build due to ESLint (e.g. Unexpected any in actions)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if type warnings exist
    ignoreBuildErrors: true,
  },
  turbopack: {}, // Silences the warning about webpack config
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self)",
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
