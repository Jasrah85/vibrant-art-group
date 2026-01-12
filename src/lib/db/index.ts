import "server-only";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Support either env var name, but prefer DATABASE_URL
const DB_URL = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;

function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    // This makes the failure obvious during build/deploy.
    throw new Error(
      `[db] Missing environment variable: ${name}. ` +
        `Set it in .env.local for local builds and in Vercel Project Settings for deployments.`
    );
  }
  return value;
}

// Create on demand (avoids some bundler edge cases)
const client = createClient({
  url: requireEnv("DATABASE_URL (or TURSO_DATABASE_URL)", DB_URL),
  authToken: requireEnv("TURSO_AUTH_TOKEN", DB_TOKEN),
});

export const db = drizzle(client, { schema });
