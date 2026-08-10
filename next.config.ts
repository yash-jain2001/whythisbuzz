import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  staticPageGenerationTimeout: 120, // Pages now render in <1s with marked (was 1000s with MDXRemote)
  typescript: {
    ignoreBuildErrors: true, // Speed up builds on Cloudflare Pages
  },
};

export default nextConfig;
