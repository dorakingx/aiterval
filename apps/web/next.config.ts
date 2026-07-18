import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@aiterval/core", "@aiterval/content", "@aiterval/ui"],
};
export default nextConfig;
