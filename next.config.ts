import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.twocontinents.com",
      },
    ],
  },
};

export default nextConfig;
