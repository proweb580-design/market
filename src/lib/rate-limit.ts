import "server-only";

const hits = new Map<string, number[]>();

// shortcut: in-memory, per server instance; move to Neon/Redis if brute force shows up on Vercel's many instances.
export function isRateLimited(key: string, limit = 10, windowMs = 15 * 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}
