const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

async function main() {
  const base = process.env.TEST_BASE_URL || "http://localhost:3030";
  const checks = [
    ["/", 200],
    ["/auth/login", 200],
    ["/auth/register", 200],
    ["/api/auth/session", 200],
    ["/dashboard", 307],
    ["/api/sessions", 401],
    ["/api/contacts/nonexistent", 401],
    ["/api/media/private.jpg", 401],
  ];
  for (const [path, expected] of checks) {
    const response = await fetch(`${base}${path}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, expected, `${path}: expected ${expected}, received ${response.status}`);
    await response.arrayBuffer();
    console.log(`PASS ${path}: ${response.status}`);
  }
  await new Promise((resolve, reject) => {
    const socket = io(base, { path: "/api/socket/io", addTrailingSlash: false, transports: ["websocket"], reconnection: false });
    const timer = setTimeout(() => { socket.close(); reject(new Error("Socket authentication check timed out")); }, 10000);
    socket.on("connect", () => { clearTimeout(timer); socket.close(); reject(new Error("Unauthenticated socket was accepted")); });
    socket.on("connect_error", (error) => {
      clearTimeout(timer);
      socket.close();
      if (!["Unauthorized", "Não autenticado"].includes(error.message)) return reject(error);
      console.log("PASS unauthenticated socket rejected");
      resolve();
    });
  });
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
