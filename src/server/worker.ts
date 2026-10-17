import "./env";
import { prisma } from "../lib/prisma";
import { randomUUID } from "node:crypto";
import { claimGatewayJobs, decryptGateway, finishGatewayJob, prepareGatewayQueue, type GatewayRequest } from "../lib/gateway-queue";

const workerId = randomUUID();
let stopping = false;
let leaseTimer: ReturnType<typeof setInterval> | undefined;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await prepareGatewayQueue();
  await prisma.$executeRaw`INSERT INTO "GatewayJob" (id, status, request) VALUES ('worker-lease', 'STOPPED', '') ON CONFLICT (id) DO NOTHING`;
  while (!stopping) {
    const claimed = await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'STARTING', response = ${workerId}, "updatedAt" = NOW()
      WHERE id = 'worker-lease' AND (status = 'STOPPED' OR "updatedAt" < NOW() - INTERVAL '45 seconds')`;
    if (claimed) break;
    await pause(3000);
  }
  if (stopping) return;
  leaseTimer = setInterval(async () => {
    try {
      const updated = await prisma.$executeRaw`UPDATE "GatewayJob" SET "updatedAt" = NOW() WHERE id = 'worker-lease' AND response = ${workerId}`;
      if (!updated) process.exit(1);
    } catch { process.exit(1); }
  }, 10000);
  require("./index");
  const localUrl = `http://127.0.0.1:${process.env.PORT || "3031"}`;
  let ready = false;
  for (let attempt = 0; attempt < 60 && !stopping; attempt++) {
    try { const response = await fetch(`${localUrl}/api/auth/session`); await response.arrayBuffer(); if (response.ok) { ready = true; break; } } catch {}
    await pause(1000);
  }
  if (!ready) throw new Error("O servidor interno não iniciou");
  await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'RUNNING', "updatedAt" = NOW() WHERE id = 'worker-lease' AND response = ${workerId}`;
  console.log("Serviço WhatsApp pronto para receber solicitações");
  let cleanupAt = Date.now();
  while (!stopping) {
    const jobs = await claimGatewayJobs();
    await Promise.all(jobs.map(async (job) => {
      try {
        const request = decryptGateway<GatewayRequest>(job.request);
        if (!request.path.startsWith("/api/") || request.path.startsWith("//") || request.path.includes("\\")) throw new Error("Rota interna inválida");
        const target = new URL(request.path, localUrl);
        if (target.origin !== localUrl) throw new Error("Destino inválido");
        const response = await fetch(target, { method: request.method, headers: request.headers, body: request.body ? Buffer.from(request.body, "base64") : undefined, redirect: "manual", signal: AbortSignal.timeout(40000) });
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => { if (!["connection", "content-length", "content-encoding", "transfer-encoding", "set-cookie"].includes(key)) headers[key] = value; });
        await finishGatewayJob(job.id, { status: response.status, headers, body: Buffer.from(await response.arrayBuffer()).toString("base64") });
      } catch (error) {
        await finishGatewayJob(job.id, { status: 502, headers: { "content-type": "application/json" }, body: Buffer.from(JSON.stringify({ status: false, error: "Não foi possível concluir a operação no serviço do WhatsApp", message: (error as Error).message })).toString("base64") });
      }
    }));
    if (Date.now() > cleanupAt) {
      await prisma.$executeRaw`DELETE FROM "GatewayJob" WHERE id <> 'worker-lease' AND "createdAt" < NOW() - INTERVAL '10 minutes'`;
      cleanupAt = Date.now() + 60000;
    }
    if (!jobs.length) await pause(500);
  }
}

async function shutdown() {
  stopping = true;
  if (leaseTimer) clearInterval(leaseTimer);
  await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'STOPPED', "updatedAt" = NOW() WHERE id = 'worker-lease' AND response = ${workerId}`.catch(() => {});
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
main().catch(async (error) => {
  console.error("Falha no serviço WhatsApp:", error.message);
  if (leaseTimer) clearInterval(leaseTimer);
  await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'STOPPED', "updatedAt" = NOW() WHERE id = 'worker-lease' AND response = ${workerId}`.catch(() => {});
  process.exit(1);
});
