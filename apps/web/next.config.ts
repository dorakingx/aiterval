import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@aiterval/core", "@aiterval/content", "@aiterval/ui"],
};
export default nextConfig;
