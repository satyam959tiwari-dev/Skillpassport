import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getPrisma, isDatabaseConfigured } from "@/lib/db";
import type { ContactTopic, DeliveryStatus as PrismaDeliveryStatus } from "@/lib/generated/prisma/enums";
import type { ContactData } from "@/lib/contact/schema";

/**
 * Contact submission repository.
 *
 * - DATABASE_URL set   → PostgreSQL via Prisma (model ContactMessage in prisma/schema.prisma).
 *                        If the DB is unreachable, the message is written to the
 *                        JSONL fallback instead of being lost.
 * - DATABASE_URL unset → append-only JSON Lines file (./.data), with a dev warning.
 */

export type DeliveryStatus = "sent" | "partial" | "failed" | "not_configured";

export type ContactSubmission = ContactData & {
  id: string;
  reference: string;
  createdAt: string;
  meta: { ip: string; userAgent: string; referer: string };
};

export interface ContactStore {
  readonly kind: "postgres" | "jsonl";
  create(data: ContactData, meta: ContactSubmission["meta"]): Promise<ContactSubmission>;
  markDelivery(id: string, status: DeliveryStatus, detail?: string): Promise<void>;
}

function makeReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `SP-${date}-${rand}`;
}

/* ------------------------------------------------------------------ */
/* PostgreSQL via Prisma (model ContactMessage → table contact_messages) */
/* ------------------------------------------------------------------ */

/**
 * Normalise a client IP for the INET column: first x-forwarded-for entry, strip brackets / port /
 * zone id and the IPv4-mapped "::ffff:" prefix. Returns null unless it is a valid IPv4/IPv6
 * address, so an odd header value can never make the insert fail.
 */
export function toInetOrNull(raw: string | null | undefined): string | null {
  let ip = (raw ?? "").split(",")[0]?.trim() ?? "";
  if (!ip) return null;
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(ip); // [2001:db8::1]:443
  if (bracketed) ip = bracketed[1];
  else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.replace(/:\d+$/, ""); // 1.2.3.4:5678
  ip = ip.replace(/%[\w.-]+$/, ""); // fe80::1%eth0
  if (/^::ffff:\d{1,3}(\.\d{1,3}){3}$/i.test(ip)) ip = ip.slice(7);
  return isIP(ip) ? ip : null;
}

const toTopic = (id: string) => id.toUpperCase() as ContactTopic;
const toDelivery = (s: DeliveryStatus) => s.toUpperCase() as PrismaDeliveryStatus;

class PrismaContactStore implements ContactStore {
  readonly kind = "postgres" as const;

  async create(data: ContactData, meta: ContactSubmission["meta"]): Promise<ContactSubmission> {
    const prisma = getPrisma();
    if (!prisma) throw new Error("DATABASE_URL is not set");

    for (let attempt = 0; ; attempt++) {
      try {
        const row = await prisma.contactMessage.create({
          data: {
            reference: makeReference(),
            name: data.name,
            email: data.email,
            organization: data.organization || null,
            topic: toTopic(data.topic),
            subject: data.subject,
            message: data.message,
            consent: data.consent,
            ip: toInetOrNull(meta.ip),
            userAgent: meta.userAgent.slice(0, 300) || null,
            referer: meta.referer.slice(0, 300) || null,
          },
          select: { id: true, reference: true, createdAt: true },
        });
        return { ...data, id: row.id, reference: row.reference, createdAt: row.createdAt.toISOString(), meta };
      } catch (error) {
        // P2002 = unique constraint (reference collision — astronomically rare): retry with a new one
        if ((error as { code?: string }).code === "P2002" && attempt < 2) continue;
        throw error;
      }
    }
  }

  async markDelivery(id: string, status: DeliveryStatus, detail?: string) {
    const prisma = getPrisma();
    if (!prisma) return;
    await prisma.contactMessage.update({
      where: { id },
      data: { deliveryStatus: toDelivery(status), deliveryDetail: detail?.slice(0, 1000) ?? null },
    });
  }
}

/* ------------------------------------------------------------------ */
/* JSON Lines (no database configured / fallback)                      */
/* ------------------------------------------------------------------ */

