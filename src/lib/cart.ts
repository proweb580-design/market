import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, products } from "@/db/schema";

export const MAX_LINE_QUANTITY = 99;

// A cart belongs to a signed-in user or to an anonymous guest_id cookie.
export type CartOwner = { userId: string } | { guestId: string };

const ownedBy = (owner: CartOwner) => ("userId" in owner ? eq(carts.userId, owner.userId) : eq(carts.guestId, owner.guestId));

type CartRow = {
  productId: number;
  slug: string;
  name: string;
  brand: string;
  images: string[];
  priceUzs: number;
  stockQuantity: number;
  isActive: boolean;
  quantity: number;
};

// Prices and stock always come from the products table at read time, never from the cart or the browser.
export function summarizeCart(rows: CartRow[]) {
  const lines = rows.map((r) => ({
    ...r,
    lineTotalUzs: r.priceUzs * r.quantity,
    problem:
      !r.isActive || r.stockQuantity === 0
        ? "Нет в наличии"
        : r.quantity > r.stockQuantity
          ? `Доступно только ${r.stockQuantity} шт.`
          : null,
  }));
  return {
    lines,
    totalUzs: lines.reduce((s, l) => s + l.lineTotalUzs, 0),
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    // Checkout (stage 7) must call getCart again and refuse unless ok.
    ok: lines.length > 0 && lines.every((l) => !l.problem),
  };
}

export type Cart = ReturnType<typeof summarizeCart>;

export async function getCart(owner: CartOwner | undefined): Promise<Cart> {
  if (!owner) return summarizeCart([]);
  const rows = await db
    .select({
      productId: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      images: products.images,
      priceUzs: products.priceUzs,
      stockQuantity: products.stockQuantity,
      isActive: products.isActive,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .innerJoin(carts, eq(cartItems.cartId, carts.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(ownedBy(owner))
    .orderBy(asc(products.name));
  return summarizeCart(rows);
}

async function ensureCartId(owner: CartOwner, tx: Pick<typeof db, "insert"> = db) {
  const [cart] = await tx
    .insert(carts)
    .values(owner)
    .onConflictDoUpdate({ target: "userId" in owner ? carts.userId : carts.guestId, set: { updatedAt: new Date() } })
    .returning({ id: carts.id });
  return cart.id;
}

async function findCartId(owner: CartOwner) {
  const [cart] = await db.select({ id: carts.id }).from(carts).where(ownedBy(owner));
  return cart?.id;
}

const getProductStock = async (productId: number) =>
  (await db.select({ stock: products.stockQuantity, isActive: products.isActive }).from(products).where(eq(products.id, productId)))[0];

export async function addToCart(owner: CartOwner, productId: number, quantity: number): Promise<{ error: string } | { ok: true }> {
  const product = await getProductStock(productId);
  if (!product?.isActive) return { error: "Товар не найден" };
  if (product.stock === 0) return { error: "Нет в наличии" };

  const cartId = await ensureCartId(owner);
  const [existing] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
  const inCart = existing?.quantity ?? 0;
  const next = inCart + quantity;
  const limit = Math.min(product.stock, MAX_LINE_QUANTITY);
  if (next > limit) {
    return { error: `Можно не больше ${limit} шт.${inCart ? ` (в корзине уже ${inCart})` : ""}` };
  }

  // shortcut: read-then-write can race under parallel adds; the order step re-checks stock in a transaction.
  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity: next })
    .onConflictDoUpdate({ target: [cartItems.cartId, cartItems.productId], set: { quantity: next } });
  return { ok: true };
}

// Clamps to 1..stock so the cart can never be set above what is available.
export async function setCartQuantity(owner: CartOwner, productId: number, quantity: number) {
  const [cartId, product] = await Promise.all([findCartId(owner), getProductStock(productId)]);
  if (!cartId || !product) return;
  const next = Math.max(1, Math.min(quantity, product.stock, MAX_LINE_QUANTITY));
  await db.update(cartItems).set({ quantity: next }).where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
}

export async function removeFromCart(owner: CartOwner, productId: number) {
  const cartId = await findCartId(owner);
  if (cartId) await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));
}

// After sign-in: moves the guest cart into the user's cart, summing quantities, then drops the guest cart.
// Lines above stock are kept and flagged by summarizeCart, so nothing is silently lost.
export async function mergeGuestCart(guestId: string, userId: string) {
  await db.transaction(async (tx) => {
    const [guest] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.guestId, guestId));
    if (!guest) return;
    const userCartId = await ensureCartId({ userId }, tx);
    const items = await tx.select().from(cartItems).where(eq(cartItems.cartId, guest.id));
    if (items.length) {
      await tx
        .insert(cartItems)
        .values(items.map((i) => ({ cartId: userCartId, productId: i.productId, quantity: i.quantity })))
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.productId],
          set: { quantity: sql`least(${cartItems.quantity} + excluded.quantity, ${MAX_LINE_QUANTITY})` },
        });
    }
    await tx.delete(carts).where(eq(carts.id, guest.id)); // items cascade
  });
}
