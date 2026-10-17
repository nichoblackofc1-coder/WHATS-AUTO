import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const defaultDbUrl =
  "postgresql://postgres.vxadevpqbagtnwlomwka:Predestinado8221%24@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connection_limit=5";

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || defaultDbUrl,
      },
    },
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
