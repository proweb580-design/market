// Stage 7 against the seeded Neon DB: creates two throwaway users and their orders,
// then deletes them and puts product stock back to what it was.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cartItems, carts, orders, products, users } from "@/db/schema";
import { addToCart, getCart } from "@/lib/cart";
import { checkoutSchema, createOrder, getOrder, listOrders, completeTestPayment } from "@/lib/orders";

const input = checkoutSchema.parse({ customerName: "Тест", customerPhone: "90 123 45 67", deliveryMethod: "pickup" });
const stamp = Date.now();
let owner: string;
let stranger: string;
let macbook: { id: number; stock: number; price: number };
let cable: { id: number; stock: number; price: number };

const stockOf = async (id: number) => (await db.select({ s: products.stockQuantity }).from(products).where(eq(products.id, id)))[0].s;

beforeAll(async () => {
  const rows = await db
    .select({ id: products.id, slug: products.slug, stock: products.stockQuantity, price: products.priceUzs })
    .from(products)
    .where(inArray(products.slug, ["macbook-air-m3", "baseus-usb-c-cable-2m"]));
  const bySlug = Object.fromEntries(rows.map((r) => [r.slug, r]));
  [macbook, cable] = [bySlug["macbook-air-m3"], bySlug["baseus-usb-c-cable-2m"]];
  [{ id: owner }, { id: stranger }] = await db
    .insert(users)
    .values([{ email: `orders-a-${stamp}@example.test` }, { email: `orders-b-${stamp}@example.test` }])
    .returning({ id: users.id });
});

afterAll(async () => {
  await db.delete(orders).where(inArray(orders.userId, [owner, stranger])); // items cascade
  await db.delete(users).where(inArray(users.id, [owner, stranger]));
  for (const p of [macbook, cable]) await db.update(products).set({ stockQuantity: p.stock }).where(eq(products.id, p.id));
  await db.$client.end();
});

describe("checkout input", () => {
  it("normalizes Uzbek phone numbers and requires an address for delivery", () => {
    expect(input.customerPhone).toBe("+998901234567");
    expect(checkoutSchema.safeParse({ ...input, customerPhone: "+998 (90) 123-45-67" }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...input, customerPhone: "12345" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...input, deliveryMethod: "delivery" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...input, deliveryMethod: "delivery", deliveryAddress: "Чиланзар 1" }).success).toBe(true);
  });
});

describe("orders", () => {
  let paid: string;

  it("refuses an empty cart", async () => {
    expect(await createOrder(owner, input)).toEqual({ error: "Корзина пуста" });
  });

  it("creates an order with server-side totals, reserves stock and empties the cart", async () => {
    await addToCart({ userId: owner }, macbook.id, 1);
    await addToCart({ userId: owner }, cable.id, 2);
    const result = await createOrder(owner, input);
    if (!("orderNumber" in result)) throw new Error(result.error);
    paid = result.orderNumber;

    const order = (await getOrder(owner, paid))!;
    expect(order).toMatchObject({ status: "pending_payment", paymentStatus: "unpaid", totalUzs: macbook.price + 2 * cable.price });
    expect(order.items.map((i) => [i.productId, i.quantity, i.lineTotalUzs])).toEqual(
      expect.arrayContaining([[macbook.id, 1, macbook.price], [cable.id, 2, 2 * cable.price]]),
    );
    expect(await stockOf(macbook.id)).toBe(macbook.stock - 1);
    expect((await getCart({ userId: owner })).lines).toEqual([]);
  });

  it("success sets paid_test once; a repeated call changes nothing", async () => {
    expect(await completeTestPayment(owner, paid, "success")).toBe(true);
    expect(await completeTestPayment(owner, paid, "failure")).toBe(false);
    expect(await getOrder(owner, paid)).toMatchObject({ paymentStatus: "paid_test", status: "confirmed" });
    expect(await stockOf(macbook.id)).toBe(macbook.stock - 1); // the late "failure" did not restock
  });

  it("hides another user's order and refuses to pay it", async () => {
    expect(await getOrder(stranger, paid)).toBeNull();
    expect(await completeTestPayment(stranger, paid, "success")).toBe(false);
  });

  it("failure is not marked paid and returns the stock", async () => {
    await addToCart({ userId: owner }, cable.id, 3);
    const before = await stockOf(cable.id);
    const result = await createOrder(owner, input);
    if (!("orderNumber" in result)) throw new Error(result.error);
    expect(await stockOf(cable.id)).toBe(before - 3);
    expect(await completeTestPayment(owner, result.orderNumber, "failure")).toBe(true);
    expect(await getOrder(owner, result.orderNumber)).toMatchObject({ paymentStatus: "failed", status: "cancelled" });
    expect(await stockOf(cable.id)).toBe(before);
    expect((await listOrders(owner)).map((o) => o.orderNumber)).toEqual([result.orderNumber, paid]);
  });

  it("refuses to order more than is in stock", async () => {
    // Stock dropped after the item was put in the cart.
    await addToCart({ userId: owner }, macbook.id, 1);
    await db.update(products).set({ stockQuantity: 0 }).where(eq(products.id, macbook.id));
    expect(await createOrder(owner, input)).toEqual({ error: expect.stringContaining("нет в наличии") });
    const [cart] = await db.select({ id: carts.id }).from(carts).where(eq(carts.userId, owner));
    expect(await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id))).toHaveLength(1); // cart kept
    expect(await listOrders(owner)).toHaveLength(2); // no new order
  });
});
