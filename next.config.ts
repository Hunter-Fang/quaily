import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Cache images for 24h on Vercel edge (S3 URLs expire in 1h, this bridges the gap)
    minimumCacheTTL: 60 * 60 * 24,
  },
};

export default nextConfig;
