// Guest compare/favorites lists live in cookies as "3.7.12": tiny, server-readable, no client state to sync.
export const COMPARE_MAX = 4;
export const FAVORITES_MAX = 100;

// Cookie values are untrusted: keep only unique positive ints, capped.
export function parseIds(raw: string | undefined, max: number): number[] {
  const ids = (raw ?? "").split(".").map(Number).filter((n) => Number.isSafeInteger(n) && n > 0);
  return [...new Set(ids)].slice(0, max);
}

export const serializeIds = (ids: number[]) => ids.join(".");

// Removes id if present, appends it otherwise; a full list stays unchanged.
export function toggleId(ids: number[], id: number, max: number): number[] {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  return ids.length >= max ? ids : [...ids, id];
}
