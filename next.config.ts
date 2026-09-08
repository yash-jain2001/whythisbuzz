import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  staticPageGenerationTimeout: 120,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
