import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable all dev indicators - prevents DOM elements that break Playwright selectors
  devIndicators: false,
  // Disable strict mode to reduce hydration-related overlays in dev
  reactStrictMode: false,
};

export default nextConfig;
