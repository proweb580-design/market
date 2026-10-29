// Runs against the seeded Neon DB; creates one throwaway guest cart and deletes it afterwards.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { carts } from "@/db/schema";
import { addToCart, getCart, removeFromCart, setCartQuantity, summarizeCart } from "@/lib/cart";
import { getProductBySlug } from "@/lib/catalog";

const guest = { guestId: crypto.randomUUID() };
let macbook: number; // stock 3, 15 900 000
let cable: number; // stock 100, 120 000
let soldOut: number; // stock 0

beforeAll(async () => {
  [macbook, cable, soldOut] = await Promise.all(
    ["macbook-air-m3", "baseus-usb-c-cable-2m", "sony-wh-1000xm5"].map(async (s) => (await getProductBySlug(s))!.product.id),
  );
});

afterAll(async () => {
  await db.delete(carts).where(eq(carts.guestId, guest.guestId));
  await db.$client.end();
});

describe("cart", () => {
  it("is empty for an unknown guest", async () => {
    expect(await getCart(guest)).toMatchObject({ lines: [], totalUzs: 0, ok: false });
  });

  it("adds items and recalculates line totals and the total", async () => {
    expect(await addToCart(guest, macbook, 1)).toEqual({ ok: true });
    expect(await addToCart(guest, cable, 2)).toEqual({ ok: true });
    expect(await addToCart(guest, cable, 1)).toEqual({ ok: true }); // merges into the same line
    const cart = await getCart(guest);
    expect(cart.lines.map((l) => [l.productId, l.quantity, l.lineTotalUzs])).toEqual(
      expect.arrayContaining([[macbook, 1, 15_900_000], [cable, 3, 360_000]]),
    );
    expect(cart).toMatchObject({ totalUzs: 16_260_000, itemCount: 4, ok: true });
  });

  it("refuses to add more than in stock or a sold-out product", async () => {
    expect(await addToCart(guest, macbook, 3)).toEqual({ error: expect.stringContaining("в корзине уже 1") });
    expect(await addToCart(guest, soldOut, 1)).toEqual({ error: "Нет в наличии" });
    expect(await addToCart(guest, 999_999, 1)).toEqual({ error: "Товар не найден" });
  });

  it("clamps quantity changes to 1..stock", async () => {
    await setCartQuantity(guest, macbook, 50);
    await setCartQuantity(guest, cable, 0);
    const cart = await getCart(guest);
    expect(cart.lines.find((l) => l.productId === macbook)?.quantity).toBe(3);
    expect(cart.lines.find((l) => l.productId === cable)?.quantity).toBe(1);
    expect(cart.totalUzs).toBe(3 * 15_900_000 + 120_000);
  });

  it("removes items down to an empty cart", async () => {
    await removeFromCart(guest, macbook);
    await removeFromCart(guest, cable);
    expect((await getCart(guest)).lines).toEqual([]);
  });

  it("flags lines that exceed current stock so checkout is blocked", () => {
    const row = { productId: 1, slug: "x", name: "X", brand: "B", images: [], priceUzs: 100, isActive: true };
    const cart = summarizeCart([
      { ...row, stockQuantity: 2, quantity: 5 },
      { ...row, productId: 2, stockQuantity: 0, quantity: 1 },
    ]);
    expect(cart.lines.map((l) => l.problem)).toEqual(["Доступно только 2 шт.", "Нет в наличии"]);
    expect(cart.ok).toBe(false);
  });
});
