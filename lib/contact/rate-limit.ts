
/**
 * Sliding-window, in-memory rate limiter keyed by IP.
 * Per-instance only — for multi-instance deployments back this with Redis/Upstash.
 */

type Bucket = number[];
const g = globalThis as unknown as { __spContactRate?: Map<string, Bucket> };
const buckets = (g.__spContactRate ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - hits[0])) / 1000));
    return { ok: false as const, retryAfter, remaining: 0 };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return { ok: true as const, retryAfter: 0, remaining: limit - hits.length };
}
