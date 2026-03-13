import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "pg", "apify-client", "proxy-agent"],
};

export default nextConfig;
