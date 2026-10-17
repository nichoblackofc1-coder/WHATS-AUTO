import { prisma } from "./prisma";
import { mkdir, readFile, writeFile, unlink, readdir, stat } from "node:fs/promises";
import path from "node:path";

const directory = path.join(process.cwd(), "data", "media");
const durable = () => process.env.VERCEL === "1" || process.env.GATEWAY_WORKER === "true";
export async function saveMediaFile(filename: string, data: Buffer) {
  if (durable()) {
    await prisma.$executeRaw`INSERT INTO "GatewayMedia" (filename, data, size) VALUES (${filename}, ${data}, ${data.length})
      ON CONFLICT (filename) DO UPDATE SET data = EXCLUDED.data, size = EXCLUDED.size`;
  } else {
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), data);
  }
}
export async function readMediaFile(filename: string): Promise<Buffer | null> {
  if (durable()) {
    const rows = await prisma.$queryRaw<Array<{ data: Uint8Array }>>`SELECT data FROM "GatewayMedia" WHERE filename = ${filename}`;
    if (rows[0]) return Buffer.from(rows[0].data);
  }
  return readFile(path.join(directory, filename)).catch(() => null);
}
export async function listMediaFiles() {
  const files = new Map<string, { name: string; size: number; createdAt: Date; modifiedAt: Date }>();
  if (durable()) {
    const rows = await prisma.$queryRaw<Array<{ filename: string; size: number; createdAt: Date }>>`SELECT filename, size, "createdAt" FROM "GatewayMedia"`;
    rows.forEach(row => files.set(row.filename, { name: row.filename, size: row.size, createdAt: row.createdAt, modifiedAt: row.createdAt }));
  }
  for (const name of await readdir(directory).catch(() => [])) {
    if (name === ".gitkeep" || files.has(name)) continue;
    const info = await stat(path.join(directory, name)).catch(() => null);
    if (info?.isFile()) files.set(name, { name, size: info.size, createdAt: info.birthtime, modifiedAt: info.mtime });
  }
  return files;
}
export async function removeMediaFile(filename: string) {
  let removed = 0;
  if (durable()) removed = await prisma.$executeRaw`DELETE FROM "GatewayMedia" WHERE filename = ${filename}`;
  await unlink(path.join(directory, filename)).then(() => { removed++; }).catch(() => {});
  return removed > 0;
}
