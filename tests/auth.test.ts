// Stage 6: password hashing, redirect safety, and guest -> account merge against the seeded Neon DB.
// Creates one throwaway user and guest cart; deleting the user cascades its cart and favorites.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { carts, users } from "@/db/schema";
import { safeCallbackUrl } from "@/lib/callback-url";
import { addToCart, getCart, mergeGuestCart } from "@/lib/cart";
import { getProductBySlug } from "@/lib/catalog";
import { addUserFavorites, getUserFavoriteIds, toggleUserFavorite } from "@/lib/favorites";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isRateLimited } from "@/lib/rate-limit";

const guest = { guestId: crypto.randomUUID() };
let userId: string;
let macbook: number; // stock 3
let cable: number; // stock 100

beforeAll(async () => {
  [macbook, cable] = await Promise.all(
    ["macbook-air-m3", "baseus-usb-c-cable-2m"].map(async (s) => (await getProductBySlug(s))!.product.id),
  );
  [{ id: userId }] = await db.insert(users).values({ email: `auth-test-${Date.now()}@example.test` }).returning({ id: users.id });
});

afterAll(async () => {
  await db.delete(users).where(eq(users.id, userId));
  await db.delete(carts).where(eq(carts.guestId, guest.guestId));
  await db.$client.end();
});

describe("passwords", () => {
  it("verifies only the right password and never stores it in plain text", async () => {
    const stored = await hashPassword("correct horse");
    expect(stored).not.toContain("correct horse");
    expect(await verifyPassword("correct horse", stored)).toBe(true);
    expect(await verifyPassword("wrong horse", stored)).toBe(false);
    expect(await verifyPassword("anything", null)).toBe(false); // Google-only account has no password
  });

  it("rate-limits after the limit", () => {
    const key = `test:${crypto.randomUUID()}`;
    expect([1, 2, 3].map(() => isRateLimited(key, 2))).toEqual([false, false, true]);
  });
});

describe("callbackUrl", () => {
  it("keeps same-site paths and rejects other sites", () => {
    expect(safeCallbackUrl("/cart")).toBe("/cart");
    for (const bad of ["https://evil.test", "//evil.test", "/\\evil.test", null, undefined]) {
      expect(safeCallbackUrl(bad)).toBe("/account");
    }
  });
});

describe("guest -> account merge", () => {
  it("moves the guest cart into the user cart, summing lines, then deletes the guest cart", async () => {
    await addToCart({ userId }, cable, 2);
    await addToCart(guest, cable, 3);
    await addToCart(guest, macbook, 1);
    await mergeGuestCart(guest.guestId, userId);
    const cart = await getCart({ userId });
    expect(cart.lines.map((l) => [l.productId, l.quantity])).toEqual(expect.arrayContaining([[cable, 5], [macbook, 1]]));
    expect((await getCart(guest)).lines).toEqual([]);
    await mergeGuestCart(guest.guestId, userId); // second sign-in: nothing left to merge, no change
    expect((await getCart({ userId })).itemCount).toBe(6);
  });

  it("adds guest favorites without duplicates and ignores unknown ids", async () => {
    await addUserFavorites(userId, [macbook]);
    await addUserFavorites(userId, [macbook, cable, 999_999]);
    expect(await getUserFavoriteIds(userId)).toEqual([macbook, cable]);
    await toggleUserFavorite(userId, macbook);
    expect(await getUserFavoriteIds(userId)).toEqual([cable]);
  });
});
