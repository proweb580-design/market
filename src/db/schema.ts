import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// Text id to match the Auth.js Drizzle adapter (stage 6 adds accounts/sessions tables).
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  ...timestamps,
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    brand: text("brand").notNull(),
    shortDescription: text("short_description"),
    description: text("description"),
    // Money is whole UZS, never float.
    priceUzs: integer("price_uzs").notNull(),
    oldPriceUzs: integer("old_price_uzs"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    images: text("images").array().notNull().default(sql`'{}'::text[]`),
    specifications: jsonb("specifications").$type<Record<string, string>>().notNull().default({}),
    isFeatured: boolean("is_featured").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_active_idx").on(t.isActive),
    index("products_price_idx").on(t.priceUzs),
    index("products_brand_idx").on(t.brand),
    check("products_price_check", sql`${t.priceUzs} >= 0`),
    check("products_old_price_check", sql`${t.oldPriceUzs} is null or ${t.oldPriceUzs} >= 0`),
    check("products_stock_check", sql`${t.stockQuantity} >= 0`),
  ],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    guestId: text("guest_id"),
    updatedAt: timestamps.updatedAt,
  },
  (t) => [
    uniqueIndex("carts_user_idx").on(t.userId),
    uniqueIndex("carts_guest_idx").on(t.guestId),
    check("carts_owner_check", sql`${t.userId} is not null or ${t.guestId} is not null`),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
  },
  (t) => [primaryKey({ columns: [t.cartId, t.productId] }), check("cart_items_quantity_check", sql`${t.quantity} > 0`)],
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orderNumber: text("order_number").notNull().unique(),
    // pending_payment | confirmed | cancelled
    status: text("status").notNull().default("pending_payment"),
    // unpaid | paid_test | failed
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    subtotalUzs: integer("subtotal_uzs").notNull(),
    deliveryUzs: integer("delivery_uzs").notNull().default(0),
    totalUzs: integer("total_uzs").notNull(),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    deliveryMethod: text("delivery_method").notNull(), // delivery | pickup
    deliveryAddress: text("delivery_address"),
    comment: text("comment"),
    ...timestamps,
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    check("orders_status_check", sql`${t.status} in ('pending_payment', 'confirmed', 'cancelled')`),
    check("orders_payment_status_check", sql`${t.paymentStatus} in ('unpaid', 'paid_test', 'failed')`),
    check("orders_delivery_method_check", sql`${t.deliveryMethod} in ('delivery', 'pickup')`),
    check("orders_total_check", sql`${t.subtotalUzs} >= 0 and ${t.deliveryUzs} >= 0 and ${t.totalUzs} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    unitPriceUzs: integer("unit_price_uzs").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalUzs: integer("line_total_uzs").notNull(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check("order_items_quantity_check", sql`${t.quantity} > 0`),
    check("order_items_price_check", sql`${t.unitPriceUzs} >= 0 and ${t.lineTotalUzs} >= 0`),
  ],
);
