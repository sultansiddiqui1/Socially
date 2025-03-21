import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      dev: {
        sourceMaps: true,
      },
    } as any, // Temporary workaround
  },
};
