import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "bcryptjs", "@whiskeysockets/baileys", "systeminformation", "wa-sticker-formatter"],
};

export default nextConfig;
