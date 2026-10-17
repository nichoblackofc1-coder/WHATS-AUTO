import { loadEnvConfig } from "@next/env";
import { randomBytes } from "node:crypto";

loadEnvConfig(process.cwd());

if (!process.env.AUTH_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production");
  }
  process.env.AUTH_SECRET = randomBytes(32).toString("hex");
}
