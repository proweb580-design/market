import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cartItems, carts, orderItems, orders, products } from "@/db/schema";

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(1, "Введите имя").max(100, "Имя слишком длинное"),
    // Uzbek numbers: +998 and 9 digits; spaces, dashes and brackets are ignored.
    customerPhone: z
      .string()
      .transform((s) => s.replace(/[\s\-()]/g, ""))
      .transform((s) => (/^\d{9}$/.test(s) ? `+998${s}` : s.startsWith("998") ? `+${s}` : s))
      .pipe(z.string().regex(/^\+998\d{9}$/, "Телефон в формате +998 90 123 45 67")),
    deliveryMethod: z.enum(["delivery", "pickup"], "Выберите способ получения"),
    deliveryAddress: z.string().trim().max(300, "Адрес слишком длинный").optional(),
    comment: z.string().trim().max(500, "Комментарий слишком длинный").optional(),
  })
  .refine((d) => d.deliveryMethod === "pickup" || !!d.deliveryAddress, { message: "Введите адрес доставки", path: ["deliveryAddress"] });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

const newOrderNumber = () =>
  `TS-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

// One transaction: lock the products, re-check stock and price from the DB, snapshot them,
// reserve stock and empty the cart. Nothing from the browser is used for money.
export async function createOrder(userId: string, input: CheckoutInput): Promise<{ error: string } | { orderNumber: string }> {
  return db.transaction(async (tx) => {
    const [cart] = await tx.select({ id: carts.id }).from(carts).where(eq(carts.userId, userId));
    const lines = cart
      ? await tx
          .select({
            productId: products.id,
            name: products.name,
            brand: products.brand,
            priceUzs: products.priceUzs,
            stock: products.stockQuantity,
            isActive: products.isActive,
            quantity: cartItems.quantity,
          })
          .from(cartItems)
          .innerJoin(products, eq(cartItems.productId, products.id))
          .where(eq(cartItems.cartId, cart.id))
          .for("update", { of: products })
      : [];
    if (!lines.length) return { error: "Корзина пуста" };
    const short = lines.find((l) => !l.isActive || l.quantity > l.stock);
    if (short) {
      return { error: `«${short.name}»: ${!short.isActive || short.stock === 0 ? "нет в наличии" : `доступно только ${short.stock} шт.`}. Измените корзину.` };
    }

    const subtotalUzs = lines.reduce((s, l) => s + l.priceUzs * l.quantity, 0);
    const delivery = input.deliveryMethod === "delivery";
    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        orderNumber: newOrderNumber(),
        subtotalUzs,
        deliveryUzs: 0, // shortcut: no real logistics in the MVP (DECISIONS.md), delivery is free
        totalUzs: subtotalUzs,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryMethod: input.deliveryMethod,
        deliveryAddress: delivery ? input.deliveryAddress : null,
        comment: input.comment || null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });
    await tx.insert(orderItems).values(
      lines.map((l) => ({
        orderId: order.id,
        productId: l.productId,
        productNameSnapshot: `${l.brand} ${l.name}`,
        unitPriceUzs: l.priceUzs,
        quantity: l.quantity,
        lineTotalUzs: l.priceUzs * l.quantity,
      })),
    );
    for (const l of lines) {
      await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} - ${l.quantity}` }).where(eq(products.id, l.productId));
    }
    await tx.delete(cartItems).where(eq(cartItems.cartId, cart!.id));
    return { orderNumber: order.orderNumber };
  });
}

// Test payments only (simulation or Stripe test mode): no money. Only the owner's unpaid order changes, exactly once;
// a repeated or concurrent call matches no row and returns false.
export async function completeTestPayment(userId: string, orderNumber: string, outcome: "success" | "failure") {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .update(orders)
      .set(outcome === "success" ? { paymentStatus: "paid_test", status: "confirmed" } : { paymentStatus: "failed", status: "cancelled" })
      .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId), eq(orders.paymentStatus, "unpaid")))
      .returning({ id: orders.id });
    if (!order) return false;
    if (outcome === "failure") {
      // Failed payment releases the reserved stock.
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const i of items) {
        if (i.productId) await tx.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${i.quantity}` }).where(eq(products.id, i.productId));
      }
    }
    return true;
  });
}

// Owner check is part of the query: someone else's order number reads as "not found".
export async function getOrder(userId: string, orderNumber: string) {
  const [order] = await db.select().from(orders).where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)));
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(orderItems.id);
  return { ...order, items };
}

export const listOrders = (userId: string) => db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));

export const paymentLabels = {
  unpaid: { label: "Ожидает оплаты", tone: "accent" },
  paid_test: { label: "Оплачен (тест)", tone: "success" },
  failed: { label: "Оплата не прошла", tone: "danger" },
} as const;
