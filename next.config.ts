import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "bcryptjs", "@whiskeysockets/baileys"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
