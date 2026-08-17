/**
 * Lightweight in-memory sliding-window rate limiter for serverless API routes.
 *
 * NOTE: memory is per warm lambda/instance. It is a meaningful deterrent
 * against casual abuse, not a hard guarantee across all concurrent instances.
 * Limits are intentionally conservative so a single instance catches most
 * automated traffic.
 */

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const buckets = new Map<string, number[]>();

function now(): number {
  return Date.now();
}

/**
 * Best-effort client IP from proxy headers. Falls back to 'unknown'.
 */
export function getClientIp(request: Request | { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return (
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('cf-connecting-ip')?.trim() ||
    'unknown'
  );
}

/**
 * Allow at most `limit` hits per `windowMs` for a key. Optionally combine
 * multiple key parts (e.g. ip + phone) so a single client hitting many targets
 * still consumes one bucket.
 */
export function rateLimit(
  request: Request | { headers: Headers },
  options: { limit: number; windowMs: number; key?: string },
): RateLimitResult {
  const key = options.key ?? getClientIp(request);
  const hits = buckets.get(key) ?? [];

  const cutoff = now() - options.windowMs;
  const recent = hits.filter((ts) => ts >= cutoff);

  if (recent.length >= options.limit) {
    buckets.set(key, recent);
    const oldest = recent[0] ?? cutoff;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now()) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now());
  buckets.set(key, recent);

  if (buckets.size > 10_000) {
    for (const [bucketKey, times] of buckets) {
      if (times.every((ts) => ts < cutoff)) buckets.delete(bucketKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Guard helper for API routes: returns a 429 NextResponse when the caller is
 * over the limit, otherwise null.
 */
export function rateLimitResponse(
  request: Request | { headers: Headers },
  options: { limit: number; windowMs: number; key?: string },
): Response | null {
  const result = rateLimit(request, options);
  if (result.allowed) return null;
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Too many requests. Please try again later.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfterSeconds),
      },
    },
  );
}
