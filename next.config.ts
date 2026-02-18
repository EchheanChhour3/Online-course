import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "ik.imagekit.io",
        protocol: "https",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": "./",
      "@/components": "./components",
      "@/lib": "./lib",
      "@/app": "./app",
      "@/services": "./services",
      "@/public": "./public",
    };
    return config;
  },
  turbopack: {
    // Turbopack configuration for aliases
    resolveAlias: {
      "@": "./",
      "@/components": "./components",
      "@/lib": "./lib",
      "@/app": "./app",
      "@/services": "./services",
      "@/public": "./public",
    },
  },
};

export default nextConfig;
