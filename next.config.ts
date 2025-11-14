import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Required for Docker deployment
  output: 'standalone',

  // ✅ lets Next.js bundle 'playwright-core' in server code (API routes)
  serverExternalPackages: ["playwright-core"],

  // keep any other settings you had here
  async redirects() {
    return [
      {
        source: '/mamedee-travel-questionnaire',
        destination: 'https://custom-itinerary-travel-questionair.vercel.app',
        permanent: false, // Use 307 temporary redirect (change to true for 308 permanent)
      },
    ];
  },
};

export default nextConfig;
