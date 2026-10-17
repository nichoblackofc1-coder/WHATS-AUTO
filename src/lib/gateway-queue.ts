import { prisma } from "./prisma";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";

export type GatewayRequest = { path: string; method: string; headers: Record<string, string>; body: string | null };
export type GatewayResponse = { status: number; headers: Record<string, string>; body: string };
type Job = { id: string; status: string; request: string; response: string | null; createdAt: Date; updatedAt: Date };
export const usesGatewayWorker = () => process.env.VERCEL === "1" && process.env.GATEWAY_WORKER !== "true";

function encryptionKey() {
  if (!process.env.AUTH_SECRET) throw new Error("Configure AUTH_SECRET para conectar o serviço do WhatsApp");
  return createHash("sha256").update(process.env.AUTH_SECRET).digest();
}
export function encryptGateway(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}
export function decryptGateway<T>(value: string): T {
  const data = Buffer.from(value, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8"));
}
export async function prepareGatewayQueue() {
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "GatewayJob" (
    id TEXT PRIMARY KEY, status TEXT NOT NULL DEFAULT 'PENDING', request TEXT NOT NULL,
    response TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "GatewayJob_status_createdAt_idx" ON "GatewayJob" (status, "createdAt")`;
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "GatewayMedia" (
    filename TEXT PRIMARY KEY, data BYTEA NOT NULL, size INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`;
}
export async function gatewayIsOnline() {
  try {
    const rows = await prisma.$queryRaw<Array<{ online: boolean }>>`SELECT ("updatedAt" > NOW() - INTERVAL '30 seconds') AS online FROM "GatewayJob" WHERE id = 'worker-lease' AND status = 'RUNNING'`;
    return rows[0]?.online === true;
  } catch { return false; }
}
export async function enqueueGateway(request: GatewayRequest): Promise<GatewayResponse> {
  if (!await gatewayIsOnline()) throw new Error("O serviço do WhatsApp está iniciando ou indisponível. Aguarde e tente novamente.");
  const id = randomUUID();
  await prisma.$executeRaw`INSERT INTO "GatewayJob" (id, request) VALUES (${id}, ${encryptGateway(request)})`;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const rows = await prisma.$queryRaw<Job[]>`SELECT * FROM "GatewayJob" WHERE id = ${id}`;
    const job = rows[0];
    if (job?.status === "DONE" && job.response) {
      const result = decryptGateway<GatewayResponse>(job.response);
      await prisma.$executeRaw`DELETE FROM "GatewayJob" WHERE id = ${id}`;
      return result;
    }
  }
  // Do not retry commands automatically: the worker may already have sent the message.
  await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'CANCELLED', "updatedAt" = NOW() WHERE id = ${id} AND status = 'PENDING'`;
  throw new Error("O serviço demorou a responder. Confira o histórico antes de tentar enviar novamente.");
}
export async function forwardGateway(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const body = ["GET", "HEAD"].includes(request.method) ? null : Buffer.from(await request.arrayBuffer()).toString("base64");
  if (body && body.length > 6 * 1024 * 1024) return Response.json({ error: "Arquivo muito grande. O limite é 4 MB." }, { status: 413 });
  const headers: Record<string, string> = {};
  for (const key of ["cookie", "authorization", "x-api-key", "content-type", "accept", "origin"]) {
    const value = request.headers.get(key);
    if (value) headers[key] = value;
  }
  headers.host = url.host;
  headers["x-forwarded-host"] = url.host;
  headers["x-forwarded-proto"] = url.protocol.replace(":", "");
  try {
    const result = await enqueueGateway({ path: url.pathname + url.search, method: request.method, headers, body });
    return new Response(result.status === 204 || result.status === 304 ? null : new Uint8Array(Buffer.from(result.body, "base64")), { status: result.status, headers: result.headers });
  } catch (error) {
    return Response.json({ status: false, message: (error as Error).message, error: (error as Error).message }, { status: 503 });
  }
}
export function needsGateway(path: string, method: string): boolean {
  if (/^\/api\/(messages|groups|profile)(\/|$)/.test(path)) return true;
  if (/^\/api\/system\/monitor(\/|$)/.test(path)) return true;
  if (/^\/api\/contacts\/.*\/(block|unblock)$/.test(path)) return true;
  if (/^\/api\/chat\//.test(path) && method !== "GET") return true;
  if (/^\/api\/sessions(\/|$)/.test(path) && (method === "DELETE" || (method === "POST" && !/\/(access|settings|bot-config)$/.test(path)) || /\/qr$/.test(path))) return true;
  if (/^\/api\/sessions\/[^/]+$/.test(path) && method === "GET") return true;
  return false;
}
export async function claimGatewayJobs(limit = 4) {
  return prisma.$queryRaw<Job[]>`UPDATE "GatewayJob" SET status = 'RUNNING', "updatedAt" = NOW()
    WHERE id IN (SELECT id FROM "GatewayJob" WHERE status = 'PENDING' AND "createdAt" > NOW() - INTERVAL '1 minute'
      ORDER BY "createdAt" LIMIT ${limit} FOR UPDATE SKIP LOCKED) RETURNING *`;
}
export async function finishGatewayJob(id: string, result: GatewayResponse) {
  await prisma.$executeRaw`UPDATE "GatewayJob" SET status = 'DONE', response = ${encryptGateway(result)}, request = '', "updatedAt" = NOW() WHERE id = ${id}`;
}
