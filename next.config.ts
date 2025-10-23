import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ lets Next.js bundle 'playwright-core' in server code (API routes)
  serverExternalPackages: ["playwright-core"],
  // keep any other settings you had here
};

export default nextConfig;
