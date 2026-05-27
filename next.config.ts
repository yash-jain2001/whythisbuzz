import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  staticPageGenerationTimeout: 1000, // Prevent timeouts when compiling 420+ articles locally
};

export default nextConfig;
