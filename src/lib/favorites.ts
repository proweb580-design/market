import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { favorites, products } from "@/db/schema";

export async function getUserFavoriteIds(userId: string) {
  const rows = await db
    .select({ productId: favorites.productId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(asc(favorites.createdAt));
  return rows.map((r) => r.productId);
}

// Ids come from forms and cookies: keep only existing products, skip duplicates.
export async function addUserFavorites(userId: string, productIds: number[]) {
  if (!productIds.length) return;
  const existing = await db.select({ id: products.id }).from(products).where(inArray(products.id, productIds));
  if (!existing.length) return;
  await db
    .insert(favorites)
    .values(existing.map((p) => ({ userId, productId: p.id })))
    .onConflictDoNothing();
}

export async function toggleUserFavorite(userId: string, productId: number) {
  const removed = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
    .returning();
  if (!removed.length) await addUserFavorites(userId, [productId]);
}
