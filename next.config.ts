import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules compatibility
// This is needed because next-pwa might use __dirname internally
interface GlobalWithDirname {
  __dirname?: string;
}

const globalWithDirname = globalThis as GlobalWithDirname;

if (typeof globalWithDirname.__dirname === "undefined") {
  try {
    // Check if we're in an ES module context
    const metaUrl = (import.meta as { url?: string })?.url;
    if (typeof metaUrl !== "undefined") {
      const __filename = fileURLToPath(metaUrl);
      globalWithDirname.__dirname = path.dirname(__filename);
    } else {
      globalWithDirname.__dirname = process.cwd();
    }
  } catch {
    globalWithDirname.__dirname = process.cwd();
  }
}

import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default pwaConfig(nextConfig);
