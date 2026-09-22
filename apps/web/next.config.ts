import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@sigilkode/engine","@sigilkode/renderer","@sigilkode/hnk-source-adapters"]
};

export default nextConfig;
