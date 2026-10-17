import "../src/server/env";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { encode } from "next-auth/jwt";
import { prisma } from "../src/lib/prisma";
import { enqueueGateway, gatewayIsOnline } from "../src/lib/gateway-queue";
import { saveMediaFile, readMediaFile, removeMediaFile } from "../src/lib/media-storage";

async function main() {
  assert.equal(process.env.WHATSAPP_ENABLED, "false", "Execute os testes com WHATSAPP_ENABLED=false");
  process.env.GATEWAY_WORKER = "true";
  const user = await prisma.user.findFirst({ where: { role: "SUPERADMIN" }, select: { id: true, role: true, email: true, name: true } });
  assert.ok(user);
  const session = await prisma.session.findFirst({ select: { id: true, sessionId: true } });
  assert.ok(session);
  for (let attempt = 0; attempt < 60 && !await gatewayIsOnline(); attempt++) await new Promise(resolve => setTimeout(resolve, 1000));
  assert.equal(await gatewayIsOnline(), true, "O worker de teste precisa estar iniciado");
  const token = await encode({ token: { ...user, sub: user.id }, secret: process.env.AUTH_SECRET!, salt: "authjs.session-token", maxAge: 120 });
  const headers = { cookie: `authjs.session-token=${token}`, host: "localhost:3031", "x-forwarded-proto": "http" };
  for (const path of ["/api/sessions", `/api/sessions/${session.sessionId}`, `/api/chat/${session.sessionId}`, `/api/contacts/${session.sessionId}`]) {
    const result = await enqueueGateway({ path, method: "GET", headers, body: null });
    assert.equal(result.status, 200, `${path}: ${Buffer.from(result.body, "base64").toString().slice(0, 100)}`);
    console.log(`PASS fila autenticada: ${path.split('/').slice(0,3).join('/')}`);
  }
  const rejected = await enqueueGateway({ path: "/api/sessions", method: "GET", headers: {}, body: null });
  assert.equal(rejected.status, 401);
  console.log("PASS worker rejeita requisição sem autenticação");
  if (process.env.TEST_FRONTEND === "true") {
    const response = await fetch(`http://localhost:3030/api/sessions/${session.sessionId}`, { headers: { cookie: headers.cookie } });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.data.sessionId, session.sessionId);
    console.log("PASS encaminhamento HTTP autenticado do painel ao worker");
  }
  const filename = `${session.sessionId}-${randomUUID().replaceAll("-", "")}.txt`;
  try {
    await saveMediaFile(filename, Buffer.from("regressao-pt-BR"));
    assert.equal((await readMediaFile(filename))?.toString(), "regressao-pt-BR");
    const media = await enqueueGateway({ path: `/api/media/${filename}`, method: "GET", headers, body: null });
    assert.equal(media.status, 200);
    assert.equal(Buffer.from(media.body, "base64").toString(), "regressao-pt-BR");
    console.log("PASS mídia persistente e autorização na leitura");
  } finally {
    await removeMediaFile(filename);
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
