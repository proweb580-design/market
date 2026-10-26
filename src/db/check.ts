// T025 smoke test: reads seeded data, writes rows to every user-owned table, checks constraints, cleans up.
import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { cartItems, carts, categories, favorites, orderItems, orders, products, users } from "./schema";

process.loadEnvFile(".env.local");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  const cats = await db.select().from(categories);
  const prods = await db.select().from(products);
  assert.ok(cats.length > 0 && prods.length > 0, "run npm run db:seed first");
  console.log(`read: ${cats.length} categories, ${prods.length} products`);

  const product = prods[0];
  const [user] = await db.insert(users).values({ email: `check-${Date.now()}@example.test`, name: "DB check" }).returning();
  try {
    await db.insert(favorites).values({ userId: user.id, productId: product.id });
    const [cart] = await db.insert(carts).values({ userId: user.id }).returning();
    await db.insert(cartItems).values({ cartId: cart.id, productId: product.id, quantity: 2 });
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        orderNumber: `CHECK-${Date.now()}`,
        subtotalUzs: product.priceUzs * 2,
        totalUzs: product.priceUzs * 2,
        customerName: "DB check",
        customerPhone: "+998000000000",
        deliveryMethod: "pickup",
      })
      .returning();
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: product.id,
      productNameSnapshot: product.name,
      unitPriceUzs: product.priceUzs,
      quantity: 2,
      lineTotalUzs: product.priceUzs * 2,
    });

    assert.equal((await db.select().from(favorites).where(eq(favorites.userId, user.id))).length, 1);
    assert.equal((await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)))[0].quantity, 2);
    assert.equal((await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)))[0].lineTotalUzs, product.priceUzs * 2);
    console.log("write: favorite, cart, order and order item saved and read back");

    await assert.rejects(db.insert(favorites).values({ userId: user.id, productId: product.id }), "duplicate favorite must fail");
    await assert.rejects(db.insert(cartItems).values({ cartId: cart.id, productId: prods[1].id, quantity: 0 }), "quantity 0 must fail");
    await assert.rejects(db.update(orders).set({ paymentStatus: "paid" }).where(eq(orders.id, order.id)), "unknown payment status must fail");
    console.log("constraints: duplicate favorite, zero quantity and bad payment status rejected");
  } finally {
    await db.delete(orders).where(eq(orders.userId, user.id)); // order_items cascade
    await db.delete(users).where(eq(users.id, user.id)); // favorites, carts, cart_items cascade
  }
  console.log("OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
