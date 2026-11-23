import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma client singleton (Prisma ORM 7 + node-postgres driver adapter).
 * Kept on globalThis so Next.js dev hot-reloads reuse one connection pool.
 * Works with local Postgres, Neon (`?sslmode=require`), Supabase, RDS…
 */

type DbState = { url: string; prisma: PrismaClient };
const g = globalThis as unknown as { __spPrisma?: DbState };

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

/**
 * node-postgres treats sslmode=require/prefer/verify-ca as verify-full and logs a warning;
 * make that explicit (managed providers like Neon use publicly trusted certificates).
 */
function normalizeUrl(raw: string) {
  try {
    const u = new URL(raw);
    const mode = u.searchParams.get("sslmode");
    if (mode && ["require", "prefer", "verify-ca"].includes(mode) && !u.searchParams.has("uselibpqcompat")) {
      u.searchParams.set("sslmode", "verify-full");
    }
    u.searchParams.delete("channel_binding"); // libpq-only option
    return u.toString();
  } catch {
    return raw;
  }
}

export function getPrisma(): PrismaClient | null {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return null;
  if (g.__spPrisma?.url !== raw) {
    void g.__spPrisma?.prisma.$disconnect().catch(() => {});
    const adapter = new PrismaPg({
      connectionString: normalizeUrl(raw),
      max: Number(process.env.DATABASE_POOL_MAX || 5),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    g.__spPrisma = {
      url: raw,
      prisma: new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      }),
    };
  }
  return g.__spPrisma.prisma;
}
