import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { validateContactInput, type ContactApiResponse } from "@/lib/contact/schema";
import { deliverContactEmails } from "@/lib/contact/mailer";
import { rateLimit } from "@/lib/contact/rate-limit";
import { contactStore } from "@/lib/contact/store";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT = Number(process.env.CONTACT_RATE_LIMIT || 5); // submissions…
const RATE_WINDOW_MS = Number(process.env.CONTACT_RATE_WINDOW_MS || 10 * 60 * 1000); // …per 10 minutes per IP
const MIN_FILL_MS = 2500; // humans don't complete the form in < 2.5s

/** Extra origins (comma-separated) allowed to POST cross-origin, e.g. a static-export host. */
const allowedOrigins = (process.env.CONTACT_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

function json(body: ContactApiResponse, status: number, headers?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function clientIp(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Same-origin check (CSRF hardening). Returns CORS headers for allowed cross-origin callers. */
function checkOrigin(req: NextRequest): { ok: boolean; cors?: Record<string, string> } {
  const origin = req.headers.get("origin");
  if (!origin) return { ok: true }; // non-browser clients (curl, server-to-server)
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return { ok: false };
  }
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host && originHost === host) return { ok: true };
  if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
    return {
      ok: true,
      cors: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      },
    };
  }
  return { ok: false };
}

function fakeReference() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `SP-${d}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

export async function OPTIONS(req: NextRequest) {
  const { ok, cors } = checkOrigin(req);
  return new NextResponse(null, { status: ok ? 204 : 403, headers: cors });
}

export async function POST(req: NextRequest) {
  const origin = checkOrigin(req);
  if (!origin.ok) {
    return json({ ok: false, error: "forbidden", message: "Cross-origin requests are not allowed." }, 403);
  }
  const cors = origin.cors;

  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "bad_request", message: "Send the form as JSON." }, 415, cors);
  }

  const ip = clientIp(req);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return json(
      {
        ok: false,
        error: "rate_limited",
        message: `Too many messages from your network. Please try again in ${Math.ceil(limited.retryAfter / 60)} minute(s).`,
        retryAfter: limited.retryAfter,
      },
      429,
      { ...cors, "Retry-After": String(limited.retryAfter) },
    );
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return json({ ok: false, error: "bad_request", message: "Could not read the request." }, 400, cors);
  }
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return json({ ok: false, error: "bad_request", message: "Your message is too large." }, 413, cors);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "bad_request", message: "Invalid JSON payload." }, 400, cors);
  }

  // Spam traps: hidden honeypot field + impossibly fast completion.
  // Respond like a success so bots learn nothing; nothing is stored or sent.
  const honeypot = typeof body.website === "string" && body.website.trim() !== "";
  const startedAt = Number(body.startedAt);
  const tooFast = Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS;
  if (honeypot || tooFast) {
    console.warn(`[contact] Spam trap triggered (${honeypot ? "honeypot" : "too fast"}) from ${ip}`);
    return json({ ok: true, reference: fakeReference(), delivery: "queued" }, 200, cors);
  }

  const result = validateContactInput(body);
  if (!result.ok) {
    return json(
      {
        ok: false,
        error: "validation",
        message: "Please fix the highlighted fields.",
        fieldErrors: result.fieldErrors,
      },
      400,
      cors,
    );
  }

  try {
    const submission = await contactStore.create(result.data, {
      ip,
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300),
      referer: (req.headers.get("referer") ?? "").slice(0, 300),
    });

    const delivery = await deliverContactEmails(submission);
    await contactStore.markDelivery(submission.id, delivery.status, delivery.detail).catch((e) =>
      console.error("[contact] Could not record delivery status:", e),
    );

    // The message is safely stored either way; "queued" means a teammate will see it in the store
    // (and it can be re-sent) even though the email didn't go out right now.
    return json(
      {
        ok: true,
        reference: submission.reference,
        delivery: delivery.status === "sent" || delivery.status === "partial" ? "sent" : "queued",
      },
      201,
      cors,
    );
  } catch (error) {
    console.error("[contact] Failed to process submission:", error);
    return json(
      {
        ok: false,
        error: "server_error",
        message: "We couldn't save your message right now. Please try again in a moment.",
      },
      500,
      cors,
    );
  }
}

export function GET() {
  return NextResponse.json(
    { ok: false, error: "bad_request", message: "Use POST." },
    { status: 405, headers: { Allow: "POST, OPTIONS" } },
  );
}
