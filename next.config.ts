import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_GATEWAY_POLLING: process.env.VERCEL === "1" ? "true" : "false" },
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  serverExternalPackages: ["sharp", "bcryptjs", "@whiskeysockets/baileys", "systeminformation", "wa-sticker-formatter"],
};

export default nextConfig;
