import "server-only";
import { cache } from "react";
import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export const PAGE_SIZE = 12;

export const SORTS = {
  recommended: "По рекомендации",
  "price-asc": "Сначала дешёвые",
  "price-desc": "Сначала дорогие",
  new: "Новинки",
  discount: "По скидке",
} as const;
export type Sort = keyof typeof SORTS;

const optionalPrice = z.coerce.number().int().min(0).max(1_000_000_000).optional().catch(undefined);

// URL params are untrusted: invalid values fall back to defaults instead of erroring.
const paramsSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  category: z.string().regex(/^[a-z0-9-]+$/).max(100).optional().catch(undefined),
  brand: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]).map((b) => b.trim()).filter(Boolean).slice(0, 20))
    .optional()
    .catch(undefined),
  min: optionalPrice,
  max: optionalPrice,
  stock: z.literal("1").optional().catch(undefined),
  sort: z.enum(Object.keys(SORTS) as [Sort, ...Sort[]]).catch("recommended").default("recommended"),
  page: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});

export type CatalogParams = z.infer<typeof paramsSchema>;

export function parseCatalogParams(raw: Record<string, string | string[] | undefined>): CatalogParams {
  return paramsSchema.parse(raw);
}

export type ProductListItem = Pick<
  typeof products.$inferSelect,
  "id" | "slug" | "name" | "brand" | "priceUzs" | "oldPriceUzs" | "stockQuantity" | "images"
>;

const listColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  brand: products.brand,
  priceUzs: products.priceUzs,
  oldPriceUzs: products.oldPriceUzs,
  stockQuantity: products.stockQuantity,
  images: products.images,
};

// Escape LIKE wildcards so "%" in a query is matched literally.
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

const discountExpr = sql`case when ${products.oldPriceUzs} > ${products.priceUzs} then 1 - ${products.priceUzs}::float / ${products.oldPriceUzs} else 0 end`;

const orderBy: Record<Sort, ReturnType<typeof asc>[]> = {
  recommended: [desc(products.isFeatured), desc(sql`${products.stockQuantity} > 0`), asc(products.id)],
  "price-asc": [asc(products.priceUzs), asc(products.id)],
  "price-desc": [desc(products.priceUzs), asc(products.id)],
  new: [desc(products.createdAt), desc(products.id)],
  discount: [desc(discountExpr), asc(products.id)],
};

export async function getProducts(params: CatalogParams) {
  const conditions = [eq(products.isActive, true), eq(categories.isActive, true)];
  if (params.q) conditions.push(or(ilike(products.name, likePattern(params.q)), ilike(products.brand, likePattern(params.q)))!);
  if (params.category) conditions.push(eq(categories.slug, params.category));
  if (params.brand?.length) conditions.push(inArray(products.brand, params.brand));
  if (params.min !== undefined) conditions.push(gte(products.priceUzs, params.min));
  if (params.max !== undefined) conditions.push(lte(products.priceUzs, params.max));
  if (params.stock) conditions.push(gt(products.stockQuantity, 0));
  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select(listColumns)
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(...orderBy[params.sort])
      .limit(PAGE_SIZE)
      .offset((params.page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(where),
  ]);

  return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export function getCategories() {
  return db
    .select({ id: categories.id, slug: categories.slug, name: categories.name, imageUrl: categories.imageUrl, description: categories.description })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.id));
}

// cache(): generateMetadata and the page share one query per request.
export const getCategoryBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
  return row ?? null;
});

export async function getBrands(categorySlug?: string) {
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.isActive, true), categorySlug ? eq(categories.slug, categorySlug) : undefined))
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export const getProductBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({ product: products, category: { slug: categories.slug, name: categories.name } })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isActive, true), eq(categories.isActive, true)));
  return row ?? null;
});

export function getSimilarProducts(categoryId: number, excludeId: number, limit = 4) {
  return db
    .select(listColumns)
    .from(products)
    .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId), eq(products.isActive, true)))
    .orderBy(...orderBy.recommended)
    .limit(limit);
}

// Keeps the caller's order (the order items were added to compare/favorites).
export async function getProductsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ ...listColumns, specifications: products.specifications })
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.isActive, true)));
  return ids.flatMap((id) => rows.find((r) => r.id === id) ?? []);
}

export function getFeaturedProducts(limit = 8) {
  return db
    .select(listColumns)
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(asc(products.id))
    .limit(limit);
}
