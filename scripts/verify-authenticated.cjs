const assert = require("node:assert/strict");
require("@next/env").loadEnvConfig(process.cwd());
const { PrismaClient } = require("@prisma/client");
const { io } = require("socket.io-client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst({ where: { role: "SUPERADMIN" }, select: { id: true, email: true, name: true, role: true } });
    assert.ok(user, "A configured administrator is required for this read-only validation");
    const { encode } = await import("next-auth/jwt");
    const cookieName = "authjs.session-token";
    const token = await encode({ token: { ...user, sub: user.id }, secret: process.env.AUTH_SECRET, salt: cookieName, maxAge: 120 });
    const cookie = `${cookieName}=${token}`;
    const base = "http://localhost:3030";
    const paths = ["", "sessions", "contacts", "groups", "chat", "inbox", "labels", "media", "scheduler", "broadcast", "autoreply", "bot-settings", "webhooks", "profile", "settings", "notifications", "users", "system-monitor", "sticker", "api-docs"];
    for (const path of paths.map((value) => `/dashboard${value ? `/${value}` : ""}`).concat(["/api/sessions", "/api/notifications", "/api/settings/system", "/api/users"])) {
      const response = await fetch(`${base}${path}`, { headers: { cookie }, redirect: "manual", signal: AbortSignal.timeout(30000) });
      await response.arrayBuffer();
      assert.equal(response.status, 200, `${path}: ${response.status}`);
      console.log(`PASS authenticated ${path}`);
    }
    await new Promise((resolve, reject) => {
      const socket = io(base, { path: "/api/socket/io", addTrailingSlash: false, transports: ["websocket"], extraHeaders: { cookie }, reconnection: false });
      const timer = setTimeout(() => { socket.close(); reject(new Error("Authenticated socket timed out")); }, 10000);
      socket.on("connect", () => { clearTimeout(timer); socket.close(); console.log("PASS authenticated socket"); resolve(); });
      socket.on("connect_error", (error) => { clearTimeout(timer); socket.close(); reject(error); });
    });
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
