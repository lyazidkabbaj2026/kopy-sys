import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg", "apify-client", "proxy-agent"],
};

export default nextConfig;