class JsonLinesContactStore implements ContactStore {
  readonly kind = "jsonl" as const;
  private dirPromise: Promise<string> | null = null;

  /** Resolve a writable directory once: CONTACT_STORE_DIR → ./.data → OS temp (serverless). */
  private dir() {
    this.dirPromise ??= (async () => {
      const candidates = [
        process.env.CONTACT_STORE_DIR,
        path.join(process.cwd(), ".data"),
        path.join(os.tmpdir(), "skillpassport-data"),
      ].filter(Boolean) as string[];
      for (const dir of candidates) {
        try {
          await fs.mkdir(dir, { recursive: true });
          await fs.access(dir, fs.constants?.W_OK ?? 2);
          return dir;
        } catch {
          /* try next */
        }
      }
      throw new Error("No writable directory available for contact submissions.");
    })();
    return this.dirPromise;
  }

  private async append(record: unknown) {
    const dir = await this.dir();
    // Re-create on every write (cheap, idempotent) so a deleted/rotated folder never breaks intake
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, "contact-submissions.jsonl");
    await fs.appendFile(file, JSON.stringify(record) + "\n", { encoding: "utf8", mode: 0o600 });
  }

  async create(data: ContactData, meta: ContactSubmission["meta"]) {
    const now = new Date();
    const submission: ContactSubmission = {
      ...data,
      id: randomUUID(),
      reference: makeReference(now),
      createdAt: now.toISOString(),
      meta,
    };
    await this.append({ type: "submission", ...submission });
    return submission;
  }

  async markDelivery(id: string, status: DeliveryStatus, detail?: string) {
    await this.append({ type: "delivery", id, status, detail, at: new Date().toISOString() });
  }
}

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

const postgres = new PrismaContactStore();
const jsonl = new JsonLinesContactStore();
const g = globalThis as unknown as { __spContactFallbackIds?: Set<string>; __spWarnedNoDb?: boolean };
const fallbackIds = (g.__spContactFallbackIds ??= new Set<string>());

/** Chosen per call so editing .env.local in dev takes effect without a restart. */
export const contactStore = {
  get kind() {
    return isDatabaseConfigured() ? "postgres" : "jsonl";
  },

  async create(data: ContactData, meta: ContactSubmission["meta"]): Promise<ContactSubmission> {
    if (!isDatabaseConfigured()) {
      if (!g.__spWarnedNoDb && process.env.NODE_ENV !== "production") {
        g.__spWarnedNoDb = true;
        console.warn("[contact] DATABASE_URL is not set — saving submissions to .data/contact-submissions.jsonl.");
      }
      return jsonl.create(data, meta);
    }
    try {
      return await postgres.create(data, meta);
    } catch (error) {
      console.error(
        "[contact] Postgres insert failed — saving to the JSONL fallback instead:",
        describeDbError(error),
      );
      const saved = await jsonl.create(data, meta);
      fallbackIds.add(saved.id);
      return saved;
    }
  },

  async markDelivery(id: string, status: DeliveryStatus, detail?: string) {
    if (!isDatabaseConfigured() || fallbackIds.has(id)) {
      fallbackIds.delete(id);
      return jsonl.markDelivery(id, status, detail);
    }
    return postgres.markDelivery(id, status, detail);
  },
} satisfies ContactStore;

/** One-line, credential-free summary of a Prisma / driver error for logs. */
function describeDbError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 4; depth++) {
    const e = current as { name?: string; code?: unknown; message?: unknown; cause?: unknown; errors?: unknown[] };
    const message = typeof e.message === "string" ? e.message.replace(/\s+/g, " ").trim() : "";
    const code = typeof e.code === "string" ? e.code : "";
    const bit = [code, message.replace(/^Invalid `prisma\.\w+\.\w+\(\)` invocation:\s*/, "")].filter(Boolean).join(" ");
    if (bit) parts.push(bit);
    current = e.cause ?? (Array.isArray(e.errors) ? e.errors[0] : undefined);
  }
  return (parts.join(" ← ") || String(error)).replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgresql://***").slice(0, 400);
}
