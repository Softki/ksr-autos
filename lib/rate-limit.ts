/**
 * Tiny in-memory token-bucket rate limiter.
 *
 * Good enough for the single-instance v1 deployment. Replace with Upstash
 * Redis or a similar shared store when scaling to multiple instances.
 */

interface Bucket {
  tokens: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

interface CheckResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

interface Options {
  /** Maximum tokens in the window. */
  limit: number;
  /** Window size in seconds. */
  windowSec: number;
}

export function rateLimit(key: string, { limit, windowSec }: Options): CheckResult {
  const now = Date.now();
  const ttl = windowSec * 1000;

  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { tokens: limit, resetAt: now + ttl };
    buckets.set(key, bucket);
  }

  // Periodically clear expired buckets (cheap memory hygiene).
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  if (bucket.tokens <= 0) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.tokens -= 1;
  return { ok: true, remaining: bucket.tokens, retryAfter: 0 };
}

/**
 * SHA-256 hash of an identifier (IP, email, etc.) — used for storing
 * non-identifiable rate-limit keys in logs/db.
 */
export async function hashIdentifier(value: string): Promise<string> {
  const enc = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
